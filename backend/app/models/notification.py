from typing import Optional

from sqlalchemy import JSON, Boolean, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import NotificationType


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        # Composite index for the common "unread by store" query
    )

    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType, native_enum=False), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    store: Mapped["Store"] = relationship("Store", back_populates="notifications")
