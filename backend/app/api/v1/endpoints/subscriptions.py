from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_owner_store
from app.models import Store
from app.schemas.auth import MessageResponse
from app.schemas.subscription import (
    PlanResponse,
    SelectPlanRequest,
    SubscriptionResponse,
)
from app.services.subscription import SubscriptionService

router = APIRouter()


@router.get("/plans", response_model=list[PlanResponse])
async def list_plans(db: AsyncSession = Depends(get_db)):
    from app.repositories.subscriptions import PlanRepository

    plans = await PlanRepository(db).list_active()
    return plans


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await SubscriptionService(db).get_current(store)


@router.post("/subscription/select-plan", response_model=SubscriptionResponse)
async def select_plan(
    data: SelectPlanRequest,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await SubscriptionService(db).select_plan(store, data.plan_code)


@router.post("/subscription/cancel", response_model=SubscriptionResponse)
async def cancel_subscription(
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await SubscriptionService(db).cancel(store)
