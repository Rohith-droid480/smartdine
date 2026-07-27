import {
  User,
  MenuItem,
  Order,
  Reservation,
  InventoryItem,
  StaffMember,
  SalesAnalytics,
  AIForecast,
  AIInsight,
  OrderStatus,
} from './types';

// Mock Current Logged In User
export const MOCK_CURRENT_USER: User = {
  id: 'usr_mgr_01',
  email: 'alex.rivera@smartdine.com',
  name: 'Alex Rivera',
  role: 'MANAGER',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
};

// Mock Menu Items
export const MOCK_MENU: MenuItem[] = [
  {
    id: 'menu_01',
    name: 'Truffle Wagyu Burger',
    description: 'A5 Wagyu beef patty, black truffle aioli, aged Gruyère, brioche bun.',
    price: 34.50,
    category: 'MAINS',
    isAvailable: true,
    preparationTimeMinutes: 18,
  },
  {
    id: 'menu_02',
    name: 'Pan-Seared Chilean Sea Bass',
    description: 'Served with saffron risotto, asparagus spears, lemon butter reduction.',
    price: 42.00,
    category: 'MAINS',
    isAvailable: true,
    preparationTimeMinutes: 22,
  },
  {
    id: 'menu_03',
    name: 'Artisanal Burrata & Heirloom Tomatoes',
    description: 'Pugliese burrata, aged balsamic drizzle, basil oil, toasted sourdough.',
    price: 19.00,
    category: 'APPETIZERS',
    isAvailable: true,
    preparationTimeMinutes: 10,
  },
  {
    id: 'menu_04',
    name: 'Charred Octopus Carpaccio',
    description: 'Spanish octopus, smoked paprika, caper berries, micro arugula.',
    price: 24.00,
    category: 'APPETIZERS',
    isAvailable: false,
    preparationTimeMinutes: 12,
  },
  {
    id: 'menu_05',
    name: 'Valrhona Chocolate Fondant',
    description: 'Molten chocolate cake, Madagascar vanilla bean gelato, raspberry coulis.',
    price: 15.50,
    category: 'DESSERTS',
    isAvailable: true,
    preparationTimeMinutes: 15,
  },
  {
    id: 'menu_06',
    name: 'Smoked Old Fashioned',
    description: 'WhistlePig Rye, Angostura bitters, maple drizzle, cherrywood smoke infusion.',
    price: 18.00,
    category: 'BEVERAGES',
    isAvailable: true,
    preparationTimeMinutes: 5,
  },
  {
    id: 'menu_07',
    name: 'Chef’s Dry-Aged Tomahawk (40oz)',
    description: 'USDA Prime 45-day dry aged ribeye with bone marrow butter.',
    price: 145.00,
    category: 'SPECIALS',
    isAvailable: true,
    preparationTimeMinutes: 35,
  },
];

// Mock Orders
export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord_101',
    tableNumber: 4,
    customerName: 'Marcus Vance',
    status: 'PREPARING',
    type: 'DINE_IN',
    items: [
      { id: 'item_1', menuItemId: 'menu_01', name: 'Truffle Wagyu Burger', quantity: 2, unitPrice: 34.50, notes: 'Medium rare' },
      { id: 'item_2', menuItemId: 'menu_06', name: 'Smoked Old Fashioned', quantity: 2, unitPrice: 18.00 },
    ],
    totalAmount: 105.00,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'ord_102',
    tableNumber: 12,
    customerName: 'Elena Rostova',
    status: 'PENDING',
    type: 'DINE_IN',
    items: [
      { id: 'item_3', menuItemId: 'menu_02', name: 'Pan-Seared Chilean Sea Bass', quantity: 1, unitPrice: 42.00 },
      { id: 'item_4', menuItemId: 'menu_03', name: 'Artisanal Burrata & Heirloom Tomatoes', quantity: 1, unitPrice: 19.00 },
    ],
    totalAmount: 61.00,
    createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60000).toISOString(),
  },
  {
    id: 'ord_103',
    tableNumber: 8,
    customerName: 'David K.',
    status: 'READY',
    type: 'DINE_IN',
    items: [
      { id: 'item_5', menuItemId: 'menu_07', name: 'Chef’s Dry-Aged Tomahawk (40oz)', quantity: 1, unitPrice: 145.00 },
      { id: 'item_6', menuItemId: 'menu_05', name: 'Valrhona Chocolate Fondant', quantity: 2, unitPrice: 15.50 },
    ],
    totalAmount: 176.00,
    createdAt: new Date(Date.now() - 32 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'ord_104',
    customerName: 'Sarah Jenkins',
    status: 'SERVED',
    type: 'TAKEAWAY',
    items: [
      { id: 'item_7', menuItemId: 'menu_01', name: 'Truffle Wagyu Burger', quantity: 1, unitPrice: 34.50 },
    ],
    totalAmount: 34.50,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'ord_105',
    tableNumber: 2,
    customerName: 'Jonathan Birch',
    status: 'CANCELLED',
    type: 'DINE_IN',
    items: [
      { id: 'item_8', menuItemId: 'menu_04', name: 'Charred Octopus Carpaccio', quantity: 1, unitPrice: 24.00 },
    ],
    totalAmount: 24.00,
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 50 * 60000).toISOString(),
  },
];

