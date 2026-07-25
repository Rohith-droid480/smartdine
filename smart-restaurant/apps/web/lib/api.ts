import { MockApiService } from './mockApi';
import { User, MenuItem, Table, Reservation, Order, Notification, ApiResponse } from './types';

const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

// Helper for real fetch requests when backend goes live at H24 sync point
async function realFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export const api = {
  // Auth
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    if (USE_REAL_API) return realFetch<User>('/auth/me');
    return MockApiService.getCurrentUser();
  },

  login: async (email: string, password?: string): Promise<ApiResponse<User>> => {
    if (USE_REAL_API) return realFetch<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    return MockApiService.login(email, password);
  },

  signup: async (email: string, password?: string, name?: string): Promise<ApiResponse<{ requiresOtp: boolean; email: string }>> => {
    if (USE_REAL_API) return realFetch<{ requiresOtp: boolean; email: string }>('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) });
    return MockApiService.signup(email, password, name);
  },

  verifyOtp: async (email: string, otp: string): Promise<ApiResponse<User>> => {
    if (USE_REAL_API) return realFetch<User>('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) });
    return MockApiService.verifyOtp(email, otp);
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
