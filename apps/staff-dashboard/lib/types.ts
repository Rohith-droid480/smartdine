// User & Authentication Types
export type UserRole = 'ADMIN' | 'MANAGER' | 'CHEF' | 'WAITER' | 'HOST';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Menu Types
export type MenuCategory = 'APPETIZERS' | 'MAINS' | 'DESSERTS' | 'BEVERAGES' | 'SPECIALS';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  imageUrl?: string;
}

// Order Types
export type OrderStatus =
  | 'placed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'billed'
  | 'PENDING'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'CANCELLED';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber?: number;
  customerName?: string;
  status: OrderStatus;
  type: OrderType;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Reservation & Table Types
export type ReservationStatus = 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED';

export interface Reservation {
  id: string;
  tableNumber: number;
  guestName: string;
  guestCount: number;
  reservationTime: string;
  status: ReservationStatus;
  contactPhone: string;
  specialNotes?: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  currentOrderId?: string;
}

// Inventory Types
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  status: StockStatus;
  supplier: string;
  lastRestockedAt: string;
}

// Staff Types
export type StaffRole = 'MANAGER' | 'CHEF' | 'WAITER' | 'HOST' | 'BARTENDER' | 'CLEANER';
export type ShiftStatus = 'ON_DUTY' | 'OFF_DUTY' | 'ON_BREAK';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  shiftStatus: ShiftStatus;
  hourlyRate: number;
  joinedDate: string;
}

// Analytics Types
export interface SalesDataPoint {
  date: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface CategorySalesData {
  category: MenuCategory;
  revenue: number;
  percentage: number;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByDate: SalesDataPoint[];
  salesByCategory: CategorySalesData[];
}

// AI Forecast & Insights Types
export interface DemandForecastPoint {
  timestamp: string;
  predictedOrderVolume: number;
  confidenceScore: number;
}

export interface AIForecast {
  forecastPeriod: string;
  predictedTotalRevenue: number;
  peakHours: string[];
  hourlyDemand: DemandForecastPoint[];
}

export type InsightImpact = 'HIGH' | 'MEDIUM' | 'LOW';
export type InsightCategory = 'INVENTORY' | 'STAFFING' | 'MENU_OPTIMIZATION' | 'REVENUE';

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  impact: InsightImpact;
  actionableRecommendation: string;
  createdAt: string;
}
