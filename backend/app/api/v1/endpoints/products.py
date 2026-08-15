from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_owner_store
from app.models import ProductStatus, Store
from app.schemas.catalog import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    PaginatedProducts,
    ProductCreate,
    ProductResponse,
    ProductStatusUpdate,
    ProductUpdate,
)
from app.schemas.order import OrderResponse
from app.services.catalog import CategoryService, ProductService

router = APIRouter()


@router.get("/products", response_model=PaginatedProducts)
async def list_products(
    search: str | None = None,
    category_id: int | None = None,
    status: str | None = None,
    sort: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    items, total = await service.repo.list_by_store(
        store.id,
        search=search,
        category_id=category_id,
        status=status,
        sort=sort,
        skip=(page - 1) * page_size,
        limit=page_size,
    )
    return PaginatedProducts(
        items=[
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "price": float(p.price),
                "discount_price": float(p.discount_price) if p.discount_price else None,
                "stock": p.stock,
                "status": p.status,
                "images": list(p.images or []),
                "category_id": p.category_id,
                "is_featured": p.is_featured,
                "created_at": p.created_at,
            }
            for p in items
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    await service.enforce_plan_limit(store)
    return await service.create(store, data)


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    product = await service.repo.get_by_store(product_id, store.id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return await service._load_detail(product)


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.update(store, product_id, data)


@router.patch("/products/{product_id}/status", response_model=ProductResponse)
async def update_product_status(
    product_id: int,
    data: ProductStatusUpdate,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.set_status(store, product_id, data.status)


@router.post("/products/{product_id}/duplicate", response_model=ProductResponse, status_code=201)
async def duplicate_product(
    product_id: int,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    await service.enforce_plan_limit(store)
    return await service.duplicate(store, product_id)


@router.delete("/products/{product_id}", status_code=204)
async def delete_product(
    product_id: int,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    await service.delete(store, product_id)


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await CategoryService(db).list_categories(store)


@router.post("/categories", response_model=CategoryResponse, status_code=201)
async def create_category(
    data: CategoryCreate,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await CategoryService(db).create(store, data)


@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    data: CategoryUpdate,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    return await CategoryService(db).update(store, category_id, data)


@router.delete("/categories/{category_id}", status_code=204)
async def delete_category(
    category_id: int,
    store: Store = Depends(get_owner_store),
    db: AsyncSession = Depends(get_db),
):
    await CategoryService(db).delete(store, category_id)
