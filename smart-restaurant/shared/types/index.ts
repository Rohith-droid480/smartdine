export type UserRole = 'customer' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface MenuItem {
  id: string;
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
  number: number;
  capacity: number;
  status: 'free' | 'reserved' | 'occupied';
  location?: 'main_dining' | 'patio' | 'rooftop' | 'vip_lounge';
}

export interface Reservation {
  id: string;
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
  userId: string;
  tableId?: string;
  items: OrderItem[];
  status: 'placed' | 'preparing' | 'ready' | 'served' | 'billed';
  total: number;
  createdAt: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
