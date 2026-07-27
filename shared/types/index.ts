// =============================================================================
// SmartDine — Shared API Contract
// SOURCE OF TRUTH — identical across Alpha/Beta/Gamma (see ALPHA_TRD.md § 3)
// DO NOT modify unilaterally. Any change must be coordinated with all builders.
// =============================================================================

// ---------------------------------------------------------------------------
// Primitive aliases
// ---------------------------------------------------------------------------

/** ISO 8601 datetime string */
export type ISODateString = string;

/** UUID v4 string */
export type UUID = string;

// ---------------------------------------------------------------------------
// Domain enums / union types
// ---------------------------------------------------------------------------

export type UserRole = 'customer' | 'staff' | 'admin';

export type TableStatus = 'free' | 'reserved' | 'occupied';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'served' | 'billed';

export type NotificationChannel = 'in-app' | 'email';

export type StaffRole = 'waiter' | 'chef' | 'manager' | 'cashier';

// ---------------------------------------------------------------------------
// Core domain entities
// ---------------------------------------------------------------------------

export interface User {
  id: UUID;
  email: string;
  name: string;
  role: UserRole;
  createdAt: ISODateString;
}

export interface MenuItem {
  id: UUID;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
}

export interface Table {
  id: UUID;
  number: number;
  capacity: number;
  status: TableStatus;
}

export interface Reservation {
  id: UUID;
  userId: UUID;
  tableId: UUID;
  time: ISODateString;
  partySize: number;
  status: ReservationStatus;
}

export interface OrderItem {
  menuItemId: UUID;
  quantity: number;
  priceAtOrder: number;
}

export interface Order {
  id: UUID;
  userId: UUID;
  tableId?: UUID;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: ISODateString;
}

export interface InventoryItem {
  id: UUID;
  name: string;
  quantity: number;
  unit: string;
  reorderThreshold: number;
}

export interface Staff {
  id: UUID;
  userId: UUID;
  role: string;
  shift: string;
}

export interface Notification {
  id: UUID;
  userId: UUID;
  message: string;
  read: boolean;
  channel: NotificationChannel;
  createdAt: ISODateString;
}

// ---------------------------------------------------------------------------
// API response envelope
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Auth payloads
// ---------------------------------------------------------------------------

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ---------------------------------------------------------------------------
// AI payloads
// ---------------------------------------------------------------------------

export interface AssistantPayload {
  message: string;
}

export interface AssistantResponse {
  reply: string;
}

export interface ForecastItem {
  menuItemId: UUID;
  menuItemName: string;
  predictedDemand: number;
  currentStock: number;
  unit: string;
  stockSufficient: boolean;
}

export interface InsightsResponse {
  summary: string;
  generatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Verified AI Payload Interfaces (Matching Frozen Backend API)
// ---------------------------------------------------------------------------

export interface RecommendationItem {
  menuItemId: string;
  name: string;
  price: number;
  reason: string;
  confidence: number;
  available: boolean;
}

export interface RecommendationResponse {
  mealPeriod: 'Breakfast' | 'Lunch' | 'Evening' | 'Dinner';
  recommendations: RecommendationItem[];
}

export interface OperationalInsight {
  id: string;
  title: string;
  description: string;
  category: 'INVENTORY' | 'STAFFING' | 'MENU_OPTIMIZATION' | 'REVENUE';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actionableRecommendation: string;
  createdAt: ISODateString;
}

export interface DemandForecastResponse {
  forecastDate: ISODateString;
  expectedCustomers: number;
  expectedOrders: number;
  expectedRevenue: number;
  peakPeriod: string;
  inventoryPressure: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  recommendations: string[];
}

export interface SupportedAssistantData {
  supported: true;
  intent: string;
  answer: string;
  confidence: number;
  sources: string[];
}

export interface RefusalAssistantData {
  supported: false;
  message: string;
  supportedTopics: string[];
}

export type AssistantResponseData = SupportedAssistantData | RefusalAssistantData;

// ---------------------------------------------------------------------------
// Analytics payloads
// ---------------------------------------------------------------------------

export interface SalesDataPoint {
  date: ISODateString;
  total: number;
  orderCount: number;
}
