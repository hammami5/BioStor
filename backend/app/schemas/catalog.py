from decimal import Decimal
from typing import Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator

from app.models.enums import ProductStatus


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    position: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    id: int
    slug: str
    position: int
    is_active: bool
    product_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class VariantOptionIn(BaseModel):
    value: str = Field(..., min_length=1, max_length=120)
    additional_price: float = 0
    stock: Optional[int] = None


class VariantGroupIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    options: List[VariantOptionIn] = Field(default_factory=list)


class VariantOptionResponse(BaseModel):
    id: int
    value: str
    additional_price: float
    stock: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class VariantGroupResponse(BaseModel):
    id: int
    name: str
    options: List[VariantOptionResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    discount_price: Optional[float] = Field(None, ge=0)
    stock: int = Field(0, ge=0)
    category_id: Optional[int] = None
    images: List[str] = Field(default_factory=list, max_length=6)
    is_featured: bool = False
    status: ProductStatus = ProductStatus.ACTIVE
    variant_groups: List[VariantGroupIn] = Field(default_factory=list)

    @field_validator("discount_price")
    @classmethod
    def validate_discount(cls, v: Optional[float], info):
        if v is not None:
            price = info.data.get("price")
            if price and v >= price:
                raise ValueError("Discount price must be lower than the regular price")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    discount_price: Optional[float] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    images: Optional[List[str]] = Field(None, max_length=6)
    is_featured: Optional[bool] = None
    status: Optional[ProductStatus] = None
    variant_groups: Optional[List[VariantGroupIn]] = None


class ProductStatusUpdate(BaseModel):
    status: ProductStatus


class ProductListItem(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    discount_price: Optional[float] = None
    stock: int
    status: ProductStatus
    images: List[str]
    category_id: Optional[int] = None
    is_featured: bool
    created_at: Any

    model_config = ConfigDict(from_attributes=True)


class ProductResponse(ProductListItem):
    description: Optional[str] = None
    category: Optional[CategoryResponse] = None
    variant_groups: List[VariantGroupResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class PaginatedProducts(BaseModel):
    items: List[ProductListItem]
    total: int
    page: int
    page_size: int


class PublicVariantOption(BaseModel):
    value: str
    additional_price: float
    in_stock: bool


class PublicVariantGroup(BaseModel):
    name: str
    options: List[PublicVariantOption]


class PublicProduct(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    images: List[str]
    stock: int
    in_stock: bool
    category_id: Optional[int] = None
    variant_groups: List[PublicVariantGroup] = Field(default_factory=list)


class PublicProductList(BaseModel):
    products: List[PublicProduct]
    categories: List[CategoryResponse]
    store: Any
