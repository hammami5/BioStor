export type UserRole = 'super_admin' | 'store_owner';

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type ProductStatus = 'active' | 'inactive';

export type SubscriptionPlanCode = 'free' | 'pro' | 'business';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'expired';

export type NotificationType = 'new_order' | 'order_status' | 'low_stock' | 'system';

export type ButtonStyle = 'rounded' | 'pill' | 'square';
export type StoreTheme = 'light' | 'dark';

export interface User {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  store?: Store;
}

export interface StoreSettings {
  accent_color: string;
  button_style: ButtonStyle;
  theme: StoreTheme;
  currency: string;
  delivery_fee: number;
}

export interface Store {
  id: number;
  owner_id: number;
  store_name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  instagram_username: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_city: string | null;
  is_active: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
  settings?: StoreSettings;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  store_name: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
