from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict

from app.models.enums import NotificationType


class NotificationResponse(BaseModel):
    id: int
    type: NotificationType
    title: str
    message: str
    is_read: bool
    data: Optional[dict] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationsList(BaseModel):
    items: list[NotificationResponse]
    unread_count: int
