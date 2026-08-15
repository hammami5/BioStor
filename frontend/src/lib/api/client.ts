import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuthTokens, setAuthTokens, clearAuthTokens } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/utils';
import type {
  Paginated,
  Product,
  ProductPayload,
  Category,
  Order,
  Customer,
  CustomerDetail,
  DashboardOverview,
  TimePoint,
  AnalyticsOverview,
  BestProduct,
  NotificationsList,
  Notification,
  Plan,
  Subscription,
  PublicStoreData,
  PublicProduct,
  OrderConfirmation,
  CheckoutItemPayload,
  VariantSelection,
  AdminStats,
  AdminUser,
  AdminStore,
  AdminOrder,
  AdminSubscription,
  Store,
  StoreSettings,
  AuthTokens,
  User,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: AxiosError) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: false,
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const { accessToken } = getAuthTokens();
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const { refreshToken } = getAuthTokens();
            if (!refreshToken) throw new Error('No refresh token');

            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const { access_token, refresh_token } = response.data as AuthTokens;
            setAuthTokens(access_token, refresh_token);
            this.processQueue(null, access_token);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.client(originalRequest);
          } catch (err) {
            this.processQueue(err as AxiosError, '');
            clearAuthTokens();
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
              window.location.href = '/login';
            }
            return Promise.reject(err);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: AxiosError | null, token: string) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(token);
    });
    this.failedQueue = [];
  }

  async upload(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/upload/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // ---- Auth ----
  async register(data: {
    full_name: string;
    email: string;
    password: string;
    store_name: string;
    username: string;
  }): Promise<AuthTokens> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: { email: string; password: string }): Promise<AuthTokens> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async logout(refreshToken: string) {
    const response = await this.client.post('/auth/logout', { refresh_token: refreshToken });
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string) {
    const response = await this.client.post('/auth/reset-password', { token, password });
    return response.data;
  }

  async verifyEmail(token: string) {
    const response = await this.client.post('/auth/verify-email', { token });
    return response.data;
  }

  async resendVerification(email: string) {
    const response = await this.client.post('/auth/resend-verification', { email });
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // ---- Store ----
  async getMyStore(): Promise<Store> {
    const response = await this.client.get('/store/me');
    return response.data;
  }

  async updateMyStore(data: Record<string, unknown>): Promise<Store> {
    const response = await this.client.put('/store/me', data);
    return response.data;
  }

  async updateStoreSettings(data: Partial<StoreSettings> & { logo?: string }): Promise<Store> {
    const response = await this.client.put('/store/me/settings', data);
    return response.data;
  }

  async uploadStoreLogo(file: File): Promise<Store> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.put('/store/me/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // ---- Products ----
  async listProducts(params: {
    search?: string;
    category_id?: number;
    status?: string;
    sort?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<Paginated<Product>> {
    const response = await this.client.get('/products', { params });
    return response.data;
  }

  async getProduct(id: number): Promise<Product> {
    const response = await this.client.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(data: ProductPayload): Promise<Product> {
    const response = await this.client.post('/products', data);
    return response.data;
  }

  async updateProduct(id: number, data: Partial<ProductPayload>): Promise<Product> {
    const response = await this.client.put(`/products/${id}`, data);
    return response.data;
  }

  async setProductStatus(id: number, status: 'active' | 'inactive'): Promise<Product> {
    const response = await this.client.patch(`/products/${id}/status`, { status });
    return response.data;
  }

  async duplicateProduct(id: number): Promise<Product> {
    const response = await this.client.post(`/products/${id}/duplicate`);
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await this.client.delete(`/products/${id}`);
  }

  async listCategories(): Promise<Category[]> {
    const response = await this.client.get('/categories');
    return response.data;
  }

  async createCategory(name: string): Promise<Category> {
    const response = await this.client.post('/categories', { name });
    return response.data;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const response = await this.client.put(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.client.delete(`/categories/${id}`);
  }

  // ---- Orders ----
  async listOrders(params: {
    search?: string;
    status?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<Paginated<Order>> {
    const response = await this.client.get('/orders', { params });
    return response.data;
  }

  async getOrder(id: number): Promise<Order> {
    const response = await this.client.get(`/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id: number, status: Order['status']): Promise<Order> {
    const response = await this.client.put(`/orders/${id}/status`, { status });
    return response.data;
  }

  async updateOrderNote(id: number, internal_note: string | null): Promise<Order> {
    const response = await this.client.put(`/orders/${id}/note`, { internal_note });
    return response.data;
  }

  // ---- Customers ----
  async listCustomers(params: {
    search?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<Paginated<Customer>> {
    const response = await this.client.get('/customers', { params });
    return response.data;
  }

  async getCustomer(id: number): Promise<CustomerDetail> {
    const response = await this.client.get(`/customers/${id}`);
    return response.data;
  }

  // ---- Analytics ----
  async dashboardOverview(): Promise<DashboardOverview> {
    const response = await this.client.get('/analytics/overview');
    return response.data;
  }

  async analyticsSummary(range = '30d'): Promise<AnalyticsOverview> {
    const response = await this.client.get('/analytics/summary', { params: { range } });
    return response.data;
  }

  async ordersOverTime(range = '30d'): Promise<TimePoint[]> {
    const response = await this.client.get('/analytics/orders-over-time', { params: { range } });
    return response.data;
  }

  async revenueOverTime(range = '30d'): Promise<TimePoint[]> {
    const response = await this.client.get('/analytics/revenue-over-time', { params: { range } });
    return response.data;
  }

  async bestProducts(range = '30d'): Promise<BestProduct[]> {
    const response = await this.client.get('/analytics/best-products', { params: { range } });
    return response.data;
  }

  // ---- Notifications ----
  async listNotifications(): Promise<NotificationsList> {
    const response = await this.client.get('/notifications');
    return response.data;
  }

  async unreadNotifications(): Promise<{ count: number }> {
    const response = await this.client.get('/notifications/unread-count');
    return response.data;
  }

  async markNotificationRead(id: number): Promise<Notification> {
    const response = await this.client.post(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsRead(): Promise<{ message: string }> {
    const response = await this.client.post('/notifications/read-all');
    return response.data;
  }

  // ---- Subscriptions ----
  async listPlans(): Promise<Plan[]> {
    const response = await this.client.get('/plans');
    return response.data;
  }

  async getSubscription(): Promise<Subscription> {
    const response = await this.client.get('/subscription');
    return response.data;
  }

  async selectPlan(plan_code: string): Promise<Subscription> {
    const response = await this.client.post('/subscription/select-plan', { plan_code });
    return response.data;
  }

  async cancelSubscription(): Promise<Subscription> {
    const response = await this.client.post('/subscription/cancel');
    return response.data;
  }

  // ---- Public ----
  async publicStore(slug: string, category?: string): Promise<PublicStoreData> {
    const response = await this.client.get(`/store/${slug}`, { params: { category } });
    return response.data;
  }

  async publicProduct(slug: string, productSlug: string): Promise<PublicProduct> {
    const response = await this.client.get(`/store/${slug}/products/${productSlug}`);
    return response.data;
  }

  async createOrder(data: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    note?: string | null;
    items: CheckoutItemPayload[];
  }): Promise<OrderConfirmation> {
    const response = await this.client.post('/orders', data);
    return response.data;
  }

  // ---- Admin ----
  async adminStats(): Promise<AdminStats> {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }

  async adminUsers(params: { search?: string; page?: number; page_size?: number } = {}): Promise<AdminUser[]> {
    const response = await this.client.get('/admin/users', { params });
    return response.data;
  }

  async adminStores(params: { search?: string } = {}): Promise<AdminStore[]> {
    const response = await this.client.get('/admin/stores', { params });
    return response.data;
  }

  async suspendStore(id: number, suspended: boolean): Promise<{ message: string }> {
    const response = await this.client.patch(`/admin/stores/${id}/suspend`, undefined, {
      params: { suspended },
    });
    return response.data;
  }

  async adminOrders(params: { search?: string; status?: string } = {}): Promise<AdminOrder[]> {
    const response = await this.client.get('/admin/orders', { params });
    return response.data;
  }

  async adminPlans(): Promise<Plan[]> {
    const response = await this.client.get('/admin/plans');
    return response.data;
  }

  async updateAdminPlan(id: number, data: Record<string, unknown>): Promise<Plan> {
    const response = await this.client.put(`/admin/plans/${id}`, data);
    return response.data;
  }

  async adminSubscriptions(): Promise<AdminSubscription[]> {
    const response = await this.client.get('/admin/subscriptions');
    return response.data;
  }
}

export const api = new ApiClient();

export interface PlaceOrderPayload {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  note?: string | null;
  items: CheckoutItemPayload[];
}

class PublicApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async publicStore(slug: string): Promise<PublicStoreData> {
    const response = await this.client.get(`/store/${slug}`);
    return response.data;
  }

  async publicProduct(slug: string, productSlug: string): Promise<PublicProduct> {
    const response = await this.client.get(`/store/${slug}/products/${productSlug}`);
    return response.data;
  }

  async placeOrder(data: PlaceOrderPayload): Promise<OrderConfirmation> {
    const response = await this.client.post('/orders', data);
    return response.data;
  }
}

export const publicApi = new PublicApiClient();
