from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.catalog import PublicProduct, PublicProductList
from app.schemas.order import CheckoutRequest, OrderConfirmation
from app.services.order import OrderService
from app.services.public import PublicStoreService

router = APIRouter()


@router.get("/store/{slug}", response_model=PublicProductList)
async def get_public_store(
    slug: str,
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await PublicStoreService(db).public_store(slug, category)


@router.get("/store/{slug}/products/{product_slug}", response_model=PublicProduct)
async def get_public_product(
    slug: str,
    product_slug: str,
    db: AsyncSession = Depends(get_db),
):
    return await PublicStoreService(db).public_product(slug, product_slug)


@router.post("/orders", response_model=OrderConfirmation, status_code=201)
async def create_order(
    data: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
):
    """Public checkout. `slug` is required in the request — see CheckoutRequest.

    The checkout identifies the store via the request body's implicit target;
    because a cart belongs to one store at a time, we resolve the store from the
    first item's product instead of trusting a store id from the client.
    """
    service = OrderService(db)
    store = await service.resolve_store_from_items(data.items)
    return await service.checkout(store, data)
