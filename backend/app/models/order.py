from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import OrderStatus


class Customer(Base):
    __tablename__ = "customers"
    __table_args__ = (
        # A customer is unique per store by phone (common identifier for Instagram sellers)
    )

    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    total_orders: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_spent: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    last_order_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    store: Mapped["Store"] = relationship("Store", back_populates="customers")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="customer")


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        # order_number is unique per store
    )

    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    order_number: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, native_enum=False), default=OrderStatus.NEW, nullable=False, index=True
    )
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    delivery_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)

    # Customer snapshot so the order remains readable even if customer record changes
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    customer_address: Mapped[str] = mapped_column(String(500), nullable=False)
    customer_city: Mapped[str] = mapped_column(String(120), nullable=False)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    internal_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    placed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    store: Mapped["Store"] = relationship("Store", back_populates="orders")
    customer: Mapped[Optional[Customer]] = relationship("Customer", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"), nullable=True
    )
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    product_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    variant_text: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped[Order] = relationship("Order", back_populates="items")
    product: Mapped[Optional["Product"]] = relationship("Product", back_populates="order_items")
