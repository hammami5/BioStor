from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_super_admin
from app.models import User
from app.schemas.analytics import (
    AdminStats,
    AdminUser,
    AdminStore,
    AdminOrder,
    AdminSubscription,
)
from app.schemas.auth import MessageResponse
from app.schemas.subscription import PlanAdminUpdate, PlanResponse
from app.services.admin import AdminService

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
async def admin_stats(
    _: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).stats()


@router.get("/users", response_model=list[AdminUser])
async def admin_users(
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).list_users(search=search, page=page, page_size=page_size)


@router.get("/stores", response_model=list[AdminStore])
async def admin_stores(
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).list_stores(search=search, page=page, page_size=page_size)


@router.patch("/stores/{store_id}/suspend", response_model=MessageResponse)
async def suspend_store(
    store_id: int,
    suspended: bool = Query(True),
    _: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db),
):
    await AdminService(db).set_store_suspended(store_id, suspended)
    action = "suspended" if suspended else "reactivated"
    return MessageResponse(message=f"Store {action} successfully")


@router.get("/orders", response_model=list[AdminOrder])
async def admin_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).list_orders(page=page, page_size=page_size)


@router.get("/plans", response_model=list[PlanResponse])
async def admin_plans(
    _: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).list_plans()


@router.put("/plans/{plan_id}", response_model=PlanResponse)
async def admin_update_plan(
    plan_id: int,
    data: PlanAdminUpdate,
    _: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).update_plan(plan_id, data)


@router.get("/subscriptions", response_model=list[AdminSubscription])
async def admin_subscriptions(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).list_subscriptions(page=page, page_size=page_size)
