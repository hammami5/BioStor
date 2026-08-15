from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_owner_store
from app.models import Store
from app.schemas.analytics import DashboardOverview, TimePoint
from app.services.analytics import AnalyticsService

router = APIRouter()


@router.get("/overview", response_model=DashboardOverview)
async def dashboard_overview(
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await AnalyticsService(db).dashboard(store)


@router.get("/summary")
async def analytics_summary(
    range: str = "30d",
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await AnalyticsService(db).overview(store, range)


@router.get("/orders-over-time", response_model=list[TimePoint])
async def orders_over_time(
    range: str = "30d",
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await AnalyticsService(db).orders_over_time(store, range)


@router.get("/revenue-over-time", response_model=list[TimePoint])
async def revenue_over_time(
    range: str = "30d",
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await AnalyticsService(db).revenue_over_time(store, range)


@router.get("/best-products")
async def best_products(
    range: str = "30d",
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await AnalyticsService(db).best_products(store, range)
