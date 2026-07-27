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

// Centralized API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
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
    return await request<AuthResponse>('/api/auth/login', {
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
    return await request<User>('/api/auth/me');
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
    return await request<MenuItem[]>('/api/menu');
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
    return await request<MenuItem>(`/api/menu/${id}/availability`, {
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
    return await request<Order[]>('/api/orders');
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
    return await request<Order>(`/api/orders/${id}/status`, {
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
    return await request<Reservation[]>('/api/reservations');
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
    return await request<Reservation>(`/api/reservations/${id}`, {
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
    return await request<InventoryItem[]>('/api/inventory');
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
    return await request<InventoryItem>(`/api/inventory/${id}`, {
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
    return await request<StaffMember[]>('/api/staff');
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
    return await request<StaffMember>('/api/staff', {
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
    return await request<SalesAnalytics>('/api/analytics/sales');
  } catch {
    await delay();
    return { ...MOCK_SALES_ANALYTICS };
  }
}

/**
 * GET /api/ai/forecast
 */
export async function getAIForecast(): Promise<AIForecast> {
  try {
    return await request<AIForecast>('/api/ai/forecast');
  } catch {
    await delay();
    return { ...MOCK_AI_FORECAST };
  }
}

/**
 * GET /api/ai/insights
 */
export async function getAIInsights(): Promise<AIInsight[]> {
  try {
    return await request<AIInsight[]>('/api/ai/insights');
  } catch {
    await delay();
    return [...MOCK_AI_INSIGHTS];
  }
}
