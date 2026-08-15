from enum import Enum


class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    STORE_OWNER = "store_owner"


class OrderStatus(str, Enum):
    NEW = "new"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class SubscriptionPlanCode(str, Enum):
    FREE = "free"
    PRO = "pro"
    BUSINESS = "business"


class SubscriptionStatus(str, Enum):
    TRIALING = "trialing"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class NotificationType(str, Enum):
    NEW_ORDER = "new_order"
    ORDER_STATUS = "order_status"
    LOW_STOCK = "low_stock"
    SYSTEM = "system"


class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class ButtonStyle(str, Enum):
    ROUNDED = "rounded"
    PILL = "pill"
    SQUARE = "square"


class StoreTheme(str, Enum):
    LIGHT = "light"
    DARK = "dark"
