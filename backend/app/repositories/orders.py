from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Tuple

from sqlalchemy import select, func, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Customer, Order, OrderItem, OrderStatus


class CustomerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, customer_id: int) -> Optional[Customer]:
        result = await self.db.execute(select(Customer).where(Customer.id == customer_id))
        return result.scalar_one_or_none()

    async def get_by_store(self, customer_id: int, store_id: int) -> Optional[Customer]:
        result = await self.db.execute(
            select(Customer).where(Customer.id == customer_id, Customer.store_id == store_id)
        )
        return result.scalar_one_or_none()

    async def get_by_phone(self, store_id: int, phone: str) -> Optional[Customer]:
        result = await self.db.execute(
            select(Customer).where(Customer.store_id == store_id, Customer.phone == phone.strip())
        )
        return result.scalar_one_or_none()

    async def create(self, customer: Customer) -> Customer:
        self.db.add(customer)
        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def update(self, customer: Customer) -> Customer:
        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def list_by_store(
        self,
        store_id: int,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Customer], int]:
        conditions = [Customer.store_id == store_id]
        if search:
            like = f"%{search}%"
            conditions.append(
                or_(
                    Customer.full_name.ilike(like),
                    Customer.phone.ilike(like),
                    Customer.city.ilike(like),
                )
            )
        count_query = select(func.count(Customer.id)).where(*conditions)
        total = (await self.db.execute(count_query)).scalar()

        query = (
            select(Customer)
            .where(*conditions)
            .order_by(Customer.last_order_at.desc().nullslast(), Customer.id.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return result.scalars().all(), total

    async def count_by_store(self, store_id: int) -> int:
        result = await self.db.execute(
            select(func.count(Customer.id)).where(Customer.store_id == store_id)
        )
        return result.scalar()


class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, order_id: int) -> Optional[Order]:
        result = await self.db.execute(
            select(Order).where(Order.id == order_id).options(
                selectinload(Order.items),
                selectinload(Order.customer),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_store(self, order_id: int, store_id: int) -> Optional[Order]:
        result = await self.db.execute(
            select(Order)
            .where(Order.id == order_id, Order.store_id == store_id)
            .options(
                selectinload(Order.items),
                selectinload(Order.customer),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_store_and_number(self, store_id: int, order_number: str) -> Optional[Order]:
        result = await self.db.execute(
            select(Order).where(Order.store_id == store_id, Order.order_number == order_number)
        )
        return result.scalar_one_or_none()

    async def next_order_number(self, store_id: int) -> str:
        result = await self.db.execute(
            select(func.count(Order.id)).where(Order.store_id == store_id)
        )
        count = result.scalar() or 0
        return f"ORD-{count + 1:06d}"

    async def create(self, order: Order) -> Order:
        self.db.add(order)
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def update(self, order: Order) -> Order:
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def list_by_store(
        self,
        store_id: int,
        search: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Order], int]:
        conditions = [Order.store_id == store_id]
        if search:
            like = f"%{search}%"
            conditions.append(
                or_(
                    Order.order_number.ilike(like),
                    Order.customer_name.ilike(like),
                    Order.customer_phone.ilike(like),
                )
            )
        if status:
            try:
                conditions.append(Order.status == OrderStatus(status))
            except ValueError:
                pass

        count_query = select(func.count(Order.id)).where(*conditions)
        total = (await self.db.execute(count_query)).scalar()

        query = (
            select(Order)
            .where(*conditions)
            .options(selectinload(Order.items))
            .order_by(Order.placed_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return result.scalars().all(), total

    async def count_by_store(self, store_id: int) -> int:
        result = await self.db.execute(
            select(func.count(Order.id)).where(Order.store_id == store_id)
        )
        return result.scalar()

    async def count_by_status(self, store_id: int, status: OrderStatus) -> int:
        result = await self.db.execute(
            select(func.count(Order.id)).where(
                Order.store_id == store_id, Order.status == status
            )
        )
        return result.scalar()

    async def orders_between(self, store_id: int, start: datetime, end: datetime) -> List[Order]:
        result = await self.db.execute(
            select(Order)
            .where(
                Order.store_id == store_id,
                Order.placed_at >= start,
                Order.placed_at <= end,
                Order.status != OrderStatus.CANCELLED,
            )
            .options(selectinload(Order.items))
        )
        return result.scalars().all()

    async def revenue_between(self, store_id: int, start: datetime, end: datetime) -> Decimal:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Order.total), 0)).where(
                Order.store_id == store_id,
                Order.placed_at >= start,
                Order.placed_at <= end,
                Order.status != OrderStatus.CANCELLED,
            )
        )
        return Decimal(result.scalar() or 0)

    async def all_orders_since(self, store_id: int, since: datetime) -> List[Order]:
        result = await self.db.execute(
            select(Order)
            .where(Order.store_id == store_id, Order.placed_at >= since)
            .options(selectinload(Order.items))
        )
        return result.scalars().all()
