from datetime import datetime
from decimal import Decimal
from typing import Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict

from app.models.enums import OrderStatus


class VariantSelection(BaseModel):
    group: str
    value: str


class CheckoutItem(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1, le=99)
    variant_group: Optional[str] = None
    variant_value: Optional[str] = None
    variant_selections: List[VariantSelection] = Field(default_factory=list)


class CheckoutRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=3, max_length=50)
    address: str = Field(..., min_length=3, max_length=500)
    city: str = Field(..., min_length=1, max_length=120)
    note: Optional[str] = Field(None, max_length=2000)
    items: List[CheckoutItem] = Field(..., min_length=1)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderNoteUpdate(BaseModel):
    internal_note: Optional[str] = Field(None, max_length=2000)


class OrderItemResponse(BaseModel):
    id: int = 0
    product_id: Optional[int] = None
    product_name: str
    product_image: Optional[str] = None
    variant_text: Optional[str] = None
    unit_price: float
    quantity: int
    total: float

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    order_number: str
    status: OrderStatus
    subtotal: float
    delivery_fee: float
    total: float
    currency: str
    customer_name: str
    customer_phone: str
    customer_address: str
    customer_city: str
    note: Optional[str] = None
    internal_note: Optional[str] = None
    placed_at: datetime
    items: List[OrderItemResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class OrderListItem(BaseModel):
    id: int
    order_number: str
    status: OrderStatus
    total: float
    currency: str
    customer_name: str
    customer_phone: str
    item_count: int = 0
    placed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedOrders(BaseModel):
    items: List[OrderListItem]
    total: int
    page: int
    page_size: int


class OrderConfirmation(BaseModel):
    order_number: str
    total: float
    currency: str
    customer_name: str
    status: OrderStatus
    placed_at: datetime
    items: List[OrderItemResponse] = Field(default_factory=list)
    delivery_fee: float = 0
    subtotal: float = 0
    store_name: str = ""
    message: str = "Order confirmed"


class CustomerResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    address: str
    city: str
    total_orders: int
    total_spent: float
    last_order_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerListItem(CustomerResponse):
    pass


class PaginatedCustomers(BaseModel):
    items: List[CustomerListItem]
    total: int
    page: int
    page_size: int


class CustomerDetail(CustomerResponse):
    orders: List[OrderResponse] = Field(default_factory=list)
