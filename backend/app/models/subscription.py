from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import JSON, Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import SubscriptionPlanCode, SubscriptionStatus


class Plan(Base):
    __tablename__ = "plans"

    code: Mapped[SubscriptionPlanCode] = mapped_column(
        Enum(SubscriptionPlanCode, native_enum=False), unique=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    price_monthly: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    price_yearly: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=True)
    product_limit: Mapped[int] = mapped_column(default=10, nullable=False)
    order_limit: Mapped[Optional[int]] = mapped_column(nullable=True)
    features: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    custom_branding: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    advanced_analytics: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    priority_support: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    subscriptions: Mapped[list["Subscription"]] = relationship(
        "Subscription",
        back_populates="plan",
        primaryjoin="Subscription.plan_code == Plan.code",
    )


class Subscription(Base):
    __tablename__ = "subscriptions"
    __table_args__ = (
        # Only one active subscription per store
    )

    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    plan_code: Mapped[SubscriptionPlanCode] = mapped_column(
        Enum(SubscriptionPlanCode, native_enum=False),
        ForeignKey("plans.code"),
        default=SubscriptionPlanCode.FREE,
        nullable=False,
    )
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus, native_enum=False), default=SubscriptionStatus.ACTIVE, nullable=False
    )
    current_period_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    current_period_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    # Payment provider integration point — set once a real provider is connected.
    provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    provider_subscription_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    canceled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    store: Mapped["Store"] = relationship("Store", back_populates="subscription")
    plan: Mapped[Optional[Plan]] = relationship("Plan", primaryjoin="Subscription.plan_code == Plan.code")


class Invoice(Base):
    __tablename__ = "invoices"

    subscription_id: Mapped[int] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="open", nullable=False)
    provider_invoice_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    subscription: Mapped[Subscription] = relationship("Subscription")