// Mock Reservations
export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res_01',
    tableNumber: 4,
    guestName: 'Marcus Vance',
    guestCount: 2,
    reservationTime: '19:30',
    status: 'SEATED',
    contactPhone: '+1 (555) 234-8901',
    specialNotes: 'Anniversary celebration',
  },
  {
    id: 'res_02',
    tableNumber: 7,
    guestName: 'Dr. Evelyn Sterling',
    guestCount: 4,
    reservationTime: '20:00',
    status: 'CONFIRMED',
    contactPhone: '+1 (555) 890-1234',
    specialNotes: 'Quiet corner table requested',
  },
  {
    id: 'res_03',
    tableNumber: 12,
    guestName: 'Elena Rostova',
    guestCount: 3,
    reservationTime: '19:15',
    status: 'SEATED',
    contactPhone: '+1 (555) 456-7890',
  },
  {
    id: 'res_04',
    tableNumber: 1,
    guestName: 'Liam Hemsworth',
    guestCount: 6,
    reservationTime: '21:00',
    status: 'CONFIRMED',
    contactPhone: '+1 (555) 789-0123',
    specialNotes: 'VIP Service - Sommelier assistance',
  },
];

// Mock Inventory
export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'inv_01',
    name: 'A5 Wagyu Beef Striploin',
    quantity: 14.5,
    unit: 'kg',
    minThreshold: 10,
    status: 'IN_STOCK',
    supplier: 'Tokyo Premium Meats',
    lastRestockedAt: '2026-07-24T08:00:00Z',
  },
  {
    id: 'inv_02',
    name: 'Fresh Black Truffles',
    quantity: 0.35,
    unit: 'kg',
    minThreshold: 0.5,
    status: 'LOW_STOCK',
    supplier: 'Piedmont Fine Produce',
    lastRestockedAt: '2026-07-20T10:30:00Z',
  },
  {
    id: 'inv_03',
    name: 'Chilean Sea Bass Fillets',
    quantity: 8.0,
    unit: 'kg',
    minThreshold: 12,
    status: 'LOW_STOCK',
    supplier: 'Pacific Catch Co.',
    lastRestockedAt: '2026-07-22T06:15:00Z',
  },
  {
    id: 'inv_04',
    name: 'Spanish Octopus Whole',
    quantity: 0.0,
    unit: 'kg',
    minThreshold: 5,
    status: 'OUT_OF_STOCK',
    supplier: 'Iberian Seafoods Ltd.',
    lastRestockedAt: '2026-07-15T14:00:00Z',
  },
  {
    id: 'inv_05',
    name: 'Pugliese Burrata',
    quantity: 24,
    unit: 'units',
    minThreshold: 15,
    status: 'IN_STOCK',
    supplier: 'Calabria Artisanal Dairy',
    lastRestockedAt: '2026-07-25T07:00:00Z',
  },
];

// Mock Staff Members
export const MOCK_STAFF: StaffMember[] = [
  {
    id: 'stf_01',
    name: 'Antoine Dubois',
    email: 'antoine.d@smartdine.com',
    phone: '+1 (555) 111-2233',
    role: 'CHEF',
    shiftStatus: 'ON_DUTY',
    hourlyRate: 38.50,
    joinedDate: '2023-03-15',
  },
  {
    id: 'stf_02',
    name: 'Sophia Martinez',
    email: 'sophia.m@smartdine.com',
    phone: '+1 (555) 222-3344',
    role: 'WAITER',
    shiftStatus: 'ON_DUTY',
    hourlyRate: 22.00,
    joinedDate: '2024-01-10',
  },
  {
    id: 'stf_03',
    name: 'Lucas Chen',
    email: 'lucas.c@smartdine.com',
    phone: '+1 (555) 333-4455',
    role: 'BARTENDER',
    shiftStatus: 'ON_BREAK',
    hourlyRate: 26.50,
    joinedDate: '2023-09-01',
  },
  {
    id: 'stf_04',
    name: 'Clara Oswald',
    email: 'clara.o@smartdine.com',
    phone: '+1 (555) 444-5566',
    role: 'HOST',
    shiftStatus: 'ON_DUTY',
    hourlyRate: 20.00,
    joinedDate: '2024-05-20',
  },
  {
    id: 'stf_05',
    name: 'Viktor Reznov',
    email: 'viktor.r@smartdine.com',
    phone: '+1 (555) 555-6677',
    role: 'MANAGER',
    shiftStatus: 'OFF_DUTY',
    hourlyRate: 45.00,
    joinedDate: '2022-11-01',
  },
];

