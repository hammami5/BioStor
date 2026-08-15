from decimal import Decimal
from typing import Any, List, Optional

from sqlalchemy import JSON, Boolean, Enum, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import ProductStatus


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        UniqueConstraint("store_id", "name", name="uq_category_store_name"),
    )

    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    store: Mapped["Store"] = relationship("Store", back_populates="categories")
    products: Mapped[List["Product"]] = relationship(
        "Product", back_populates="category", cascade="all, delete-orphan"
    )


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        UniqueConstraint("store_id", "slug", name="uq_product_store_slug"),
    )

    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[ProductStatus] = mapped_column(
        Enum(ProductStatus, native_enum=False), default=ProductStatus.ACTIVE, nullable=False, index=True
    )
    images: Mapped[list[Any]] = mapped_column(JSON, default=list, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    store: Mapped["Store"] = relationship("Store", back_populates="products")
    category: Mapped[Optional[Category]] = relationship("Category", back_populates="products")
    variant_groups: Mapped[List["VariantGroup"]] = relationship(
        "VariantGroup",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="VariantGroup.position",
    )
    order_items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="product")


class VariantGroup(Base):
    __tablename__ = "variant_groups"
    __table_args__ = (
        UniqueConstraint("product_id", "name", name="uq_variantgroup_product_name"),
    )

    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    product: Mapped[Product] = relationship("Product", back_populates="variant_groups")
    options: Mapped[List["VariantOption"]] = relationship(
        "VariantOption",
        back_populates="group",
        cascade="all, delete-orphan",
        order_by="VariantOption.position",
    )


class VariantOption(Base):
    __tablename__ = "variant_options"

    group_id: Mapped[int] = mapped_column(
        ForeignKey("variant_groups.id", ondelete="CASCADE"), nullable=False, index=True
    )
    value: Mapped[str] = mapped_column(String(120), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    additional_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    stock: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    group: Mapped[VariantGroup] = relationship("VariantGroup", back_populates="options")
