export type UserRole = 'customer' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  isEmailVerified?: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  name: string;
  phone?: string;
}

export interface MenuItem {
  id: string;
  restaurantId?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
  dietary?: ('vegetarian' | 'vegan' | 'gluten-free' | 'chef-special')[];
  prepTimeMinutes?: number;
  calories?: number;
  rating?: number;
}

export interface Table {
  id: string;
  restaurantId?: string;
  number: number;
  capacity: number;
  status: 'free' | 'reserved' | 'occupied';
  location?: 'main_dining' | 'patio' | 'rooftop' | 'vip_lounge';
}

export interface Reservation {
  id: string;
  restaurantId?: string;
  userId: string;
  tableId: string;
  time: string; // ISO datetime
  partySize: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  tableName?: string;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  priceAtOrder: number;
  name?: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  restaurantId?: string;
  userId: string;
  tableId?: string;
  items: OrderItem[];
  status: 'placed' | 'preparing' | 'ready' | 'served' | 'billed';
  total: number;
  createdAt: string;
  updatedAt?: string;
  tableNumber?: number;
  estimatedDeliveryMinutes?: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  channel: 'in-app' | 'email';
  createdAt: string;
  type?: 'order_update' | 'reservation_update' | 'promo' | 'system';
}

export interface InventoryItem {
  id: string;
  restaurantId?: string;
  name: string;
  quantity: number;
  unit: string;
  reorderThreshold: number;
}

export interface Staff {
  id: string;
  userId: string;
  role: string;
  shift: string;
}

export interface ForecastItem {
  menuItemId: string;
  dishName: string;
  predictedDemand: number;
  currentStock: number;
  stockStatus: 'sufficient' | 'low' | 'critical';
}

export interface InsightsResponse {
  summary: string;
  updatedAt: string;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
