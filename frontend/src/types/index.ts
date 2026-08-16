import type {
  OrderStatus,
  ProductStatus,
  SubscriptionPlanCode,
  SubscriptionStatus,
  NotificationType,
  ButtonStyle,
  StoreTheme,
  Store,
  StoreSettings,
  User,
  UserRole,
  AuthTokens,
} from './auth';

export type * from './auth';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  product_count: number;
}

export interface VariantOption {
  id: number;
  value: string;
  additional_price: number;
  stock: number | null;
}

export interface VariantGroup {
  id: number;
  name: string;
  options: VariantOption[];
}

export interface VariantOptionIn {
  value: string;
  additional_price: number;
  stock: number | null;
}

export interface VariantGroupIn {
  name: string;
  options: VariantOptionIn[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  discount_price?: number | null;
  stock: number;
  status: ProductStatus;
  images: string[];
  category_id?: number | null;
  is_featured: boolean;
  created_at: string;
  category?: Category | null;
  variant_groups: VariantGroup[];
}

export interface ProductPayload {
  name: string;
  description?: string | null;
  price: number;
  discount_price?: number | null;
  stock: number;
  category_id?: number | null;
  images: string[];
  is_featured: boolean;
  status: ProductStatus;
  variant_groups: VariantGroupIn[];
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_image?: string | null;
  variant_text?: string | null;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  note?: string | null;
  internal_note?: string | null;
  placed_at: string;
  items: OrderItem[];
}

export interface Customer {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  total_orders: number;
  total_spent: number;
  last_order_at?: string | null;
  created_at: string;
}

export interface CustomerDetail extends Customer {
  orders: Order[];
}

export interface DashboardOverview {
  total_orders: number;
  today_orders: number;
  total_revenue: number;
  pending_orders: number;
  total_products: number;
  total_customers: number;
  unread_notifications: number;
  low_stock_count: number;
}

export interface TimePoint {
  label: string;
  date: string;
  value: number;
  orders: number;
}

export interface BestProduct {
  product_id: number | null;
  name: string;
  quantity: number;
  revenue: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

export interface AnalyticsOverview {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  conversion_rate: number;
  customers: number;
  best_selling_products: BestProduct[];
  status_breakdown: StatusBreakdown[];
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  data?: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationsList {
  items: Notification[];
  unread_count: number;
}

export interface Plan {
  id: number;
  code: SubscriptionPlanCode;
  name: string;
  description?: string | null;
  price_monthly: number;
  price_yearly?: number | null;
  product_limit: number;
  order_limit?: number | null;
  features: string[];
  custom_branding: boolean;
  advanced_analytics: boolean;
  priority_support: boolean;
  is_active: boolean;
}

export interface Subscription {
  id: number;
  plan_code: SubscriptionPlanCode;
  status: SubscriptionStatus;
  current_period_start?: string | null;
  current_period_end?: string | null;
  provider?: string | null;
  cancel_at_period_end: boolean;
  plan?: Plan | null;
}

export interface PublicVariantOption {
  value: string;
  additional_price: number;
  in_stock: boolean;
}

export interface PublicVariantGroup {
  name: string;
  options: PublicVariantOption[];
}

export interface PublicProduct {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  discount_price?: number | null;
  images: string[];
  stock: number;
  in_stock: boolean;
  category_id?: number | null;
  variant_groups: PublicVariantGroup[];
}

export interface PublicStoreData {
  products: PublicProduct[];
  categories: Category[];
  store: Store;
}

export interface VariantSelection {
  group: string;
  value: string;
}

export interface CheckoutItemPayload {
  product_id: number;
  quantity: number;
  variant_group?: string | null;
  variant_value?: string | null;
  variant_selections?: VariantSelection[];
}

export interface OrderConfirmation {
  order_number: string;
  total: number;
  currency: string;
  customer_name: string;
  status: OrderStatus;
  placed_at: string;
  items: OrderItem[];
  delivery_fee: number;
  subtotal: number;
  store_name: string;
  message: string;
}

export interface AdminStats {
  total_users: number;
  active_stores: number;
  total_orders: number;
  platform_revenue: number;
  new_users_30d: number;
  active_subscriptions: number;
  subscription_breakdown: Record<string, number>;
  recent_orders: number;
}

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  store_name?: string | null;
  store_slug?: string | null;
}

export interface AdminStore {
  id: number;
  store_name: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  is_active: boolean;
  is_suspended: boolean;
  product_count: number;
  order_count: number;
  plan_code: string;
  created_at: string;
}

export interface AdminOrder {
  id: number;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  store_name: string;
  customer_name: string;
  placed_at: string;
}

export interface AdminSubscription {
  id: number;
  store_name: string;
  plan_code: SubscriptionPlanCode;
  status: SubscriptionStatus;
  provider?: string | null;
  created_at: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'new',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_I18N_KEYS: Record<OrderStatus, string> = {
  new: 'order_status_new',
  confirmed: 'order_status_confirmed',
  preparing: 'order_status_preparing',
  shipped: 'order_status_shipped',
  delivered: 'order_status_delivered',
  cancelled: 'order_status_cancelled',
};

export const PLAN_LABELS: Record<SubscriptionPlanCode, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
};

export const PLAN_I18N_KEYS: Record<SubscriptionPlanCode, string> = {
  free: 'plan_free',
  pro: 'plan_pro',
  business: 'plan_business',
};
