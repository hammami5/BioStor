from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Store, User
from app.repositories.auth import UserRepository
from app.repositories.catalog import ProductRepository
from app.repositories.orders import OrderRepository
from app.repositories.store import StoreRepository
from app.repositories.subscriptions import PlanRepository, SubscriptionRepository
from app.schemas.analytics import AdminStats
from app.schemas.subscription import PlanAdminUpdate


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.store_repo = StoreRepository(db)
        self.product_repo = ProductRepository(db)
        self.order_repo = OrderRepository(db)
        self.plan_repo = PlanRepository(db)
        self.subscription_repo = SubscriptionRepository(db)

    async def stats(self) -> AdminStats:
        now = datetime.utcnow()
        since_30d = now - timedelta(days=30)

        total_users = await self.user_repo.count()
        active_stores = await self.store_repo.count(include_suspended=False)
        total_orders = sum(
            await self._count_all_store_orders()
        )
        platform_revenue = Decimal("0")
        stores = await self.store_repo.list_stores(limit=1000)
        for store in stores:
            revenue = await self.order_repo.revenue_between(
                store.id, datetime.min, now
            )
            platform_revenue += revenue
        new_users_30d = await self.user_repo.count_since(since_30d)
        active_subscriptions = await self.subscription_repo.count_active()
        subscription_breakdown = await self.subscription_repo.count_by_plan()

        return AdminStats(
            total_users=total_users,
            active_stores=active_stores,
            total_orders=total_orders,
            platform_revenue=float(platform_revenue),
            new_users_30d=new_users_30d,
            active_subscriptions=active_subscriptions,
            subscription_breakdown=subscription_breakdown,
            recent_orders=total_orders,
        )

    async def _count_all_store_orders(self) -> list[int]:
        stores = await self.store_repo.list_stores(limit=1000)
        counts = []
        for store in stores:
            counts.append(await self.order_repo.count_by_store(store.id))
        return counts

    async def list_users(self, search=None, page=1, page_size=20):
        users = await self.user_repo.get_all(
            search=search, skip=(page - 1) * page_size, limit=page_size
        )
        result = []
        for user in users:
            store = await self.store_repo.get_by_owner_id(user.id)
            result.append(
                {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "username": user.username,
                    "role": user.role.value,
                    "is_active": user.is_active,
                    "is_verified": user.is_verified,
                    "created_at": user.created_at,
                    "store_name": store.store_name if store else None,
                    "store_slug": store.slug if store else None,
                }
            )
        return result

    async def list_stores(self, search=None, page=1, page_size=20):
        stores = await self.store_repo.list_stores(
            search=search, skip=(page - 1) * page_size, limit=page_size
        )
        result = []
        for store in stores:
            owner = await self.user_repo.get_by_id(store.owner_id)
            product_count = await self.product_repo.count_by_store(store.id)
            order_count = await self.order_repo.count_by_store(store.id)
            subscription = await self.subscription_repo.get_by_store(store.id)
            result.append(
                {
                    "id": store.id,
                    "store_name": store.store_name,
                    "slug": store.slug,
                    "owner_name": owner.full_name if owner else "",
                    "owner_email": owner.email if owner else "",
                    "is_active": store.is_active,
                    "is_suspended": store.is_suspended,
                    "product_count": product_count,
                    "order_count": order_count,
                    "plan_code": subscription.plan_code.value if subscription else "free",
                    "created_at": store.created_at,
                }
            )
        return result

    async def set_store_suspended(self, store_id: int, suspended: bool) -> Store:
        store = await self.store_repo.get_by_id(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        store.is_suspended = suspended
        store.is_active = not suspended
        await self.store_repo.update(store)
        return store

    async def list_orders(self, page=1, page_size=50):
        stores = await self.store_repo.list_stores(limit=1000)
        result = []
        for store in stores:
            orders, _ = await self.order_repo.list_by_store(
                store.id, skip=0, limit=10
            )
            for order in orders:
                result.append(
                    {
                        "id": order.id,
                        "order_number": order.order_number,
                        "status": order.status.value,
                        "total": float(order.total),
                        "currency": order.currency,
                        "store_name": store.store_name,
                        "customer_name": order.customer_name,
                        "placed_at": order.placed_at,
                    }
                )
        result.sort(key=lambda o: o["placed_at"], reverse=True)
        start = (page - 1) * page_size
        return result[start : start + page_size]

    async def list_plans(self):
        return await self.plan_repo.list_all()

    async def update_plan(self, plan_id: int, data: PlanAdminUpdate):
        plan = await self.plan_repo.get_by_id(plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        updates = data.model_dump(exclude_unset=True, exclude_none=True)
        for key, value in updates.items():
            setattr(plan, key, value)
        return await self.plan_repo.update(plan)

    async def list_subscriptions(self, page=1, page_size=50):
        subscriptions = await self.subscription_repo.list_all(
            skip=(page - 1) * page_size, limit=page_size
        )
        result = []
        for sub in subscriptions:
            store = await self.store_repo.get_by_id(sub.store_id)
            result.append(
                {
                    "id": sub.id,
                    "store_name": store.store_name if store else "",
                    "plan_code": sub.plan_code.value,
                    "status": sub.status.value,
                    "provider": sub.provider,
                    "created_at": sub.created_at,
                }
            )
        return result
