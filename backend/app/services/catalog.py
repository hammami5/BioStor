import re
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Category, Product, ProductStatus, Store
from app.repositories.catalog import CategoryRepository, ProductRepository, VariantRepository
from app.repositories.orders import OrderRepository
from app.schemas.catalog import (
    CategoryCreate,
    CategoryUpdate,
    ProductCreate,
    ProductUpdate,
)


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug[:200] or "item"


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = CategoryRepository(db)

    async def list_categories(self, store: Store, include_inactive: bool = False):
        categories = await self.repo.list_by_store(store.id, include_inactive=include_inactive)
        result = []
        for category in categories:
            item = {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "position": category.position,
                "is_active": category.is_active,
            }
            product_repo = ProductRepository(self.db)
            item["product_count"] = len(await product_repo.list_active_by_store(store.id))
            result.append(item)
        return result

    async def create(self, store: Store, data: CategoryCreate) -> Category:
        slug = slugify(data.name)
        base = slug
        counter = 1
        while await self._slug_exists(store.id, slug):
            slug = f"{base}-{counter}"
            counter += 1
        categories = await self.repo.list_by_store(store.id, include_inactive=True)
        position = max([c.position for c in categories], default=-1) + 1
        category = Category(
            store_id=store.id,
            name=data.name.strip(),
            slug=slug,
            position=position,
        )
        return await self.repo.create(category)

    async def _slug_exists(self, store_id: int, slug: str) -> bool:
        return await self.repo.get_by_store_and_slug(store_id, slug) is not None

    async def update(self, store: Store, category_id: int, data: CategoryUpdate) -> Category:
        category = await self.repo.get_by_id(category_id)
        if not category or category.store_id != store.id:
            raise HTTPException(status_code=404, detail="Category not found")
        updates = data.model_dump(exclude_unset=True, exclude_none=True)
        for key, value in updates.items():
            setattr(category, key, value)
        return await self.repo.update(category)

    async def delete(self, store: Store, category_id: int) -> None:
        category = await self.repo.get_by_id(category_id)
        if not category or category.store_id != store.id:
            raise HTTPException(status_code=404, detail="Category not found")
        await self.repo.delete(category_id)


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ProductRepository(db)
        self.variant_repo = VariantRepository(db)
        self.category_repo = CategoryRepository(db)

    async def _ensure_category(self, store: Store, category_id: Optional[int]) -> Optional[int]:
        if category_id is None:
            return None
        category = await self.category_repo.get_by_id(category_id)
        if not category or category.store_id != store.id:
            raise HTTPException(status_code=400, detail="Category not found")
        return category_id

    async def create(self, store: Store, data: ProductCreate) -> Product:
        await self._ensure_category(store, data.category_id)
        product = Product(
            store_id=store.id,
            category_id=data.category_id,
            name=data.name.strip(),
            slug=await self._unique_slug(store.id, data.name),
            description=data.description,
            price=data.price,
            discount_price=data.discount_price,
            stock=data.stock,
            status=data.status,
            images=data.images or [],
            is_featured=data.is_featured,
        )
        product = await self.repo.create(product)
        if data.variant_groups:
            await self.variant_repo.replace_groups(
                product.id, [g.model_dump() for g in data.variant_groups]
            )
        return await self._load_detail(product)

    async def _unique_slug(self, store_id: int, name: str) -> str:
        slug = slugify(name)
        base = slug
        counter = 1
        while await self.repo.get_by_store_and_slug(store_id, slug, only_active=False) is not None:
            slug = f"{base}-{counter}"
            counter += 1
        return slug

    async def update(self, store: Store, product_id: int, data: ProductUpdate) -> Product:
        product = await self.repo.get_by_store(product_id, store.id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if data.category_id is not None:
            await self._ensure_category(store, data.category_id)
        if data.name:
            new_slug = await self._unique_slug(store.id, data.name)
            if new_slug != product.slug:
                product.slug = new_slug

        updates = data.model_dump(exclude_unset=True)
        for key, value in updates.items():
            if key == "variant_groups":
                continue
            if value is not None:
                setattr(product, key, value)
        product = await self.repo.update(product)

        if data.variant_groups is not None:
            await self.variant_repo.replace_groups(
                product.id, [g.model_dump() for g in data.variant_groups]
            )
        return await self._load_detail(product)

    async def set_status(self, store: Store, product_id: int, status: ProductStatus) -> Product:
        product = await self.repo.get_by_store(product_id, store.id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        product.status = status
        await self.repo.update(product)
        return await self._load_detail(product)

    async def duplicate(self, store: Store, product_id: int) -> Product:
        product = await self.repo.get_by_store(product_id, store.id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        new_product = Product(
            store_id=store.id,
            category_id=product.category_id,
            name=f"{product.name} (Copy)",
            slug=await self._unique_slug(store.id, f"{product.name} (Copy)"),
            description=product.description,
            price=product.price,
            discount_price=product.discount_price,
            stock=product.stock,
            status=ProductStatus.INACTIVE,
            images=list(product.images or []),
            is_featured=False,
        )
        new_product = await self.repo.create(new_product)

        groups = await self.variant_repo.list_groups(product.id)
        groups_payload = []
        for group in groups:
            groups_payload.append(
                {
                    "name": group.name,
                    "options": [
                        {
                            "value": opt.value,
                            "additional_price": float(opt.additional_price or 0),
                            "stock": opt.stock,
                        }
                        for opt in group.options
                    ],
                }
            )
        if groups_payload:
            await self.variant_repo.replace_groups(new_product.id, groups_payload)
        return await self._load_detail(new_product)

    async def delete(self, store: Store, product_id: int) -> None:
        product = await self.repo.get_by_store(product_id, store.id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        await self.repo.delete(product)

    async def _load_detail(self, product: Product) -> Product:
        return await self.repo.get_with_detail(product.id)

    async def enforce_plan_limit(self, store: Store) -> None:
        """Free plans can only have a limited number of active products."""
        from app.repositories.subscriptions import SubscriptionRepository, PlanRepository
        from app.models.enums import SubscriptionPlanCode

        subscription = await SubscriptionRepository(self.db).get_by_store(store.id)
        plan_code = subscription.plan_code if subscription else SubscriptionPlanCode.FREE
        plan = await PlanRepository(self.db).get_by_code(plan_code)
        if not plan:
            return
        current = await self.repo.count_by_store(store.id)
        if current >= plan.product_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Your {plan.name} plan allows up to {plan.product_limit} products. Upgrade to add more.",
            )
