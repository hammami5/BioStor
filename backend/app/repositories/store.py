from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Store, StoreSettings


class StoreRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, store_id: int) -> Optional[Store]:
        result = await self.db.execute(select(Store).where(Store.id == store_id))
        return result.scalar_one_or_none()

    async def get_by_owner_id(self, owner_id: int) -> Optional[Store]:
        result = await self.db.execute(select(Store).where(Store.owner_id == owner_id))
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Store]:
        result = await self.db.execute(select(Store).where(Store.slug == slug.lower()))
        return result.scalar_one_or_none()

    async def create(self, store: Store) -> Store:
        self.db.add(store)
        await self.db.commit()
        await self.db.refresh(store)
        return store

    async def update(self, store: Store) -> Store:
        await self.db.commit()
        await self.db.refresh(store)
        return store

    async def slug_exists(self, slug: str, exclude_id: Optional[int] = None) -> bool:
        query = select(Store.id).where(Store.slug == slug.lower())
        if exclude_id:
            query = query.where(Store.id != exclude_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def list_stores(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        include_suspended: bool = True,
    ) -> list[Store]:
        query = select(Store).order_by(Store.created_at.desc())
        if search:
            like = f"%{search}%"
            query = query.where(
                (Store.store_name.ilike(like)) | (Store.slug.ilike(like))
            )
        if not include_suspended:
            query = query.where(Store.is_suspended.is_(False))
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def count(self, include_suspended: bool = True) -> int:
        query = select(func.count(Store.id))
        if not include_suspended:
            query = query.where(Store.is_suspended.is_(False))
        result = await self.db.execute(query)
        return result.scalar()

    async def count_since(self, since) -> int:
        result = await self.db.execute(
            select(func.count(Store.id)).where(Store.created_at >= since)
        )
        return result.scalar()


class StoreSettingsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_store_id(self, store_id: int) -> Optional[StoreSettings]:
        result = await self.db.execute(
            select(StoreSettings).where(StoreSettings.store_id == store_id)
        )
        return result.scalar_one_or_none()

    async def create(self, settings: StoreSettings) -> StoreSettings:
        self.db.add(settings)
        await self.db.commit()
        await self.db.refresh(settings)
        return settings

    async def update(self, settings: StoreSettings) -> StoreSettings:
        await self.db.commit()
        await self.db.refresh(settings)
        return settings
