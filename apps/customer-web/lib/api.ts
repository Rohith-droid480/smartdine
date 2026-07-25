// =============================================================================
// apps/customer-web/lib/api.ts
// Typed API client for the SmartDine backend.
// All fetch calls go through this module — never call fetch() directly in pages.
//
// Usage:
//   import { api } from '@/lib/api';
//   const user = await api.auth.getMe();
// =============================================================================

import type {
  ApiResponse,
  AuthResponse,
  User,
  MenuItem,
  Reservation,
  Order,
  Notification,
  AssistantResponse,
  SignupPayload,
  LoginPayload,
  VerifyOtpPayload,
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

  create: (token: string, data: { tableId: string; time: string; partySize: number }) =>
    fetcher<Reservation>('/reservations', { method: 'POST', body: data, token }),
};

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const ordersApi = {
  getOwn: (token: string) =>
    fetcher<Order[]>('/orders', { token }),

  create: (
    token: string,
    data: { tableId?: string; items: { menuItemId: string; quantity: number }[] },
  ) => fetcher<Order>('/orders', { method: 'POST', body: data, token }),
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notificationsApi = {
  getOwn: (token: string) =>
    fetcher<Notification[]>('/notifications', { token }),

  markRead: (token: string, id: string) =>
    fetcher<null>(`/notifications/${id}/read`, { method: 'PATCH', token }),
};

// ---------------------------------------------------------------------------
// AI
// ---------------------------------------------------------------------------

export const aiApi = {
  getRecommendations: (token: string) =>
    fetcher<MenuItem[]>('/ai/recommendations', { token }),

  sendMessage: (token: string, message: string) =>
    fetcher<AssistantResponse>('/ai/assistant', { method: 'POST', body: { message }, token }),
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
  notifications: notificationsApi,
  ai: aiApi,
  health: healthApi,
};
