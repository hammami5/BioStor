from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_owner_store
from app.models import Store
from app.schemas.auth import StoreResponse
from app.schemas.store import StoreUpdateRequest, StoreSettingsUpdateRequest, SlugUpdateRequest
from app.services.store import StoreService

router = APIRouter()


@router.get("/me", response_model=StoreResponse)
async def get_my_store(
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await StoreService(db).get_full_store(store)


@router.put("/me", response_model=StoreResponse)
async def update_my_store(
    data: StoreUpdateRequest,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    service = StoreService(db)
    store = await service.update_store(store, data)
    return await service.get_full_store(store)


@router.put("/me/slug", response_model=StoreResponse)
async def update_my_store_slug(
    data: SlugUpdateRequest,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    service = StoreService(db)
    store = await service.update_slug(store, data.slug)
    return await service.get_full_store(store)


@router.put("/me/settings", response_model=StoreResponse)
async def update_my_store_settings(
    data: StoreSettingsUpdateRequest,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    service = StoreService(db)
    store = await service.update_settings(store, data)
    return await service.get_full_store(store)


@router.put("/me/logo", response_model=StoreResponse)
async def upload_logo(
    file: UploadFile = File(...),
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    service = StoreService(db)
    url = await service.upload_image(file)
    store.logo = url
    await db.commit()
    return await service.get_full_store(store)
