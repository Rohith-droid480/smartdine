import { User, MenuItem, Table, Reservation, Order, Notification, ApiResponse } from './types';

// Initial Mock Seed Data in Indian Rupees (INR)
export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Truffle & Wild Mushroom Arancini',
    description: 'Crispy risotto spheres stuffed with black truffle butter, forest mushrooms, and smoked provolone.',
    price: 450.00,
    category: 'Appetizers',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian', 'chef-special'],
    prepTimeMinutes: 15,
    calories: 420,
    rating: 4.9
  },
  {
    id: 'menu-2',
    name: 'Burrata Caprese & Basil Caviar',
    description: 'Fresh Pugliese burrata, heirloom cherry tomatoes, aged balsamic reduction, and house-made basil pearls.',
    price: 550.00,
    category: 'Appetizers',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6929424c?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian', 'gluten-free'],
    prepTimeMinutes: 12,
    calories: 380,
    rating: 4.8
  },
  {
    id: 'menu-3',
    name: 'Pan-Seared Chilean Sea Bass',
    description: 'Wild caught sea bass served over saffron pea risotto, charred baby asparagus, and lemon verbena emulsion.',
    price: 1350.00,
    category: 'Main Course',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    dietary: ['gluten-free', 'chef-special'],
    prepTimeMinutes: 25,
    calories: 620,
    rating: 4.95
  },
  {
    id: 'menu-4',
    name: 'Dry-Aged Wagyu Ribeye (10oz)',
    description: 'A5 Miyazaki Wagyu served with bone marrow jus, roasted garlic bulb, and truffle parmesan fries.',
    price: 1850.00,
    category: 'Main Course',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    dietary: ['gluten-free'],
    prepTimeMinutes: 30,
    calories: 850,
    rating: 5.0
  },
  {
    id: 'menu-5',
    name: 'Heritage Spiced Paneer Tikka',
    description: 'House-crafted cottage cheese marinated in Kashmiri chili, organic yoghurt, mint chutney, and laccha onion.',
    price: 420.00,
    category: 'Main Course',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian', 'gluten-free'],
    prepTimeMinutes: 20,
    calories: 510,
    rating: 4.85
  },
  {
    id: 'menu-6',
    name: 'Smoked Saffron Lobster Tagliatelle',
    description: 'Handcrafted egg pasta, poached Maine lobster, saffron cream, heirloom cherry tomatoes, and micro tarragon.',
    price: 1250.00,
    category: 'Chef Specials',
    available: false, // Kitchen sold out
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    dietary: ['chef-special'],
    prepTimeMinutes: 25,
    calories: 740,
    rating: 4.9
  },
  {
    id: 'menu-7',
    name: 'Deconstructed Chocolate Hazelnut Sphere',
    description: 'Valrhona 70% dark chocolate dome, praline crunch, warm caramel cascade, and Madagascar vanilla gelato.',
    price: 380.00,
    category: 'Desserts',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegetarian'],
    prepTimeMinutes: 10,
    calories: 490,
    rating: 4.95
  },
  {
    id: 'menu-8',
    name: 'Artisanal Smoked Old Fashioned',
    description: 'Small-batch bourbon, smoked cherrywood, Angostura bitters, orange peel, and crystal ice sphere.',
    price: 450.00,
    category: 'Beverages',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    dietary: ['vegan', 'gluten-free'],
    prepTimeMinutes: 5,
    calories: 180,
    rating: 4.9
  }
];

export const INITIAL_TABLES: Table[] = [
  { id: 'tbl-1', number: 1, capacity: 2, status: 'free', location: 'patio' },
  { id: 'tbl-2', number: 2, capacity: 2, status: 'reserved', location: 'main_dining' },
  { id: 'tbl-3', number: 3, capacity: 4, status: 'free', location: 'main_dining' },
  { id: 'tbl-4', number: 4, capacity: 4, status: 'occupied', location: 'rooftop' },
  { id: 'tbl-5', number: 5, capacity: 6, status: 'free', location: 'rooftop' },
  { id: 'tbl-6', number: 6, capacity: 8, status: 'free', location: 'vip_lounge' },
];

