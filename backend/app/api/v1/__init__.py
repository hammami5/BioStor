from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    store,
    products,
    orders,
    customers,
    analytics,
    notifications,
    subscriptions,
    admin,
    public,
    upload,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(store.router, prefix="/store", tags=["store"])
api_router.include_router(products.router, prefix="", tags=["products"])
api_router.include_router(orders.router, prefix="", tags=["orders"])
api_router.include_router(customers.router, prefix="", tags=["customers"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(notifications.router, prefix="", tags=["notifications"])
api_router.include_router(subscriptions.router, prefix="", tags=["subscriptions"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(public.router, prefix="", tags=["public"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
