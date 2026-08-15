from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_owner_store
from app.models import Store
from app.schemas.notification import NotificationResponse, NotificationsList
from app.repositories.notifications import NotificationRepository
from app.schemas.auth import MessageResponse

router = APIRouter()


@router.get("/notifications", response_model=NotificationsList)
async def list_notifications(
    unread_only: bool = False,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    repo = NotificationRepository(db)
    items = await repo.list_by_store(store.id, unread_only=unread_only)
    unread = await repo.unread_count(store.id)
    return NotificationsList(items=items, unread_count=unread)


@router.get("/notifications/unread-count")
async def unread_count(
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    repo = NotificationRepository(db)
    return {"count": await repo.unread_count(store.id)}


@router.post("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_read(
    notification_id: int,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    repo = NotificationRepository(db)
    notification = await repo.get_by_store(notification_id, store.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    await repo.mark_read(notification)
    return notification


@router.post("/notifications/read-all", response_model=MessageResponse)
async def mark_all_read(
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    await NotificationRepository(db).mark_all_read(store.id)
    return MessageResponse(message="All notifications marked as read")