export const MOCK_USER: User = {
  id: 'usr-101',
  email: 'alex.gourmet@example.com',
  name: 'Alex Morgan',
  role: 'customer',
  createdAt: new Date().toISOString()
};

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-901',
    userId: 'usr-101',
    tableId: 'tbl-3',
    tableName: 'Table 3 (Main Dining)',
    time: new Date(Date.now() + 86400000).toISOString(),
    partySize: 4,
    status: 'confirmed',
    specialRequests: 'Anniversary celebration, quiet window seat requested.'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-301',
    userId: 'usr-101',
    tableId: 'tbl-4',
    tableNumber: 4,
    items: [
      { menuItemId: 'menu-1', quantity: 2, priceAtOrder: 450.00, name: 'Truffle & Wild Mushroom Arancini' },
      { menuItemId: 'menu-3', quantity: 1, priceAtOrder: 1350.00, name: 'Pan-Seared Chilean Sea Bass' },
      { menuItemId: 'menu-8', quantity: 2, priceAtOrder: 450.00, name: 'Artisanal Smoked Old Fashioned' }
    ],
    status: 'preparing',
    total: 3150.00,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    estimatedDeliveryMinutes: 12
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'usr-101',
    message: 'Your reservation for Table 3 has been confirmed for tomorrow at 7:30 PM.',
    read: false,
    channel: 'in-app',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    type: 'reservation_update'
  },
  {
    id: 'notif-2',
    userId: 'usr-101',
    message: 'Order #ord-301 is currently being prepared by Chef Marco.',
    read: false,
    channel: 'in-app',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    type: 'order_update'
  }
];

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

function getStoredData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStoredData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Ignore storage quota errors
  }
}

export class MockApiService {
  private static user: User | null = MOCK_USER;

  static async getCurrentUser(): Promise<ApiResponse<User>> {
    await delay(300);
    return { success: true, data: this.user || MOCK_USER };
  }

  static async login(email: string, password?: string): Promise<ApiResponse<User>> {
    await delay(500);
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    const user: User = {
      id: 'usr-' + Date.now().toString().slice(-4),
      email,
      name: email.split('@')[0].replace('.', ' '),
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    this.user = user;
    return { success: true, data: user };
  }

  static async signup(email: string, password?: string, name?: string): Promise<ApiResponse<{ requiresOtp: boolean; email: string }>> {
    await delay(500);
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Valid email is required.' };
    }
    return { success: true, data: { requiresOtp: true, email } };
  }

  static async verifyOtp(email: string, otp: string): Promise<ApiResponse<User>> {
    await delay(600);
    if (otp !== '123456' && otp.length !== 6) {
      return { success: false, error: 'Invalid OTP code. Try typing 123456 for demo.' };
    }
    const user: User = {
      id: 'usr-' + Date.now().toString().slice(-4),
      email,
      name: email.split('@')[0],
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    this.user = user;
    return { success: true, data: user };
  }

  static async getMenu(): Promise<ApiResponse<MenuItem[]>> {
    await delay(350);
    const menu = getStoredData<MenuItem[]>('smart_rest_menu_v2', INITIAL_MENU_ITEMS);
    return { success: true, data: menu };
  }

  static async getTables(): Promise<ApiResponse<Table[]>> {
    await delay(300);
    const tables = getStoredData<Table[]>('smart_rest_tables', INITIAL_TABLES);
    return { success: true, data: tables };
  }

  static async getReservations(): Promise<ApiResponse<Reservation[]>> {
    await delay(400);
    const reservations = getStoredData<Reservation[]>('smart_rest_reservations', INITIAL_RESERVATIONS);
    return { success: true, data: reservations };
  }

  static async createReservation(payload: { tableId: string; time: string; partySize: number; specialRequests?: string }): Promise<ApiResponse<Reservation>> {
    await delay(600);
    const tables = getStoredData<Table[]>('smart_rest_tables', INITIAL_TABLES);
    const selectedTable = tables.find(t => t.id === payload.tableId);

    const newRes: Reservation = {
      id: 'res-' + Date.now().toString().slice(-4),
      userId: this.user?.id || 'usr-101',
      tableId: payload.tableId,
      tableName: selectedTable ? `Table ${selectedTable.number} (${selectedTable.location?.replace('_', ' ')})` : 'Selected Table',
      time: payload.time,
      partySize: payload.partySize,
      status: 'confirmed',
      specialRequests: payload.specialRequests
    };

    const currentReservations = getStoredData<Reservation[]>('smart_rest_reservations', INITIAL_RESERVATIONS);
    const updated = [newRes, ...currentReservations];
    setStoredData('smart_rest_reservations', updated);

    await this.addNotification(`Reservation confirmed for ${new Date(payload.time).toLocaleDateString()} at ${new Date(payload.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`, 'reservation_update');

    return { success: true, data: newRes };
  }

  static async cancelReservation(id: string): Promise<ApiResponse<Reservation>> {
    await delay(400);
    const reservations = getStoredData<Reservation[]>('smart_rest_reservations', INITIAL_RESERVATIONS);
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) {
      return { success: false, error: 'Reservation not found.' };
    }
    reservations[index].status = 'cancelled';
    setStoredData('smart_rest_reservations', reservations);
    return { success: true, data: reservations[index] };
  }

  static async getOrders(): Promise<ApiResponse<Order[]>> {
    await delay(350);
    const orders = getStoredData<Order[]>('smart_rest_orders_v2', INITIAL_ORDERS);
    return { success: true, data: orders };
  }

