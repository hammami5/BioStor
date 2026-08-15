from typing import Optional, List

from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Notification, NotificationType


class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        store_id: int,
        type: NotificationType,
        title: str,
        message: str,
        data: Optional[dict] = None,
    ) -> Notification:
        notification = Notification(
            store_id=store_id,
            type=type,
            title=title,
            message=message,
            data=data,
        )
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def list_by_store(
        self, store_id: int, limit: int = 50, skip: int = 0, unread_only: bool = False
    ) -> List[Notification]:
        query = select(Notification).where(Notification.store_id == store_id)
        if unread_only:
            query = query.where(Notification.is_read.is_(False))
        query = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_store(self, notification_id: int, store_id: int) -> Optional[Notification]:
        result = await self.db.execute(
            select(Notification).where(
                Notification.id == notification_id, Notification.store_id == store_id
            )
        )
        return result.scalar_one_or_none()

    async def mark_read(self, notification: Notification) -> None:
        notification.is_read = True
        await self.db.commit()

    async def mark_all_read(self, store_id: int) -> None:
        await self.db.execute(
            update(Notification)
            .where(Notification.store_id == store_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        await self.db.commit()

    async def unread_count(self, store_id: int) -> int:
        result = await self.db.execute(
            select(func.count(Notification.id)).where(
                Notification.store_id == store_id, Notification.is_read.is_(False)
            )
        )
        return result.scalar()
