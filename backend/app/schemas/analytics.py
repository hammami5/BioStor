from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict

from app.models.enums import SubscriptionPlanCode, SubscriptionStatus


class DashboardOverview(BaseModel):
    total_orders: int
    today_orders: int
    total_revenue: float
    pending_orders: int
    total_products: int
    total_customers: int
    unread_notifications: int
    low_stock_count: int


class TimePoint(BaseModel):
    label: str
    date: str
    value: float
    orders: int = 0


class BestProduct(BaseModel):
    product_id: Optional[int] = None
    name: str
    quantity: int
    revenue: float


class StatusBreakdown(BaseModel):
    status: str
    count: int


class AnalyticsOverview(BaseModel):
    total_revenue: float
    total_orders: int
    average_order_value: float
    conversion_rate: float
    customers: int
    best_selling_products: List[BestProduct]
    status_breakdown: List[StatusBreakdown]


class AdminStats(BaseModel):
    total_users: int
    active_stores: int
    total_orders: int
    platform_revenue: float
    new_users_30d: int
    active_subscriptions: int
    subscription_breakdown: dict
    recent_orders: int


class AdminUser(BaseModel):
    id: int
    full_name: str
    email: str
    username: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    store_name: Optional[str] = None
    store_slug: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AdminStore(BaseModel):
    id: int
    store_name: str
    slug: str
    owner_name: str = ""
    owner_email: str = ""
    is_active: bool
    is_suspended: bool
    product_count: int = 0
    order_count: int = 0
    plan_code: str = "free"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminOrder(BaseModel):
    id: int
    order_number: str
    status: str
    total: float
    currency: str
    store_name: str = ""
    customer_name: str
    placed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminSubscription(BaseModel):
    id: int
    store_name: str = ""
    plan_code: SubscriptionPlanCode
    status: SubscriptionStatus
    provider: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
