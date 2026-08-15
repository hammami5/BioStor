"""Creates demo data so the platform looks complete immediately.

Idempotent: safe to run on every startup.
"""
import random
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
from app.models import (
    User,
    Store,
    StoreSettings,
    Category,
    Product,
    ProductStatus,
    VariantGroup,
    VariantOption,
    Order,
    OrderItem,
    OrderStatus,
    Customer,
    Notification,
    NotificationType,
    Plan,
    Subscription,
    SubscriptionStatus,
    SubscriptionPlanCode,
    UserRole,
)

DEMO_PRODUCTS = [
    {
        "name": "Silk Touch Serum",
        "category": "Skincare",
        "description": "A lightweight, fast-absorbing facial serum with hyaluronic acid and vitamin C that leaves skin glowing. Perfect for everyday use.",
        "price": 29.0,
        "discount_price": 24.0,
        "stock": 42,
        "variants": [{"name": "Size", "options": ["30ml", "50ml"]}],
    },
    {
        "name": "Matte Lipstick Duo",
        "category": "Makeup",
        "description": "Two long-lasting matte lipsticks in neutral shades. Creamy texture that stays put for up to 8 hours.",
        "price": 18.0,
        "discount_price": 14.0,
        "stock": 65,
        "variants": [{"name": "Shade", "options": ["Nude", "Rosé", "Terracotta"]}],
    },
    {
        "name": "Oversized Cotton Tee",
        "category": "Clothing",
        "description": "Premium 100% cotton oversized t-shirt with a relaxed fit. Pre-shrunk and super soft.",
        "price": 25.0,
        "discount_price": None,
        "stock": 30,
        "variants": [
            {"name": "Size", "options": ["S", "M", "L", "XL"]},
            {"name": "Color", "options": ["Black", "White", "Sand"]},
        ],
    },
    {
        "name": "Minimalist Gold Necklace",
        "category": "Accessories",
        "description": "A delicate 18k gold-plated necklace with a dainty pendant. Hypoallergenic and tarnish-resistant.",
        "price": 39.0,
        "discount_price": 34.0,
        "stock": 18,
        "variants": [{"name": "Length", "options": ["40cm", "45cm"]}],
    },
    {
        "name": "Leather Crossbody Bag",
        "category": "Accessories",
        "description": "Compact vegan leather crossbody bag with adjustable strap and two interior pockets. Fits your phone, wallet and keys.",
        "price": 59.0,
        "discount_price": None,
        "stock": 12,
        "variants": [{"name": "Color", "options": ["Black", "Camel"]}],
    },
    {
        "name": "Cloud Puff Socks (3-Pack)",
        "category": "Clothing",
        "description": "Ultra-soft breathable socks in a 3-pack. Made for all-day comfort.",
        "price": 12.0,
        "discount_price": 9.0,
        "stock": 80,
        "variants": [{"name": "Size", "options": ["35-38", "39-42"]}],
    },
    {
        "name": "Glass Water Bottle 750ml",
        "category": "Home",
        "description": "Borosilicate glass bottle with a leak-proof bamboo lid and protective silicone sleeve.",
        "price": 22.0,
        "discount_price": None,
        "stock": 25,
        "variants": [{"name": "Color", "options": ["Clear", "Smoke"]}],
    },
    {
        "name": "Scented Soy Candle",
        "category": "Home",
        "description": "Hand-poured soy candle with essential oils. Burn time of approximately 40 hours.",
        "price": 16.0,
        "discount_price": 13.0,
        "stock": 48,
        "variants": [{"name": "Scent", "options": ["Vanilla", "Lavender", "Citrus"]}],
    },
    {
        "name": "Structured Wool Blazer",
        "category": "Clothing",
        "description": "Tailored blazer in a wool blend. Timeless silhouette that pairs with anything.",
        "price": 89.0,
        "discount_price": None,
        "stock": 8,
        "variants": [
            {"name": "Size", "options": ["S", "M", "L"]},
            {"name": "Color", "options": ["Charcoal", "Beige"]},
        ],
    },
    {
        "name": "Rose Quartz Face Roller",
        "category": "Skincare",
        "description": "Chilled rose quartz roller to depuff and boost circulation. Comes with a storage pouch.",
        "price": 19.0,
        "discount_price": 15.0,
        "stock": 55,
        "variants": [],
    },
]

