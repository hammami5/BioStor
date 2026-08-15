from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Store, Subscription, SubscriptionStatus, SubscriptionPlanCode, Plan
from app.repositories.subscriptions import PlanRepository, SubscriptionRepository


class SubscriptionService:
    """Subscription architecture.

    Real payments are intentionally NOT simulated. When a payment provider is
    connected, the provider metadata fields on Subscription (provider,
    provider_subscription_id) and the Invoice table become the integration
    point. For now, selecting a paid plan records a "payment required" intent
    which the seller completes via the provider.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.subscription_repo = SubscriptionRepository(db)
        self.plan_repo = PlanRepository(db)

    async def get_current(self, store: Store) -> Subscription:
        subscription = await self.subscription_repo.get_by_store(store.id)
        if not subscription:
            subscription = await self.subscription_repo.upsert_free(store.id)
        plan = await self.plan_repo.get_by_code(subscription.plan_code)
        subscription.plan = plan
        return subscription

    async def select_plan(self, store: Store, plan_code: SubscriptionPlanCode) -> Subscription:
        plan = await self.plan_repo.get_by_code(plan_code)
        if not plan or not plan.is_active:
            raise HTTPException(status_code=404, detail="Plan not found")

        subscription = await self.subscription_repo.get_by_store(store.id)
        if not subscription:
            subscription = await self.subscription_repo.upsert_free(store.id)

        if plan_code == SubscriptionPlanCode.FREE:
            subscription.plan_code = SubscriptionPlanCode.FREE
            subscription.status = SubscriptionStatus.ACTIVE
            subscription.cancel_at_period_end = False
            subscription.provider = None
            subscription.provider_subscription_id = None
            subscription.current_period_start = datetime.utcnow()
            subscription.current_period_end = None
        else:
            # Paid plan: no fake payment confirmation. The subscription is
            # marked as pending checkout; a real provider (Stripe/Adyen/etc.)
            # will set ACTIVE once payment succeeds.
            subscription.plan_code = plan_code
            subscription.status = SubscriptionStatus.TRIALING
            subscription.current_period_start = datetime.utcnow()
            subscription.current_period_end = datetime.utcnow() + timedelta(days=14)
            subscription.cancel_at_period_end = False

        subscription = await self.subscription_repo.update(subscription)
        plan = await self.plan_repo.get_by_code(subscription.plan_code)
        subscription.plan = plan
        return subscription

    async def cancel(self, store: Store) -> Subscription:
        subscription = await self.subscription_repo.get_by_store(store.id)
        if not subscription:
            raise HTTPException(status_code=404, detail="No subscription found")
        if subscription.plan_code == SubscriptionPlanCode.FREE:
            raise HTTPException(
                status_code=400,
                detail="You are already on the free plan",
            )
        subscription.cancel_at_period_end = True
        subscription.status = SubscriptionStatus.ACTIVE
        subscription = await self.subscription_repo.update(subscription)
        plan = await self.plan_repo.get_by_code(subscription.plan_code)
        subscription.plan = plan
        return subscription
