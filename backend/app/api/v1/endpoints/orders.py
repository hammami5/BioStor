from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_owner_store
from app.models import Store
from app.schemas.order import (
    OrderConfirmation,
    OrderNoteUpdate,
    OrderResponse,
    OrderStatusUpdate,
    PaginatedOrders,
)
from app.services.order import OrderService

router = APIRouter()


@router.get("/orders", response_model=PaginatedOrders)
async def list_orders(
    search: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await OrderService(db).list_orders(
        store, search=search, status_filter=status, page=page, page_size=page_size
    )


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await OrderService(db).get_order(store, order_id)


@router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await OrderService(db).update_status(store, order_id, data.status)


@router.put("/orders/{order_id}/note", response_model=OrderResponse)
async def update_order_note(
    order_id: int,
    data: OrderNoteUpdate,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await OrderService(db).update_internal_note(store, order_id, data.internal_note)
