from typing import Optional, List, Tuple

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from app.models import Category, Product, ProductStatus, VariantGroup, VariantOption, Store


class CategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, category_id: int) -> Optional[Category]:
        result = await self.db.execute(select(Category).where(Category.id == category_id))
        return result.scalar_one_or_none()

    async def list_by_store(self, store_id: int, include_inactive: bool = False) -> List[Category]:
        query = select(Category).where(Category.store_id == store_id)
        if not include_inactive:
            query = query.where(Category.is_active.is_(True))
        query = query.order_by(Category.position.asc(), Category.id.asc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_store_and_slug(self, store_id: int, slug: str) -> Optional[Category]:
        result = await self.db.execute(
            select(Category).where(Category.store_id == store_id, Category.slug == slug)
        )
        return result.scalar_one_or_none()

    async def create(self, category: Category) -> Category:
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def update(self, category: Category) -> Category:
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete(self, category_id: int) -> None:
        from sqlalchemy import update
        await self.db.execute(
            update(Product).where(Product.category_id == category_id).values(category_id=None)
        )
        category = await self.get_by_id(category_id)
        if category:
            await self.db.delete(category)
        await self.db.commit()


class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, product_id: int) -> Optional[Product]:
        result = await self.db.execute(select(Product).where(Product.id == product_id))
        return result.scalar_one_or_none()

    async def get_by_store(self, product_id: int, store_id: int) -> Optional[Product]:
        result = await self.db.execute(
            select(Product).where(Product.id == product_id, Product.store_id == store_id)
        )
        return result.scalar_one_or_none()

    async def get_by_store_and_slug(
        self, store_id: int, slug: str, only_active: bool = True
    ) -> Optional[Product]:
        query = select(Product).where(Product.store_id == store_id, Product.slug == slug)
        if only_active:
            query = query.where(Product.status == ProductStatus.ACTIVE)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_with_detail(self, product_id: int) -> Optional[Product]:
        query = (
            select(Product)
            .where(Product.id == product_id)
            .options(
                selectinload(Product.variant_groups).selectinload(VariantGroup.options),
                joinedload(Product.category),
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_by_store(
        self,
        store_id: int,
        search: Optional[str] = None,
        category_id: Optional[int] = None,
        status: Optional[str] = None,
        sort: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Product], int]:
        conditions = [Product.store_id == store_id]
        if search:
            like = f"%{search}%"
            conditions.append(Product.name.ilike(like))
        if category_id:
            conditions.append(Product.category_id == category_id)
        if status:
            try:
                conditions.append(Product.status == ProductStatus(status))
            except ValueError:
                pass

        count_query = select(func.count(Product.id)).where(*conditions)
        total = (await self.db.execute(count_query)).scalar()

        query = select(Product).where(*conditions)
        if sort == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort == "stock_low":
            query = query.order_by(Product.stock.asc())
        elif sort == "newest":
            query = query.order_by(Product.created_at.desc())
        else:
            query = query.order_by(Product.created_at.desc())

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all(), total

    async def list_active_by_store(self, store_id: int, category_slug: Optional[str] = None) -> List[Product]:
        query = select(Product).where(
            Product.store_id == store_id,
            Product.status == ProductStatus.ACTIVE,
        )
        if category_slug:
            query = query.join(Category, Product.category_id == Category.id).where(
                Category.slug == category_slug
            )
        query = query.order_by(Product.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create(self, product: Product) -> Product:
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def update(self, product: Product) -> Product:
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def delete(self, product: Product) -> None:
        await self.db.delete(product)
        await self.db.commit()

    async def count_by_store(self, store_id: int) -> int:
        result = await self.db.execute(
            select(func.count(Product.id)).where(Product.store_id == store_id)
        )
        return result.scalar()

    async def low_stock_products(self, store_id: int, threshold: int = 5) -> List[Product]:
        result = await self.db.execute(
            select(Product).where(
                Product.store_id == store_id,
                Product.status == ProductStatus.ACTIVE,
                Product.stock <= threshold,
            )
        )
        return result.scalars().all()


class VariantRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_groups(self, product_id: int) -> List[VariantGroup]:
        result = await self.db.execute(
            select(VariantGroup)
            .where(VariantGroup.product_id == product_id)
            .options(selectinload(VariantGroup.options))
            .order_by(VariantGroup.position.asc())
        )
        return result.scalars().all()

    async def replace_groups(
        self,
        product_id: int,
        groups: List[dict],
    ) -> None:
        from sqlalchemy import delete

        await self.db.execute(delete(VariantGroup).where(VariantGroup.product_id == product_id))
        for idx, group in enumerate(groups):
            new_group = VariantGroup(
                product_id=product_id,
                name=group.get("name", "Option"),
                position=idx,
            )
            self.db.add(new_group)
            await self.db.flush()
            for oidx, opt in enumerate(group.get("options", [])):
                option = VariantOption(
                    group_id=new_group.id,
                    value=opt.get("value", ""),
                    position=oidx,
                    additional_price=opt.get("additional_price") or 0,
                    stock=opt.get("stock"),
                )
                self.db.add(option)
        await self.db.commit()
