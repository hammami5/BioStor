from typing import Optional

from sqlalchemy import Boolean, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import ButtonStyle, StoreTheme


class Store(Base):
    __tablename__ = "stores"

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    store_name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    logo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    instagram_username: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    contact_address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    contact_city: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_suspended: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    owner: Mapped["User"] = relationship("User", back_populates="store")
    settings: Mapped[Optional["StoreSettings"]] = relationship(
        "StoreSettings", back_populates="store", uselist=False, cascade="all, delete-orphan"
    )
    categories: Mapped[list["Category"]] = relationship(
        "Category", back_populates="store", cascade="all, delete-orphan"
    )
    products: Mapped[list["Product"]] = relationship(
        "Product", back_populates="store", cascade="all, delete-orphan"
    )
    customers: Mapped[list["Customer"]] = relationship(
        "Customer", back_populates="store", cascade="all, delete-orphan"
    )
    orders: Mapped[list["Order"]] = relationship(
        "Order", back_populates="store", cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification", back_populates="store", cascade="all, delete-orphan"
    )
    subscription: Mapped[Optional["Subscription"]] = relationship(
        "Subscription", back_populates="store", uselist=False
    )


class StoreSettings(Base):
    __tablename__ = "store_settings"

    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    accent_color: Mapped[str] = mapped_column(String(9), default="#C9A227", nullable=False)
    button_style: Mapped[ButtonStyle] = mapped_column(
        Enum(ButtonStyle, native_enum=False), default=ButtonStyle.ROUNDED, nullable=False
    )
    theme: Mapped[StoreTheme] = mapped_column(
        Enum(StoreTheme, native_enum=False), default=StoreTheme.LIGHT, nullable=False
    )
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    delivery_fee: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)

    store: Mapped[Store] = relationship("Store", back_populates="settings")
