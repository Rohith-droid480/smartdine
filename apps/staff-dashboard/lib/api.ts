// =============================================================================
// apps/staff-dashboard/lib/api.ts
// Typed API client for the staff dashboard.
// Staff routes include all customer routes plus staff-only endpoints.
// =============================================================================

import type {
  ApiResponse,
  AuthResponse,
  User,
  MenuItem,
  Table,
  Reservation,
  Order,
  InventoryItem,
  Staff,
  Notification,
  ForecastItem,
  InsightsResponse,
  SalesDataPoint,
  LoginPayload,
} from '@smartdine/shared/types';

const BASE_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

const API_BASE = `${BASE_URL}/api/v1`;

// ---------------------------------------------------------------------------
// Core fetcher
// ---------------------------------------------------------------------------

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
}

async function fetcher<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  return res.json() as Promise<ApiResponse<T>>;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const authApi = {
  login: (data: LoginPayload) =>
    fetcher<AuthResponse>('/auth/login', { method: 'POST', body: data }),

  getMe: (token: string) =>
    fetcher<User>('/auth/me', { token }),

  logout: (token: string, refreshToken: string) =>
    fetcher<null>('/auth/logout', { method: 'POST', body: { refreshToken }, token }),
};

// ---------------------------------------------------------------------------
// Menu [staff: patch availability]
// ---------------------------------------------------------------------------

export const menuApi = {
  getAll: (token: string) => fetcher<MenuItem[]>('/menu', { token }),

  setAvailability: (token: string, id: string, available: boolean) =>
    fetcher<MenuItem>(`/menu/${id}/availability`, {
      method: 'PATCH',
      body: { available },
      token,
    }),
};

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const tablesApi = {
  getAll: (token: string) => fetcher<Table[]>('/tables', { token }),
};

// ---------------------------------------------------------------------------
// Reservations [staff: see all, update status]
// ---------------------------------------------------------------------------

export const reservationsApi = {
  getAll: (token: string) => fetcher<Reservation[]>('/reservations', { token }),

  updateStatus: (token: string, id: string, status: string) =>
    fetcher<Reservation>(`/reservations/${id}`, { method: 'PATCH', body: { status }, token }),
};

// ---------------------------------------------------------------------------
// Orders [staff: see all, update status]
// ---------------------------------------------------------------------------

export const ordersApi = {
  getAll: (token: string) => fetcher<Order[]>('/orders', { token }),

  updateStatus: (token: string, id: string, status: string) =>
    fetcher<Order>(`/orders/${id}/status`, { method: 'PATCH', body: { status }, token }),
};

// ---------------------------------------------------------------------------
// Inventory [staff only]
// ---------------------------------------------------------------------------

export const inventoryApi = {
  getAll: (token: string) => fetcher<InventoryItem[]>('/inventory', { token }),

  updateQuantity: (token: string, id: string, quantity: number) =>
    fetcher<InventoryItem>(`/inventory/${id}`, { method: 'PATCH', body: { quantity }, token }),
};

// ---------------------------------------------------------------------------
// Staff [admin only]
// ---------------------------------------------------------------------------

export const staffApi = {
  getAll: (token: string) => fetcher<Staff[]>('/staff', { token }),

  create: (token: string, data: { userId: string; role: string; shift: string }) =>
    fetcher<Staff>('/staff', { method: 'POST', body: data, token }),
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notificationsApi = {
  getOwn: (token: string) => fetcher<Notification[]>('/notifications', { token }),

  markRead: (token: string, id: string) =>
    fetcher<null>(`/notifications/${id}/read`, { method: 'PATCH', token }),
};

// ---------------------------------------------------------------------------
// AI [staff only]
// ---------------------------------------------------------------------------

export const aiApi = {
  getForecast: (token: string) =>
    fetcher<ForecastItem[]>('/ai/forecast', { token }),

  getInsights: (token: string) =>
    fetcher<InsightsResponse>('/ai/insights', { token }),
};

// ---------------------------------------------------------------------------
// Analytics [staff only]
// ---------------------------------------------------------------------------

export const analyticsApi = {
  getSales: (token: string) =>
    fetcher<SalesDataPoint[]>('/analytics/sales', { token }),
};

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export const healthApi = {
  check: () => fetcher<{ status: string }>('/health'),
};

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const api = {
  auth: authApi,
  menu: menuApi,
  tables: tablesApi,
  reservations: reservationsApi,
  orders: ordersApi,
  inventory: inventoryApi,
  staff: staffApi,
  notifications: notificationsApi,
  ai: aiApi,
  analytics: analyticsApi,
  health: healthApi,
};
