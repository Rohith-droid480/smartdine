// =============================================================================
// apps/customer-web/lib/api.ts
// Typed API client for the SmartDine backend.
// All fetch calls go through this module — never call fetch() directly in pages.
// =============================================================================

import type {
  ApiResponse,
  AuthResponse,
  User,
  MenuItem,
  Table,
  Reservation,
  Order,
  Notification,
  AssistantResponse,
  RecommendationResponse,
  AssistantResponseData,
  SignupPayload,
  LoginPayload,
  VerifyOtpPayload,
} from '@smartdine/shared/types';

// Safely format base URL regardless of whether trailing /api/v1 was included in env
const rawBase = (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000').trim().replace(/\/+$/, '');
const API_BASE = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;

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

  const reqInit: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  };

  if (body !== undefined) {
    reqInit.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, reqInit);

  return res.json() as Promise<ApiResponse<T>>;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const authApi = {
  signup: (data: SignupPayload) =>
    fetcher<{ message: string; userId: string }>('/auth/signup', { method: 'POST', body: data }),

  verifyOtp: (data: VerifyOtpPayload) =>
    fetcher<AuthResponse>('/auth/verify-otp', { method: 'POST', body: data }),

  login: (data: LoginPayload) =>
    fetcher<AuthResponse>('/auth/login', { method: 'POST', body: data }),

  getMe: (token: string) =>
    fetcher<User>('/auth/me', { token }),

  logout: (refreshToken: string) =>
    fetcher<null>('/auth/logout', { method: 'POST', body: { refreshToken } }),
};

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

export const menuApi = {
  getAll: () => fetcher<MenuItem[]>('/menu'),
};

// ---------------------------------------------------------------------------
// Reservations
// ---------------------------------------------------------------------------

export const reservationsApi = {
  getOwn: (token: string) =>
    fetcher<Reservation[]>('/reservations', { token }),

  getTables: (token: string) =>
    fetcher<Table[]>('/reservations/tables', { token }),

  create: (token: string, data: { tableId: string; time: string; partySize: number }) =>
    fetcher<Reservation>('/reservations', { method: 'POST', body: data, token }),

  cancel: (token: string, id: string) =>
    fetcher<Reservation>(`/reservations/${id}/cancel`, { method: 'POST', token }),
};

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const ordersApi = {
  getOwn: (token: string) =>
    fetcher<Order[]>('/orders', { token }),

  getById: (token: string, id: string) =>
    fetcher<Order>(`/orders/${id}`, { token }),

  create: (
    token: string,
    data: { tableId?: string; items: { menuItemId: string; quantity: number }[] },
  ) => fetcher<Order>('/orders', { method: 'POST', body: data, token }),
};

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export const billingApi = {
  getReceipt: (token: string, orderId: string) =>
    fetcher<Record<string, unknown>>(`/billing/receipt/${orderId}`, { token }),
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notificationsApi = {
  getOwn: (token: string) =>
    fetcher<Notification[]>('/notifications', { token }),

  markRead: (token: string, id: string) =>
    fetcher<null>(`/notifications/${id}/read`, { method: 'PATCH', token }),

  markAllRead: (token: string) =>
    fetcher<null>('/notifications/read-all', { method: 'PATCH', token }),
};

// ---------------------------------------------------------------------------
// AI
// ---------------------------------------------------------------------------

export const aiApi = {
  getRecommendations: (token?: string) =>
    fetcher<RecommendationResponse & MenuItem[]>('/ai/recommendations', { ...(token && { token }) }),

  sendMessage: (message: string, token?: string) =>
    fetcher<AssistantResponse & AssistantResponseData>('/ai/assistant', { method: 'POST', body: { message }, ...(token && { token }) }),
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
  reservations: reservationsApi,
  orders: ordersApi,
  billing: billingApi,
  notifications: notificationsApi,
  ai: aiApi,
  health: healthApi,
};
