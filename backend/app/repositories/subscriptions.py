from typing import Optional, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Plan, Subscription, SubscriptionStatus, SubscriptionPlanCode


class PlanRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_active(self) -> List[Plan]:
        result = await self.db.execute(
            select(Plan).where(Plan.is_active.is_(True)).order_by(Plan.sort_order.asc())
        )
        return result.scalars().all()

    async def list_all(self) -> List[Plan]:
        result = await self.db.execute(select(Plan).order_by(Plan.sort_order.asc()))
        return result.scalars().all()

    async def get_by_code(self, code: SubscriptionPlanCode) -> Optional[Plan]:
        result = await self.db.execute(select(Plan).where(Plan.code == code))
        return result.scalar_one_or_none()

    async def get_by_id(self, plan_id: int) -> Optional[Plan]:
        result = await self.db.execute(select(Plan).where(Plan.id == plan_id))
        return result.scalar_one_or_none()

    async def update(self, plan: Plan) -> Plan:
        await self.db.commit()
        await self.db.refresh(plan)
        return plan


class SubscriptionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_store(self, store_id: int) -> Optional[Subscription]:
        result = await self.db.execute(
            select(Subscription).where(Subscription.store_id == store_id)
        )
        return result.scalar_one_or_none()

    async def create(self, subscription: Subscription) -> Subscription:
        self.db.add(subscription)
        await self.db.commit()
        await self.db.refresh(subscription)
        return subscription

    async def update(self, subscription: Subscription) -> Subscription:
        await self.db.commit()
        await self.db.refresh(subscription)
        return subscription

    async def upsert_free(self, store_id: int) -> Subscription:
        subscription = await self.get_by_store(store_id)
        if subscription:
            return subscription
        subscription = Subscription(
            store_id=store_id,
            plan_code=SubscriptionPlanCode.FREE,
            status=SubscriptionStatus.ACTIVE,
        )
        return await self.create(subscription)

    async def count_active(self) -> int:
        result = await self.db.execute(
            select(func.count(Subscription.id)).where(
                Subscription.status == SubscriptionStatus.ACTIVE
            )
        )
        return result.scalar()

    async def count_by_plan(self) -> dict:
        rows = await self.db.execute(
            select(Subscription.plan_code, func.count(Subscription.id)).group_by(
                Subscription.plan_code
            )
        )
        return {code.value: count for code, count in rows.all()}

    async def list_all(self, skip: int = 0, limit: int = 100) -> List[Subscription]:
        result = await self.db.execute(
            select(Subscription).offset(skip).limit(limit).order_by(Subscription.created_at.desc())
        )
        return result.scalars().all()
