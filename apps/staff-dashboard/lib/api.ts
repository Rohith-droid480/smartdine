import {
  LoginCredentials,
  AuthResponse,
  User,
  MenuItem,
  Order,
  OrderStatus,
  Reservation,
  InventoryItem,
  StaffMember,
  SalesAnalytics,
  AIForecast,
  AIInsight,
} from './types';
import type {
  OperationalInsight,
  DemandForecastResponse,
  AssistantResponseData,
  RecommendationResponse,
  ApiResponse,
} from '@smartdine/shared/types';
import {
  MOCK_CURRENT_USER,
  MOCK_MENU,
  MOCK_ORDERS,
  MOCK_RESERVATIONS,
  MOCK_INVENTORY,
  MOCK_STAFF,
  MOCK_SALES_ANALYTICS,
  MOCK_AI_FORECAST,
  MOCK_AI_INSIGHTS,
} from './mockApi';

// Centralized API Base URL — aligned with SmartDine monorepo convention
const rawEnvUrl = (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000').trim().replace(/\/+$/, '');
const API_BASE_URL = rawEnvUrl.replace(/\/api\/v1$/, '');
const AUTH_TOKEN_KEY = 'smartdine_staff_token';

// Internal simulated delay helper for fallback
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generic HTTP Request Helper for Alpha Backend Integration
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * POST /api/auth/login
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  if (!credentials.email || !credentials.email.trim()) {
    throw new Error('Email address is required.');
  }
  if (!credentials.email.includes('@')) {
    throw new Error('Please enter a valid staff email address.');
  }
  if (!credentials.password || !credentials.password.trim()) {
    throw new Error('Password is required.');
  }

  try {
    return await request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  } catch {
    // Fallback mode for local development/demo
    await delay(300);
    if (credentials.email === 'alex.rivera@smartdine.com' || credentials.email.endsWith('@smartdine.com')) {
      return {
        token: 'mock_jwt_token_gamma_admin_123456789',
        user: MOCK_CURRENT_USER,
      };
    }
    throw new Error('Invalid staff credentials. Access restricted to authorized personnel.');
  }
}

/**
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<User> {
  try {
    return await request<User>('/api/v1/auth/me');
  } catch {
    await delay();
    return MOCK_CURRENT_USER;
  }
}

/**
 * GET /api/menu
 */
export async function getMenu(): Promise<MenuItem[]> {
  try {
    return await request<MenuItem[]>('/api/v1/menu');
  } catch {
    await delay();
    return [...MOCK_MENU];
  }
}

/**
 * PATCH /api/menu/:id/availability
 */
