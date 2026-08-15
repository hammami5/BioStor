from datetime import datetime
from decimal import Decimal
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict

from app.models.enums import SubscriptionPlanCode, SubscriptionStatus


class PlanResponse(BaseModel):
    id: int
    code: SubscriptionPlanCode
    name: str
    description: Optional[str] = None
    price_monthly: float
    price_yearly: Optional[float] = None
    product_limit: int
    order_limit: Optional[int] = None
    features: List[str]
    custom_branding: bool
    advanced_analytics: bool
    priority_support: bool
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class PlanAdminUpdate(BaseModel):
    price_monthly: Optional[float] = None
    price_yearly: Optional[float] = None
    product_limit: Optional[int] = None
    order_limit: Optional[int] = None
    features: Optional[List[str]] = None
    custom_branding: Optional[bool] = None
    advanced_analytics: Optional[bool] = None
    priority_support: Optional[bool] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None
    name: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: int
    plan_code: SubscriptionPlanCode
    status: SubscriptionStatus
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    provider: Optional[str] = None
    cancel_at_period_end: bool
    plan: Optional[PlanResponse] = None

    model_config = ConfigDict(from_attributes=True)


class SelectPlanRequest(BaseModel):
    plan_code: SubscriptionPlanCode
