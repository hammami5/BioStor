from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Product, ProductStatus, Store
from app.repositories.catalog import CategoryRepository, ProductRepository, VariantRepository
from app.repositories.store import StoreRepository, StoreSettingsRepository
from app.schemas.catalog import PublicProduct, PublicProductList


class PublicStoreService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.store_repo = StoreRepository(db)
        self.settings_repo = StoreSettingsRepository(db)
        self.category_repo = CategoryRepository(db)
        self.product_repo = ProductRepository(db)
        self.variant_repo = VariantRepository(db)

    async def get_store(self, slug: str) -> Store:
        store = await self.store_repo.get_by_slug(slug)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        if store.is_suspended or not store.is_active:
            raise HTTPException(status_code=404, detail="Store not found")
        settings = await self.settings_repo.get_by_store_id(store.id)
        if not settings:
            from app.models import StoreSettings

            settings = await self.settings_repo.create(StoreSettings(store_id=store.id))
        store.settings = settings
        return store

    async def public_store(self, slug: str, category_slug: str | None = None) -> PublicProductList:
        store = await self.get_store(slug)
        categories = await self.category_repo.list_by_store(store.id)
        products = await self.product_repo.list_active_by_store(store.id, category_slug)

        public_products = []
        for product in products:
            public_products.append(await self._to_public_product(product))

        return PublicProductList(
            products=public_products,
            categories=categories,
            store={
                "id": store.id,
                "store_name": store.store_name,
                "slug": store.slug,
                "logo": store.logo,
                "description": store.description,
                "instagram_username": store.instagram_username,
                "contact_email": store.contact_email,
                "contact_phone": store.contact_phone,
                "contact_address": store.contact_address,
                "contact_city": store.contact_city,
                "settings": {
                    "accent_color": store.settings.accent_color,
                    "button_style": store.settings.button_style.value
                    if hasattr(store.settings.button_style, "value")
                    else store.settings.button_style,
                    "theme": store.settings.theme.value
                    if hasattr(store.settings.theme, "value")
                    else store.settings.theme,
                    "currency": store.settings.currency,
                    "delivery_fee": float(store.settings.delivery_fee or 0),
                },
            },
        )

    async def public_product(self, slug: str, product_slug: str) -> PublicProduct:
        store = await self.get_store(slug)
        product = await self.product_repo.get_by_store_and_slug(store.id, product_slug)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return await self._to_public_product(product)

    async def _to_public_product(self, product: Product) -> PublicProduct:
        groups = await self.variant_repo.list_groups(product.id)
        public_groups = []
        for group in groups:
            options = []
            for option in group.options:
                in_stock = option.stock is None or option.stock > 0
                options.append(
                    {
                        "value": option.value,
                        "additional_price": float(option.additional_price or 0),
                        "in_stock": in_stock,
                    }
                )
            public_groups.append({"name": group.name, "options": options})

        return PublicProduct(
            id=product.id,
            name=product.name,
            slug=product.slug,
            description=product.description,
            price=float(product.price),
            discount_price=float(product.discount_price) if product.discount_price else None,
            images=list(product.images or []),
            stock=product.stock,
            in_stock=product.stock > 0,
            category_id=product.category_id,
            variant_groups=public_groups,
        )