export async function updateMenuItemAvailability(id: string, isAvailable: boolean): Promise<MenuItem> {
  try {
    return await request<MenuItem>(`/api/v1/menu/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  } catch {
    await delay();
    const item = MOCK_MENU.find((m) => m.id === id);
    if (!item) {
      throw new Error(`Menu item with ID ${id} not found.`);
    }
    item.isAvailable = isAvailable;
    return { ...item };
  }
}

/**
 * GET /api/orders
 */
export async function getOrders(): Promise<Order[]> {
  try {
    return await request<Order[]>('/api/v1/orders');
  } catch {
    await delay();
    return [...MOCK_ORDERS];
  }
}

/**
 * PATCH /api/orders/:id/status
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  try {
    return await request<Order>(`/api/v1/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch {
    await delay();
    const order = MOCK_ORDERS.find((o) => o.id === id);
    if (!order) {
      throw new Error(`Order with ID ${id} not found.`);
    }
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return { ...order };
  }
}

/**
 * GET /api/reservations
 */
export async function getReservations(): Promise<Reservation[]> {
  try {
    return await request<Reservation[]>('/api/v1/reservations');
  } catch {
    await delay();
    return [...MOCK_RESERVATIONS];
  }
}

/**
 * PATCH /api/reservations/:id
 */
export async function updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation> {
  try {
    return await request<Reservation>(`/api/v1/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  } catch {
    await delay();
    const reservation = MOCK_RESERVATIONS.find((r) => r.id === id);
    if (!reservation) {
      throw new Error(`Reservation with ID ${id} not found.`);
    }
    Object.assign(reservation, updates);
    return { ...reservation };
  }
}

/**
 * GET /api/inventory
 */
export async function getInventory(): Promise<InventoryItem[]> {
  try {
    return await request<InventoryItem[]>('/api/v1/inventory');
  } catch {
    await delay();
    return [...MOCK_INVENTORY];
  }
}

/**
 * PATCH /api/inventory/:id
 */
export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
  try {
    return await request<InventoryItem>(`/api/v1/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  } catch {
    await delay();
    const item = MOCK_INVENTORY.find((i) => i.id === id);
    if (!item) {
      throw new Error(`Inventory item with ID ${id} not found.`);
    }
    Object.assign(item, updates);
    return { ...item };
  }
}

/**
 * GET /api/staff
 */
export async function getStaff(): Promise<StaffMember[]> {
  try {
    return await request<StaffMember[]>('/api/v1/staff');
  } catch {
    await delay();
    return [...MOCK_STAFF];
  }
}

/**
 * POST /api/staff
 */
export async function createStaffMember(data: Omit<StaffMember, 'id'>): Promise<StaffMember> {
  try {
    return await request<StaffMember>('/api/v1/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch {
    await delay();
    const newStaff: StaffMember = {
      ...data,
      id: `stf_${Date.now()}`,
    };
    MOCK_STAFF.push(newStaff);
    return { ...newStaff };
  }
}

/**
 * GET /api/analytics/sales
 */
export async function getSalesAnalytics(): Promise<SalesAnalytics> {
  try {
    return await request<SalesAnalytics>('/api/v1/analytics/sales');
  } catch {
    await delay();
    return { ...MOCK_SALES_ANALYTICS };
  }
}

/**
 * GET /api/v1/ai/forecast
 */
export async function getAIForecast(): Promise<AIForecast | DemandForecastResponse> {
  try {
    const res = await request<ApiResponse<DemandForecastResponse>>('/api/v1/ai/forecast');
    if (res.success && res.data) {
      return res.data;
    }
    return res as unknown as DemandForecastResponse;
  } catch {
    await delay();
    return { ...MOCK_AI_FORECAST };
  }
}

/**
 * GET /api/v1/ai/insights
 */
export async function getAIInsights(): Promise<AIInsight[] | OperationalInsight[]> {
  try {
    const res = await request<ApiResponse<OperationalInsight[]>>('/api/v1/ai/insights');
    if (res.success && res.data) {
      return res.data;
    }
    return res as unknown as OperationalInsight[];
  } catch {
    await delay();
    return [...MOCK_AI_INSIGHTS];
  }
}

/**
 * POST /api/v1/ai/assistant
 */
export async function askAssistant(message: string): Promise<AssistantResponseData> {
  try {
    const res = await request<ApiResponse<AssistantResponseData>>('/api/v1/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    if (res.success && res.data) {
      return res.data;
    }
    return {
      supported: true,
      intent: 'general',
      answer: '[SmartDine Copilot] Operational context ready.',
      confidence: 85,
      sources: ['system'],
    };
  } catch {
    return {
      supported: false,
      message: 'Network error connecting to SmartDine Copilot.',
      supportedTopics: ['Sales', 'Kitchen', 'Inventory', 'Reservations'],
    };
  }
}

/**
 * GET /api/v1/ai/recommendations
 */
export async function getRecommendations(): Promise<RecommendationResponse | null> {
  try {
    const res = await request<ApiResponse<RecommendationResponse>>('/api/v1/ai/recommendations');
    return res.data ?? null;
  } catch {
    return null;
  }
}