DEMO_CUSTOMERS = [
    ("Sarah Chen", "+1 202 555 0147", "1284 Maple Street, Apt 4B", "Washington"),
    ("Marcus Johnson", "+1 310 555 0199", "887 Sunset Boulevard", "Los Angeles"),
    ("Emma Rodriguez", "+1 212 555 0113", "45 W 34th Street", "New York"),
    ("David Park", "+1 415 555 0178", "902 Market Street", "San Francisco"),
    ("Aisha Okafor", "+1 773 555 0142", "3140 N Lake Shore Drive", "Chicago"),
    ("Liam O'Brien", "+1 617 555 0166", "500 Commonwealth Ave", "Boston"),
    ("Yuki Tanaka", "+1 206 555 0125", "800 Pine Street", "Seattle"),
    ("Nora Fischer", "+1 305 555 0181", "777 Brickell Avenue", "Miami"),
]

STATUS_FLOW = [
    OrderStatus.NEW,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
]

PLANS = [
    {
        "code": SubscriptionPlanCode.FREE,
        "name": "Free",
        "description": "Start selling with a beautiful store. Everything you need to get your first orders.",
        "price_monthly": 0,
        "price_yearly": None,
        "product_limit": 10,
        "order_limit": None,
        "features": [
            "Up to 10 products",
            "Personalized store link",
            "Mobile-first storefront",
            "Order management",
            "Basic analytics",
            "BioStor branding",
        ],
        "custom_branding": False,
        "advanced_analytics": False,
        "priority_support": False,
        "sort_order": 0,
    },
    {
        "code": SubscriptionPlanCode.PRO,
        "name": "Pro",
        "description": "For growing sellers who need more products, advanced analytics and no branding.",
        "price_monthly": 19,
        "price_yearly": 190,
        "product_limit": 200,
        "order_limit": None,
        "features": [
            "Up to 200 products",
            "Remove BioStor branding",
            "Advanced analytics",
            "Store customization",
            "Product variants",
            "Priority email support",
        ],
        "custom_branding": True,
        "advanced_analytics": True,
        "priority_support": False,
        "sort_order": 1,
    },
    {
        "code": SubscriptionPlanCode.BUSINESS,
        "name": "Business",
        "description": "For serious sellers and small businesses. Unlimited products and everything unlocked.",
        "price_monthly": 49,
        "price_yearly": 490,
        "product_limit": 0,
        "order_limit": None,
        "features": [
            "Unlimited products",
            "Remove BioStor branding",
            "Advanced analytics",
            "Advanced customization",
            "Custom domain-ready",
            "Priority support",
        ],
        "custom_branding": True,
        "advanced_analytics": True,
        "priority_support": True,
        "sort_order": 2,
    },
]


async def seed_demo_data() -> None:
    async with AsyncSessionLocal() as db:
        await _seed_plans(db)
        await _seed_admin(db)
        await _seed_demo_seller(db)


async def _seed_plans(db: AsyncSession) -> None:
    for plan_data in PLANS:
        existing = await db.execute(
            select(Plan).where(Plan.code == plan_data["code"])
        )
        if existing.scalar_one_or_none():
            continue
        db.add(Plan(**plan_data))
    await db.commit()


async def _seed_admin(db: AsyncSession) -> None:
    existing = await db.execute(
        select(User).where(User.email == settings.ADMIN_EMAIL)
    )
    if existing.scalar_one_or_none():
        return
    admin = User(
        full_name="BioStor Admin",
        email=settings.ADMIN_EMAIL,
        username="biostor",
        password_hash=get_password_hash(settings.ADMIN_PASSWORD),
        role=UserRole.SUPER_ADMIN,
        is_verified=True,
    )
    db.add(admin)
    await db.commit()


