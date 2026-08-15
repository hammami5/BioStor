from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_owner_store
from app.models import Store
from app.schemas.order import PaginatedCustomers, CustomerDetail
from app.services.order import OrderService

router = APIRouter()


@router.get("/customers", response_model=PaginatedCustomers)
async def list_customers(
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await OrderService(db).list_customers(
        store, search=search, page=page, page_size=page_size
    )


@router.get("/customers/{customer_id}", response_model=CustomerDetail)
async def get_customer(
    customer_id: int,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await OrderService(db).customer_detail(store, customer_id)
