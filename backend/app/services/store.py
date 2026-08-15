from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.storage import StorageError, save_upload
from app.models import Store, StoreSettings
from app.repositories.store import StoreRepository, StoreSettingsRepository
from app.schemas.store import StoreUpdateRequest, StoreSettingsUpdateRequest


class StoreService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.store_repo = StoreRepository(db)
        self.settings_repo = StoreSettingsRepository(db)

    async def get_full_store(self, store: Store) -> Store:
        settings = await self.settings_repo.get_by_store_id(store.id)
        if not settings:
            settings = StoreSettings(store_id=store.id)
            settings = await self.settings_repo.create(settings)
        store.settings = settings
        return store

    async def update_store(self, store: Store, data: StoreUpdateRequest) -> Store:
        updates = data.model_dump(exclude_unset=True, exclude_none=True)
        for key, value in updates.items():
            setattr(store, key, value)
        await self.store_repo.update(store)
        return store

    async def update_settings(
        self, store: Store, data: StoreSettingsUpdateRequest
    ) -> Store:
        settings = await self.settings_repo.get_by_store_id(store.id)
        if not settings:
            settings = StoreSettings(store_id=store.id)
            settings = await self.settings_repo.create(settings)

        updates = data.model_dump(exclude_unset=True, exclude_none=True)
        for key, value in updates.items():
            if key == "delivery_fee":
                value = Decimal(str(value))
            setattr(settings, key, value)
        await self.settings_repo.update(settings)
        store.settings = settings
        return store

    async def upload_image(self, file) -> str:
        try:
            return await save_upload(file)
        except StorageError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
            )
