import { MockApiService } from './mockApi';
import { User, MenuItem, Table, Reservation, Order, Notification, ApiResponse, AuthResponse } from './types';

const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

// Token Storage Helpers
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smartdine_auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('smartdine_auth_token', token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('smartdine_auth_token');
}

// Unified fetch wrapper with Authorization Bearer header & v1 endpoint handling
async function realFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    // Ensure endpoint has /v1/ prefix if relative
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('/v1/') || API_BASE_URL.endsWith('/v1') ? `${API_BASE_URL}${path.replace(/^\/v1/, '')}` : `${API_BASE_URL}${path}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network connection error',
    };
  }
}

export const api = {
  // Token utility exports
  getAuthToken,
  setAuthToken,
  removeAuthToken,

  // Auth
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    if (USE_REAL_API) return realFetch<User>('/auth/me');
    return MockApiService.getCurrentUser();
  },

  login: async (email: string, password?: string): Promise<ApiResponse<User>> => {
    if (USE_REAL_API) {
      const res = await realFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
        return { success: true, data: res.data.user };
      }
      return { success: false, error: res.error || 'Authentication failed' };
    }
    return MockApiService.login(email, password);
  },

  signup: async (email: string, password?: string, name?: string): Promise<ApiResponse<{ requiresOtp: boolean; email: string }>> => {
    if (USE_REAL_API) {
      return realFetch<{ requiresOtp: boolean; email: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
    }
    return MockApiService.signup(email, password, name);
  },

  verifyOtp: async (email: string, otp: string): Promise<ApiResponse<User>> => {
    if (USE_REAL_API) {
      const res = await realFetch<AuthResponse>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
        return { success: true, data: res.data.user };
      }
      return { success: false, error: res.error || 'OTP verification failed' };
    }
    return MockApiService.verifyOtp(email, otp);
  },

  logout: async (): Promise<void> => {
    removeAuthToken();
  },

  // Menu
  getMenu: async (): Promise<ApiResponse<MenuItem[]>> => {
    if (USE_REAL_API) return realFetch<MenuItem[]>('/menu');
    return MockApiService.getMenu();
  },

  // Tables
  getTables: async (): Promise<ApiResponse<Table[]>> => {
    if (USE_REAL_API) return realFetch<Table[]>('/tables');
    return MockApiService.getTables();
  },

  // Reservations
  getReservations: async (): Promise<ApiResponse<Reservation[]>> => {
    if (USE_REAL_API) return realFetch<Reservation[]>('/reservations');
    return MockApiService.getReservations();
  },

  createReservation: async (payload: { tableId: string; time: string; partySize: number; specialRequests?: string }): Promise<ApiResponse<Reservation>> => {
    if (USE_REAL_API) return realFetch<Reservation>('/reservations', { method: 'POST', body: JSON.stringify(payload) });
    return MockApiService.createReservation(payload);
  },

  cancelReservation: async (id: string): Promise<ApiResponse<Reservation>> => {
    if (USE_REAL_API) return realFetch<Reservation>(`/reservations/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) });
    return MockApiService.cancelReservation(id);
  },

  // Orders
  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    if (USE_REAL_API) return realFetch<Order[]>('/orders');
    return MockApiService.getOrders();
  },

  createOrder: async (payload: { tableId?: string; items: { menuItemId: string; quantity: number }[] }): Promise<ApiResponse<Order>> => {
    if (USE_REAL_API) return realFetch<Order>('/orders', { method: 'POST', body: JSON.stringify(payload) });
    return MockApiService.createOrder(payload);
  },

  // Notifications
  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    if (USE_REAL_API) return realFetch<Notification[]>('/notifications');
    return MockApiService.getNotifications();
  },

  markNotificationRead: async (id: string): Promise<ApiResponse<boolean>> => {
    if (USE_REAL_API) return realFetch<boolean>(`/notifications/${id}/read`, { method: 'PATCH' });
    return MockApiService.markNotificationRead(id);
  },

  // AI Assistant & Recommendations
  getAiRecommendations: async (): Promise<ApiResponse<MenuItem[]>> => {
    if (USE_REAL_API) return realFetch<MenuItem[]>('/ai/recommendations');
    return MockApiService.getAiRecommendations();
  },

  postAiAssistant: async (message: string): Promise<ApiResponse<{ reply: string; suggestedDishes?: MenuItem[] }>> => {
    if (USE_REAL_API) return realFetch<{ reply: string; suggestedDishes?: MenuItem[] }>('/ai/assistant', { method: 'POST', body: JSON.stringify({ message }) });
    return MockApiService.postAiAssistant(message);
  }
};