async def _seed_demo_seller(db: AsyncSession) -> None:
    demo_email = "adem@biostor.app"
    existing = await db.execute(select(User).where(User.email == demo_email))
    if existing.scalar_one_or_none():
        return

    user = User(
        full_name="Adem Kaya",
        email=demo_email,
        username="ademshop",
        password_hash=get_password_hash("Demo@12345"),
        role=UserRole.STORE_OWNER,
        is_verified=True,
    )
    db.add(user)
    await db.flush()

    store = Store(
        owner_id=user.id,
        store_name="Adem's Boutique",
        slug="ademshop",
        description="Curated skincare, fashion and lifestyle essentials — with love from Adem. DM us on Instagram for any questions!",
        instagram_username="ademshop",
        logo="/demo/logo.svg",
        contact_email="hello@ademshop.biostor.app",
        contact_phone="+1 555 010 2030",
        contact_address="24 Riviera Avenue",
        contact_city="Dubai",
    )
    db.add(store)
    await db.flush()

    db.add(StoreSettings(store_id=store.id, accent_color="#C9A227", delivery_fee=5.0, currency="USD"))
    db.add(
        Subscription(
            store_id=store.id,
            plan_code=SubscriptionPlanCode.PRO,
            status=SubscriptionStatus.ACTIVE,
        )
    )

    categories = {}
    for cat_name in ["Skincare", "Makeup", "Clothing", "Accessories", "Home"]:
        category = Category(
            store_id=store.id,
            name=cat_name,
            slug=cat_name.lower(),
            position=len(categories),
        )
        db.add(category)
        await db.flush()
        categories[cat_name] = category

    images = [
        "/demo/serum.svg",
        "/demo/lipstick.svg",
        "/demo/tee.svg",
        "/demo/necklace.svg",
        "/demo/bag.svg",
        "/demo/socks.svg",
        "/demo/bottle.svg",
        "/demo/candle.svg",
        "/demo/blazer.svg",
        "/demo/roller.svg",
    ]
    products = []
    for idx, product_data in enumerate(DEMO_PRODUCTS):
        product = Product(
            store_id=store.id,
            category_id=categories[product_data["category"]].id,
            name=product_data["name"],
            slug=product_data["name"].lower().replace(" ", "-").replace("(", "").replace(")", ""),
            description=product_data["description"],
            price=Decimal(str(product_data["price"])),
            discount_price=Decimal(str(product_data["discount_price"]))
            if product_data["discount_price"]
            else None,
            stock=product_data["stock"],
            status=ProductStatus.ACTIVE,
            images=[images[idx]],
            is_featured=idx < 4,
        )
        db.add(product)
        await db.flush()
        products.append(product)

        for group_data in product_data.get("variants", []):
            group = VariantGroup(product_id=product.id, name=group_data["name"], position=0)
            db.add(group)
            await db.flush()
            for opt_idx, value in enumerate(group_data["options"]):
                db.add(
                    VariantOption(
                        group_id=group.id,
                        value=value,
                        position=opt_idx,
                        additional_price=Decimal("0"),
                        stock=random.randint(4, 40),
                    )
                )

    await db.commit()

    await _seed_orders(db, store, products)


async def _seed_orders(db: AsyncSession, store: Store, products: list[Product]) -> None:
    customers = []
    for full_name, phone, address, city in DEMO_CUSTOMERS:
        customer = Customer(
            store_id=store.id,
            full_name=full_name,
            phone=phone,
            address=address,
            city=city,
        )
        db.add(customer)
        await db.flush()
        customers.append(customer)

    now = datetime.utcnow()
    order_number = 1
    for customer in customers:
        # 2-4 orders per customer over the last 45 days
        for _ in range(random.randint(2, 4)):
            placed_at = now - timedelta(days=random.randint(0, 45), hours=random.randint(0, 23))
            selected = random.sample(products, random.randint(1, 3))
            subtotal = Decimal("0")
            items = []
            for product in selected:
                quantity = random.randint(1, 3)
                unit_price = Decimal(str(product.discount_price or product.price))
                total = unit_price * quantity
                subtotal += total
                items.append(
                    OrderItem(
                        product_id=product.id,
                        product_name=product.name,
                        product_image=(product.images or [None])[0],
                        unit_price=unit_price,
                        quantity=quantity,
                        total=total,
                    )
                )
            delivery_fee = Decimal("5.00")
            order = Order(
                store_id=store.id,
                customer_id=customer.id,
                order_number=f"ORD-{order_number:06d}",
                status=random.choice(STATUS_FLOW),
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                total=subtotal + delivery_fee,
                currency="USD",
                customer_name=customer.full_name,
                customer_phone=customer.phone,
                customer_address=customer.address,
                customer_city=customer.city,
                placed_at=placed_at,
            )
            db.add(order)
            await db.flush()
            for item in items:
                item.order_id = order.id
                db.add(item)
            order_number += 1

    await db.commit()

    # Recompute customer stats + a notification sample
    for customer in customers:
        orders = await db.execute(
            select(Order).where(Order.customer_id == customer.id)
        )
        customer_orders = orders.scalars().all()
        customer.total_orders = len(customer_orders)
        customer.total_spent = sum((o.total for o in customer_orders), Decimal("0"))
        if customer_orders:
            customer.last_order_at = max(o.placed_at for o in customer_orders)

    latest = await db.execute(
        select(Order).where(Order.store_id == store.id).order_by(Order.placed_at.desc()).limit(1)
    )
    latest_order = latest.scalar_one_or_none()
    if latest_order:
        db.add(
            Notification(
                store_id=store.id,
                type=NotificationType.NEW_ORDER,
                title="New order received",
                message=f"{latest_order.customer_name} placed order {latest_order.order_number}",
                data={"order_id": latest_order.id, "order_number": latest_order.order_number},
            )
        )

    await db.commit()