// Mock Sales Analytics
export const MOCK_SALES_ANALYTICS: SalesAnalytics = {
  totalRevenue: 124850.00,
  totalOrders: 2840,
  averageOrderValue: 43.96,
  salesByDate: [
    { date: 'Jul 20', revenue: 3420.00, orderCount: 78, averageOrderValue: 43.84 },
    { date: 'Jul 21', revenue: 3890.00, orderCount: 85, averageOrderValue: 45.76 },
    { date: 'Jul 22', revenue: 4120.00, orderCount: 92, averageOrderValue: 44.78 },
    { date: 'Jul 23', revenue: 4850.00, orderCount: 104, averageOrderValue: 46.63 },
    { date: 'Jul 24', revenue: 5600.00, orderCount: 120, averageOrderValue: 46.66 },
    { date: 'Jul 25', revenue: 6420.00, orderCount: 138, averageOrderValue: 46.52 },
    { date: 'Jul 26', revenue: 5180.00, orderCount: 110, averageOrderValue: 47.09 },
  ],
  salesByCategory: [
    { category: 'MAINS', revenue: 62425.00, percentage: 50 },
    { category: 'APPETIZERS', revenue: 24970.00, percentage: 20 },
    { category: 'BEVERAGES', revenue: 18727.50, percentage: 15 },
    { category: 'SPECIALS', revenue: 12485.00, percentage: 10 },
    { category: 'DESSERTS', revenue: 6242.50, percentage: 5 },
  ],
};

// Mock AI Forecast
export const MOCK_AI_FORECAST: AIForecast = {
  forecastPeriod: 'Next 24 Hours',
  predictedTotalRevenue: 7850.00,
  peakHours: ['19:00 - 21:30', '12:30 - 14:00'],
  hourlyDemand: [
    { timestamp: '17:00', predictedOrderVolume: 12, confidenceScore: 0.94 },
    { timestamp: '18:00', predictedOrderVolume: 28, confidenceScore: 0.96 },
    { timestamp: '19:00', predictedOrderVolume: 54, confidenceScore: 0.98 },
    { timestamp: '20:00', predictedOrderVolume: 62, confidenceScore: 0.97 },
    { timestamp: '21:00', predictedOrderVolume: 45, confidenceScore: 0.92 },
    { timestamp: '22:00', predictedOrderVolume: 20, confidenceScore: 0.89 },
  ],
};

// Mock AI Insights
export const MOCK_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'ins_01',
    title: 'Critical Inventory Deficit Alert',
    description: 'Black Truffles & Sea Bass stock levels are predicted to run out before tonight’s peak dinner shift at 20:00.',
    category: 'INVENTORY',
    impact: 'HIGH',
    actionableRecommendation: 'Trigger emergency re-order from Piedmont Fine Produce or mark Chilean Sea Bass as unavailable.',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    id: 'ins_02',
    title: 'Surge Demand Staffing Recommendation',
    description: 'Reservations indicate a 35% higher guest volume than typical Sundays between 19:00 and 21:30.',
    category: 'STAFFING',
    impact: 'HIGH',
    actionableRecommendation: 'Call in 1 additional floor waiter and 1 sous-chef to prevent kitchen bottlenecks.',
    createdAt: new Date(Date.now() - 55 * 60000).toISOString(),
  },
  {
    id: 'ins_03',
    title: 'High-Margin Menu Pairing Opportunity',
    description: 'Guests ordering the Truffle Wagyu Burger have an 82% acceptance rate when recommended the Smoked Old Fashioned.',
    category: 'MENU_OPTIMIZATION',
    impact: 'MEDIUM',
    actionableRecommendation: 'Prompt floor staff to suggest Smoked Old Fashioned during order entry.',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];
