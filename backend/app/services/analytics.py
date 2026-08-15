from collections import Counter, defaultdict
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import OrderStatus, Store
from app.repositories.catalog import ProductRepository
from app.repositories.notifications import NotificationRepository
from app.repositories.orders import CustomerRepository, OrderRepository
from app.repositories.subscriptions import SubscriptionRepository


def get_range_bounds(range_key: str) -> tuple[datetime, datetime]:
    now = datetime.utcnow()
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    if range_key == "today":
        return start_of_today, now
    if range_key == "7d":
        return now - timedelta(days=7), now
    if range_key == "30d":
        return now - timedelta(days=30), now
    if range_key == "3m":
        return now - timedelta(days=90), now
    if range_key == "1y":
        return now - timedelta(days=365), now
    return now - timedelta(days=30), now


def build_series(orders, start: datetime, end: datetime, bucket: str):
    """Groups orders into equal buckets of the selected range."""
    import calendar

    points = []
    cursor = start
    if bucket == "day":
        while cursor <= end:
            next_ = cursor + timedelta(days=1)
            points.append((cursor, next_, cursor.strftime("%b %d")))
            cursor = next_
    elif bucket == "hour":
        while cursor <= end:
            next_ = cursor + timedelta(hours=1)
            points.append((cursor, next_, cursor.strftime("%H:00")))
            cursor = next_
    elif bucket == "month":
        while cursor <= end:
            last_day = calendar.monthrange(cursor.year, cursor.month)[1]
            next_ = cursor.replace(day=1) + timedelta(days=last_day)
            points.append((cursor, next_, cursor.strftime("%b %Y")))
            cursor = next_
    elif bucket == "week":
        while cursor <= end:
            next_ = cursor + timedelta(days=7)
            points.append((cursor, next_, cursor.strftime("%b %d")))
            cursor = next_

    series = []
    idx = 0
    for start_b, end_b, label in points:
        revenue = Decimal("0")
        count = 0
        while idx < len(orders) and orders[idx].placed_at < end_b:
            order = orders[idx]
            revenue += Decimal(str(order.total))
            count += 1
            idx += 1
        series.append(
            {"label": label, "date": start_b.isoformat(), "value": float(revenue), "orders": count}
        )
    return series


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.customer_repo = CustomerRepository(db)
        self.product_repo = ProductRepository(db)
        self.notification_repo = NotificationRepository(db)
        self.subscription_repo = SubscriptionRepository(db)

    async def overview(self, store: Store, range_key: str = "30d"):
        start, end = get_range_bounds(range_key)
        orders = await self.order_repo.orders_between(store.id, start, end)
        orders_by_product = Counter()
        revenue_by_product = defaultdict(Decimal)
        for order in orders:
            for item in order.items:
                orders_by_product[item.product_name] += item.quantity
                revenue_by_product[item.product_name] += Decimal(str(item.total))

        best_selling = [
            {
                "product_id": None,
                "name": name,
                "quantity": quantity,
                "revenue": float(revenue_by_product[name]),
            }
            for name, quantity in orders_by_product.most_common(5)
        ]

        status_counts = Counter(o.status.value for o in orders)
        total_revenue = sum((Decimal(str(o.total)) for o in orders), Decimal("0"))
        total_orders = len(orders)
        avg_order_value = float(total_revenue / total_orders) if total_orders else 0

        customers_in_range = await self.customer_repo.count_by_store(store.id)
        conversion_rate = self._conversion_rate(orders, customers_in_range)

        return {
            "total_revenue": float(total_revenue),
            "total_orders": total_orders,
            "average_order_value": avg_order_value,
            "conversion_rate": conversion_rate,
            "customers": customers_in_range,
            "best_selling_products": best_selling,
            "status_breakdown": [{"status": k, "count": v} for k, v in status_counts.items()],
        }

    def _conversion_rate(self, orders, customers) -> float:
        total = customers or 1
        return round((len(orders) / total) * 100, 2)

    async def orders_over_time(self, store: Store, range_key: str):
        start, end = get_range_bounds(range_key)
        bucket = self._bucket_for(range_key)
        orders = await self.order_repo.orders_between(store.id, start, end)
        orders.sort(key=lambda o: o.placed_at)
        return build_series(orders, start, end, bucket)

    async def revenue_over_time(self, store: Store, range_key: str):
        return await self.orders_over_time(store, range_key)

    async def dashboard(self, store: Store):
        now = datetime.utcnow()
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)

        total_orders = await self.order_repo.count_by_store(store.id)
        today_orders = len(await self.order_repo.orders_between(store.id, start_of_today, now))
        total_revenue = float(
            await self.order_repo.revenue_between(store.id, datetime.min, now)
        )
        pending_orders = await self.order_repo.count_by_status(store.id, OrderStatus.NEW)
        total_products = await self.product_repo.count_by_store(store.id)
        total_customers = await self.customer_repo.count_by_store(store.id)
        unread_notifications = await self.notification_repo.unread_count(store.id)
        low_stock_count = len(await self.product_repo.low_stock_products(store.id))

        return {
            "total_orders": total_orders,
            "today_orders": today_orders,
            "total_revenue": total_revenue,
            "pending_orders": pending_orders,
            "total_products": total_products,
            "total_customers": total_customers,
            "unread_notifications": unread_notifications,
            "low_stock_count": low_stock_count,
        }

    async def best_products(self, store: Store, range_key: str):
        data = await self.overview(store, range_key)
        return data["best_selling_products"]

    def _bucket_for(self, range_key: str) -> str:
        if range_key == "today":
            return "hour"
        if range_key == "7d":
            return "day"
        if range_key == "30d":
            return "day"
        if range_key == "3m":
            return "week"
        if range_key == "1y":
            return "month"
        return "day"
