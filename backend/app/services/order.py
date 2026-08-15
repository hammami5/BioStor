from datetime import datetime
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Customer,
    Order,
    OrderItem,
    OrderStatus,
    Product,
    ProductStatus,
    Store,
    NotificationType,
    VariantGroup,
    VariantOption,
)
from app.repositories.catalog import ProductRepository, VariantRepository
from app.repositories.notifications import NotificationRepository
from app.repositories.orders import CustomerRepository, OrderRepository
from app.schemas.order import (
    CheckoutItem,
    CheckoutRequest,
    OrderConfirmation,
)


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.customer_repo = CustomerRepository(db)
        self.product_repo = ProductRepository(db)
        self.variant_repo = VariantRepository(db)
        self.notification_repo = NotificationRepository(db)

    async def resolve_store_from_items(self, items: list[CheckoutItem]) -> Store:
        """Resolves the store that owns the cart's products.

        This is the only trusted way to know which store an order belongs to —
        the client never supplies a store id, so a seller can never create an
        order against another seller's store.
        """
        if not items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty"
            )
        first = items[0]
        product = await self.product_repo.get_by_id(first.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Product not found"
            )
        from app.repositories.store import StoreRepository
        from app.repositories.store import StoreSettingsRepository

        store_repo = StoreRepository(self.db)
        store = await store_repo.get_by_id(product.store_id)
        if not store or store.is_suspended or not store.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Store not found"
            )
        settings_repo = StoreSettingsRepository(self.db)
        settings = await settings_repo.get_by_store_id(store.id)
        if settings:
            store.settings = settings
        else:
            from app.models import StoreSettings

            store.settings = await settings_repo.create(StoreSettings(store_id=store.id))
        return store

    async def checkout(self, store: Store, data: CheckoutRequest) -> OrderConfirmation:
        settings = store.settings
        delivery_fee = Decimal(str(settings.delivery_fee)) if settings else Decimal("0")

        subtotal = Decimal("0")
        items_to_create = []

        for item in data.items:
            product = await self.product_repo.get_by_store(item.product_id, store.id)
            if not product or product.status != ProductStatus.ACTIVE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product #{item.product_id} is not available",
                )

            unit_price = await self._effective_price(product)
            variant_text = None

            selections = [
                {"group": s.group, "value": s.value} for s in (item.variant_selections or [])
            ]
            if item.variant_group and item.variant_value:
                selections.append(
                    {"group": item.variant_group, "value": item.variant_value}
                )
            if selections:
                variant_text, unit_price = await self._resolve_variants(
                    product, selections, unit_price, item.quantity
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Only {product.stock} unit(s) of \"{product.name}\" left in stock",
                )

            line_total = unit_price * item.quantity
            subtotal += line_total

            items_to_create.append(
                {
                    "product": product,
                    "product_name": product.name,
                    "product_image": (product.images or [None])[0],
                    "variant_text": variant_text,
                    "unit_price": unit_price,
                    "quantity": item.quantity,
                    "total": line_total,
                }
            )

        total = subtotal + delivery_fee

        customer = await self._find_or_create_customer(store, data)
        order_number = await self.order_repo.next_order_number(store.id)

        order = Order(
            store_id=store.id,
            customer_id=customer.id if customer else None,
            order_number=order_number,
            status=OrderStatus.NEW,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
            currency=(settings.currency if settings else "USD"),
            customer_name=data.full_name.strip(),
            customer_phone=data.phone.strip(),
            customer_address=data.address.strip(),
            customer_city=data.city.strip(),
            note=data.note,
            placed_at=datetime.utcnow(),
        )
        order = await self.order_repo.create(order)

        for entry in items_to_create:
            order_item = OrderItem(
                order_id=order.id,
                product_id=entry["product"].id,
                product_name=entry["product_name"],
                product_image=entry["product_image"],
                variant_text=entry["variant_text"],
                unit_price=entry["unit_price"],
                quantity=entry["quantity"],
                total=entry["total"],
            )
            self.db.add(order_item)
            entry["product"].stock -= entry["quantity"]

        await self.db.commit()

        if customer:
            customer.total_orders += 1
            customer.total_spent = (customer.total_spent or Decimal("0")) + total
            customer.last_order_at = datetime.utcnow()
            await self.customer_repo.update(customer)

        await self.notification_repo.create(
            store_id=store.id,
            type=NotificationType.NEW_ORDER,
            title="New order received",
            message=f"{order.customer_name} placed order {order.order_number} for {order.currency} {total:.2f}",
            data={"order_id": order.id, "order_number": order.order_number},
        )

        confirmation_items = []
        for entry in items_to_create:
            confirmation_items.append(
                {
                    "product_id": entry["product"].id,
                    "product_name": entry["product_name"],
                    "product_image": entry["product_image"],
                    "variant_text": entry["variant_text"],
                    "unit_price": float(entry["unit_price"]),
                    "quantity": entry["quantity"],
                    "total": float(entry["total"]),
                }
            )

        return OrderConfirmation(
            order_number=order_number,
            total=float(total),
            currency=order.currency,
            customer_name=order.customer_name,
            status=OrderStatus.NEW,
            placed_at=order.placed_at,
            items=confirmation_items,
            delivery_fee=float(delivery_fee),
            subtotal=float(subtotal),
            store_name=store.store_name,
        )

    async def _effective_price(self, product: Product) -> Decimal:
        if product.discount_price is not None:
            return Decimal(str(product.discount_price))
        return Decimal(str(product.price))

    async def _resolve_variants(
        self,
        product: Product,
        selections: list[dict],
        base_price: Decimal,
        quantity: int,
    ) -> tuple[str, Decimal]:
        groups = await self.variant_repo.list_groups(product.id)
        final_price = base_price
        parts: list[str] = []

        for selection in selections:
            match = None
            for group in groups:
                if group.name.lower() == selection["group"].lower():
                    for option in group.options:
                        if option.value.lower() == selection["value"].lower():
                            match = (group, option)
                            break
                    if match:
                        break
            if not match:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid variant for \"{product.name}\"",
                )
            group, option = match
            if option.stock is not None and option.stock < quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Only {option.stock} unit(s) of {group.name}: {option.value} left",
                )
            if option.stock is not None:
                option.stock -= quantity

            final_price += Decimal(str(option.additional_price or 0))
            parts.append(f"{group.name}: {option.value}")

        return ", ".join(parts), final_price

    async def _find_or_create_customer(self, store: Store, data: CheckoutRequest) -> Optional[Customer]:
        phone = data.phone.strip()
        customer = await self.customer_repo.get_by_phone(store.id, phone)
        if not customer:
            customer = Customer(
                store_id=store.id,
                full_name=data.full_name.strip(),
                phone=phone,
                address=data.address.strip(),
                city=data.city.strip(),
                note=data.note,
                total_orders=0,
                total_spent=Decimal("0"),
            )
            customer = await self.customer_repo.create(customer)
        else:
            customer.full_name = data.full_name.strip()
            customer.address = data.address.strip()
            customer.city = data.city.strip()
            if data.note:
                customer.note = data.note
        return customer

    async def get_order(self, store: Store, order_id: int) -> Order:
        order = await self.order_repo.get_by_store(order_id, store.id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    async def list_orders(
        self, store: Store, search=None, status_filter=None, page=1, page_size=20
    ):
        items, total = await self.order_repo.list_by_store(
            store.id,
            search=search,
            status=status_filter,
            skip=(page - 1) * page_size,
            limit=page_size,
        )
        result = []
        for order in items:
            result.append(
                {
                    "id": order.id,
                    "order_number": order.order_number,
                    "status": order.status,
                    "total": float(order.total),
                    "currency": order.currency,
                    "customer_name": order.customer_name,
                    "customer_phone": order.customer_phone,
                    "item_count": sum(i.quantity for i in order.items),
                    "placed_at": order.placed_at,
                }
            )
        return {"items": result, "total": total, "page": page, "page_size": page_size}

    async def update_status(self, store: Store, order_id: int, new_status: OrderStatus) -> Order:
        order = await self.get_order(store, order_id)
        if order.status == OrderStatus.CANCELLED and new_status != OrderStatus.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A cancelled order cannot be reactivated",
            )
        order.status = new_status
        await self.order_repo.update(order)

        await self.notification_repo.create(
            store_id=store.id,
            type=NotificationType.ORDER_STATUS,
            title="Order status updated",
            message=f"Order {order.order_number} is now {new_status.value}",
            data={"order_id": order.id, "order_number": order.order_number},
        )
        return order

    async def update_internal_note(self, store: Store, order_id: int, note: Optional[str]) -> Order:
        order = await self.get_order(store, order_id)
        order.internal_note = note or None
        await self.order_repo.update(order)
        return order

    async def list_customers(self, store: Store, search=None, page=1, page_size=20):
        items, total = await self.customer_repo.list_by_store(
            store.id, search=search, skip=(page - 1) * page_size, limit=page_size
        )
        result = []
        for customer in items:
            result.append(
                {
                    "id": customer.id,
                    "full_name": customer.full_name,
                    "phone": customer.phone,
                    "address": customer.address,
                    "city": customer.city,
                    "total_orders": customer.total_orders,
                    "total_spent": float(customer.total_spent or 0),
                    "last_order_at": customer.last_order_at,
                    "created_at": customer.created_at,
                }
            )
        return {"items": result, "total": total, "page": page, "page_size": page_size}

    async def customer_detail(self, store: Store, customer_id: int) -> dict:
        customer = await self.customer_repo.get_by_store(customer_id, store.id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        orders = await self.order_repo.all_orders_since(store.id, datetime.min)
        customer_orders = [o for o in orders if o.customer_id == customer.id]
        return {
            "id": customer.id,
            "full_name": customer.full_name,
            "phone": customer.phone,
            "address": customer.address,
            "city": customer.city,
            "total_orders": customer.total_orders,
            "total_spent": float(customer.total_spent or 0),
            "last_order_at": customer.last_order_at,
            "created_at": customer.created_at,
            "orders": [
                {
                    "id": o.id,
                    "order_number": o.order_number,
                    "status": o.status,
                    "subtotal": float(o.subtotal),
                    "delivery_fee": float(o.delivery_fee),
                    "total": float(o.total),
                    "currency": o.currency,
                    "customer_name": o.customer_name,
                    "customer_phone": o.customer_phone,
                    "customer_address": o.customer_address,
                    "customer_city": o.customer_city,
                    "note": o.note,
                    "internal_note": o.internal_note,
                    "placed_at": o.placed_at,
                    "items": [
                        {
                            "id": i.id,
                            "product_id": i.product_id,
                            "product_name": i.product_name,
                            "product_image": i.product_image,
                            "variant_text": i.variant_text,
                            "unit_price": float(i.unit_price),
                            "quantity": i.quantity,
                            "total": float(i.total),
                        }
                        for i in o.items
                    ],
                }
                for o in customer_orders
            ],
        }