  static async createOrder(payload: { tableId?: string; items: { menuItemId: string; quantity: number }[] }): Promise<ApiResponse<Order>> {
    await delay(650);
    const menu = getStoredData<MenuItem[]>('smart_rest_menu_v2', INITIAL_MENU_ITEMS);

    let total = 0;
    const orderItems = payload.items.map(item => {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      const price = menuItem ? menuItem.price : 450.00;
      total += price * item.quantity;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        priceAtOrder: price,
        name: menuItem?.name || 'Dish Item',
        imageUrl: menuItem?.imageUrl
      };
    });

    const newOrder: Order = {
      id: 'ord-' + Date.now().toString().slice(-4),
      userId: this.user?.id || 'usr-101',
      tableId: payload.tableId,
      tableNumber: payload.tableId ? parseInt(payload.tableId.replace(/\D/g, '')) || 4 : 4,
      items: orderItems,
      status: 'placed',
      total,
      createdAt: new Date().toISOString(),
      estimatedDeliveryMinutes: 20
    };

    const currentOrders = getStoredData<Order[]>('smart_rest_orders_v2', INITIAL_ORDERS);
    const updated = [newOrder, ...currentOrders];
    setStoredData('smart_rest_orders_v2', updated);

    await this.addNotification(`Order #${newOrder.id} received (₹${total.toFixed(2)}). Our chef is starting preparation!`, 'order_update');

    return { success: true, data: newOrder };
  }

  static async getNotifications(): Promise<ApiResponse<Notification[]>> {
    await delay(300);
    const notifs = getStoredData<Notification[]>('smart_rest_notifications', INITIAL_NOTIFICATIONS);
    return { success: true, data: notifs };
  }

  static async markNotificationRead(id: string): Promise<ApiResponse<boolean>> {
    await delay(200);
    const notifs = getStoredData<Notification[]>('smart_rest_notifications', INITIAL_NOTIFICATIONS);
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    setStoredData('smart_rest_notifications', updated);
    return { success: true, data: true };
  }

  private static async addNotification(message: string, type: 'order_update' | 'reservation_update' | 'promo' = 'order_update') {
    const notifs = getStoredData<Notification[]>('smart_rest_notifications', INITIAL_NOTIFICATIONS);
    const newNotif: Notification = {
      id: 'notif-' + Date.now().toString().slice(-4),
      userId: this.user?.id || 'usr-101',
      message,
      read: false,
      channel: 'in-app',
      createdAt: new Date().toISOString(),
      type
    };
    setStoredData('smart_rest_notifications', [newNotif, ...notifs]);
  }

  static async getAiRecommendations(): Promise<ApiResponse<MenuItem[]>> {
    await delay(500);
    const menu = getStoredData<MenuItem[]>('smart_rest_menu_v2', INITIAL_MENU_ITEMS);
    const recommended = menu.filter(m => m.available && (m.rating && m.rating >= 4.85)).slice(0, 4);
    return { success: true, data: recommended };
  }

  static async postAiAssistant(message: string): Promise<ApiResponse<{ reply: string; suggestedDishes?: MenuItem[] }>> {
    await delay(800);
    const lower = message.toLowerCase();
    const menu = getStoredData<MenuItem[]>('smart_rest_menu_v2', INITIAL_MENU_ITEMS);

    let reply = "I'd love to help you choose the perfect meal today! Our culinary team specializes in artisanal sea bass, Wagyu ribeye, and house-made arancini.";
    let suggestedDishes: MenuItem[] = [];

    if (lower.includes('vegetarian') || lower.includes('veg')) {
      const vegDishes = menu.filter(m => m.dietary?.includes('vegetarian'));
      reply = "We have extraordinary vegetarian dishes! I highly recommend the Truffle & Wild Mushroom Arancini (₹450) or our Heritage Spiced Paneer Tikka (₹420).";
      suggestedDishes = vegDishes;
    } else if (lower.includes('drink') || lower.includes('cocktail') || lower.includes('wine')) {
      const drinks = menu.filter(m => m.category === 'Beverages');
      reply = "Our mixologist recommends our Artisanal Smoked Old Fashioned (₹450) infused with cherrywood smoke and small-batch bourbon.";
      suggestedDishes = drinks;
    } else if (lower.includes('dessert') || lower.includes('sweet')) {
      const desserts = menu.filter(m => m.category === 'Desserts');
      reply = "Save room for dessert! Our Deconstructed Chocolate Hazelnut Sphere (₹380) features Valrhona 70% dark chocolate and Madagascar vanilla gelato.";
      suggestedDishes = desserts;
    } else if (lower.includes('recommend') || lower.includes('best') || lower.includes('special')) {
      reply = "Tonight's highlight recommendation is our Pan-Seared Chilean Sea Bass (₹1,350) served over saffron pea risotto!";
      suggestedDishes = menu.filter(m => m.rating && m.rating >= 4.9).slice(0, 3);
    }

    return {
      success: true,
      data: {
        reply,
        suggestedDishes
      }
    };
  }
}
