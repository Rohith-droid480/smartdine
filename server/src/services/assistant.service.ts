// =============================================================================
// server/src/services/assistant.service.ts
// Restaurant Operations Copilot Engine
// Answers operational questions using live SmartDine data with intent detection,
// grounded context fetching, strict out-of-scope refusal, and fail-safe Gemini integration.
// =============================================================================

import * as aiRepo from '../repositories/ai.repository';
import { generateAiCompletion, isAiAvailable } from './ai.core';

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

export const SUPPORTED_TOPICS = [
  'Sales & Revenue Summary',
  'Kitchen Workload & Active Orders',
  'Inventory & Reorder Thresholds',
  'Table Reservations & Seating',
  'Menu Item Performance & Top Sellers',
  'Demand Forecasting & Peak Periods',
  'Operational Risk Alerts & Recommendations',
];

interface DetectedIntent {
  intent: string;
  isOperational: boolean;
  sources: string[];
}

/**
 * Detects user intent and determines if query falls within restaurant operations.
 */
export function detectIntent(query: string): DetectedIntent {
  const q = query.toLowerCase().trim();

  // Out-of-scope keywords check
  const nonOperationalKeywords = [
    'weather', 'sports', 'football', 'cricket', 'movie', 'song', 'joke', 'poem',
    'president', 'capital of', 'code', 'python', 'javascript', 'recipe', 'who is',
    'tell me a story', 'what is 2+', 'math'
  ];

  for (const nok of nonOperationalKeywords) {
    if (q.includes(nok) && !q.includes('restaurant') && !q.includes('order') && !q.includes('menu')) {
      return { intent: 'out_of_scope', isOperational: false, sources: [] };
    }
  }

  // Operational Intent Matching
  if (q.includes('sale') || q.includes('revenue') || q.includes('income') || q.includes('earning') || q.includes('financial') || q.includes('money')) {
    return { intent: 'sales_summary', isOperational: true, sources: ['orders', 'billing'] };
  }

  if (q.includes('kitchen') || q.includes('preparing') || q.includes('active order') || q.includes('pending order') || q.includes('queue') || q.includes('cook')) {
    return { intent: 'kitchen_status', isOperational: true, sources: ['orders', 'kitchen'] };
  }

  if (q.includes('inventory') || q.includes('stock') || q.includes('ingredient') || q.includes('reorder') || q.includes('supplies') || q.includes('depletion')) {
    return { intent: 'inventory', isOperational: true, sources: ['inventory_items'] };
  }

  if (q.includes('reservation') || q.includes('booking') || q.includes('table') || q.includes('guest') || q.includes('seated') || q.includes('party')) {
    return { intent: 'reservations', isOperational: true, sources: ['reservations', 'tables'] };
  }

  if (q.includes('menu') || q.includes('dish') || q.includes('popular') || q.includes('top seller') || q.includes('best selling') || q.includes('food')) {
    return { intent: 'menu_performance', isOperational: true, sources: ['menu_items', 'order_items'] };
  }

  if (q.includes('recommend') || q.includes('suggest') || q.includes('upsell') || q.includes('pairing')) {
    return { intent: 'recommendations', isOperational: true, sources: ['menu_items', 'recommendations'] };
  }

  if (q.includes('forecast') || q.includes('predict') || q.includes('projection') || q.includes('expected') || q.includes('tomorrow') || q.includes('peak')) {
    return { intent: 'forecasting', isOperational: true, sources: ['orders', 'forecast'] };
  }

  if (q.includes('alert') || q.includes('warning') || q.includes('risk') || q.includes('problem') || q.includes('issue')) {
    return { intent: 'operational_alerts', isOperational: true, sources: ['inventory', 'reservations', 'orders'] };
  }

  if (q.includes('summary') || q.includes('today') || q.includes('overview') || q.includes('daily') || q.includes('status') || q.includes('performance') || q.includes('how are we doing')) {
    return { intent: 'daily_summary', isOperational: true, sources: ['sales', 'orders', 'inventory', 'reservations'] };
  }

  // Generic restaurant query check
  const genericRestaurantWords = ['restaurant', 'staff', 'shift', 'dine', 'smartdine', 'customer', 'order'];
  if (genericRestaurantWords.some((w) => q.includes(w))) {
    return { intent: 'daily_summary', isOperational: true, sources: ['orders', 'sales'] };
  }

  return { intent: 'out_of_scope', isOperational: false, sources: [] };
}

/**
 * Fetches grounded context from database corresponding strictly to the detected intent.
 */
export async function buildIntentContext(intent: string): Promise<{ contextSummary: string; rawDataSummary: Record<string, unknown> }> {
  let contextSummary = '';
  const rawDataSummary: Record<string, unknown> = {};

  switch (intent) {
    case 'sales_summary': {
      const sales = await aiRepo.getSalesSummary(7);
      rawDataSummary['sales7Days'] = sales;
      const avgTicket = sales.totalOrders > 0 ? (sales.totalRevenue / sales.totalOrders).toFixed(2) : '0.00';
      contextSummary = `7-Day Sales Performance: Total Revenue ₹${sales.totalRevenue.toFixed(2)}, Total Completed Orders: ${sales.totalOrders}, Average Ticket Size: ₹${avgTicket}.`;
      break;
    }

    case 'kitchen_status': {
      const orders = await aiRepo.getRecentOrders(1);
      const active = orders.filter((o) => o.status === 'placed' || o.status === 'preparing');
      const preparing = orders.filter((o) => o.status === 'preparing');
      const placed = orders.filter((o) => o.status === 'placed');
      rawDataSummary['activeOrderCount'] = active.length;
      contextSummary = `Kitchen Status: ${active.length} active order(s) (${preparing.length} in preparation, ${placed.length} newly placed awaiting line prep).`;
      break;
    }

    case 'inventory': {
      const inventory = await aiRepo.getInventorySnapshot();
      const lowStock = inventory.filter((i) => Number(i.quantity) <= Number(i.reorderThreshold));
      rawDataSummary['totalInventoryItems'] = inventory.length;
      rawDataSummary['lowStockCount'] = lowStock.length;
      const lowNames = lowStock.map((i) => `${i.name} (${Number(i.quantity)} ${i.unit})`).join(', ');
      contextSummary = `Inventory Audit: ${inventory.length} total items. ${lowStock.length} item(s) below reorder threshold: ${lowNames || 'None (all stock levels healthy)'}.`;
      break;
    }

    case 'reservations': {
      const reservations = await aiRepo.getReservationSummary(24);
      const guestCount = reservations.reduce((sum, r) => sum + r.partySize, 0);
      rawDataSummary['upcomingReservationCount'] = reservations.length;
      rawDataSummary['totalGuests'] = guestCount;
      contextSummary = `24-Hour Seating Schedule: ${reservations.length} upcoming reservation(s) expecting a total of ${guestCount} guest(s).`;
      break;
    }

    case 'menu_performance': {
      const popular = await aiRepo.getPopularMenuItems(5);
      const available = await aiRepo.getAvailableMenuItems();
      const popularNames = popular.map((p) => p.name).join(', ');
      contextSummary = `Menu Insights: ${available.length} active available menu items. Top selling dishes: ${popularNames || 'Menu items active'}.`;
      break;
    }

    case 'recommendations': {
      const available = await aiRepo.getAvailableMenuItems();
      const popular = await aiRepo.getPopularMenuItems(3);
      contextSummary = `Recommendations Engine: ${available.length} active available items. Featured chef specials: ${popular.map((p) => p.name).join(', ')}.`;
      break;
    }

    case 'forecasting': {
      const sales = await aiRepo.getSalesSummary(14);
      const reservations = await aiRepo.getReservationSummary(24);
      const guests = reservations.reduce((sum, r) => sum + r.partySize, 0);
      const dailyAvg = sales.totalOrders > 0 ? (sales.totalOrders / 14).toFixed(1) : '10';
      contextSummary = `Demand Forecast Signal: Historical 14-day daily average: ${dailyAvg} orders/day. Upcoming 24h reservations: ${reservations.length} bookings (${guests} guests). Peak period estimated 19:00 - 21:30.`;
      break;
    }

    case 'operational_alerts': {
      const inventory = await aiRepo.getInventorySnapshot();
      const lowStock = inventory.filter((i) => Number(i.quantity) <= Number(i.reorderThreshold));
      const orders = await aiRepo.getRecentOrders(1);
      const active = orders.filter((o) => o.status === 'placed' || o.status === 'preparing');
      contextSummary = `Operational Risk Audit: ${lowStock.length} low-stock inventory warning(s). ${active.length} active kitchen order(s) requiring prep monitoring.`;
      break;
    }

    case 'daily_summary':
    default: {
      const sales = await aiRepo.getSalesSummary(1);
      const orders = await aiRepo.getRecentOrders(1);
      const active = orders.filter((o) => o.status === 'placed' || o.status === 'preparing');
      const reservations = await aiRepo.getReservationSummary(24);
      contextSummary = `Daily Operations Overview: Today's Revenue ₹${sales.totalRevenue.toFixed(2)} across ${sales.totalOrders} order(s). ${active.length} active kitchen order(s). ${reservations.length} upcoming reservations.`;
      break;
    }
  }

  return { contextSummary, rawDataSummary };
}

/**
 * Processes an incoming operational assistant query from staff.
 */
export async function processAssistantQuery(query: string): Promise<AssistantResponseData> {
  // 1. Detect Intent
  const detected = detectIntent(query);

  // 2. Refusal Behavior for non-operational queries (no Gemini call)
  if (!detected.isOperational) {
    return {
      supported: false,
      message: 'I am the SmartDine Restaurant Operations Copilot. I can only assist with restaurant metrics, kitchen orders, inventory, reservations, menu items, and sales forecasts.',
      supportedTopics: SUPPORTED_TOPICS,
    };
  }

  // 3. Build Grounded DB Context
  const { contextSummary } = await buildIntentContext(detected.intent);

  // Fallback deterministic response (used if Gemini fails or is not configured)
  const deterministicAnswer = `[SmartDine Operations Copilot] ${contextSummary}`;

  // 4. Gemini AI Grounded Generation (Optional & Fail-Safe)
  if (isAiAvailable()) {
    const prompt = `You are the executive Restaurant Operations Copilot for SmartDine.
User Query: "${query}"
Detected Operational Intent: "${detected.intent}"

STRICT GROUNDED CONTEXT FROM LIVE DATABASE:
${contextSummary}

STRICT INSTRUCTIONS:
1. Answer the user query clearly and concisely using ONLY the figures and facts in the GROUNDED CONTEXT above.
2. Provide 1 brief actionable recommendation for the shift manager.
3. NEVER invent numbers, revenue figures, guest counts, or dish names not present in the context.
4. Keep answer under 4 sentences. Plain text only.`;

    const aiAnswer = await generateAiCompletion(
      prompt,
      'You are a professional restaurant operations AI copilot. Respond concisely using live data only.'
    );

    if (aiAnswer && aiAnswer.trim()) {
      return {
        supported: true,
        intent: detected.intent,
        answer: aiAnswer.trim(),
        confidence: 95,
        sources: detected.sources,
      };
    }
  }

  return {
    supported: true,
    intent: detected.intent,
    answer: deterministicAnswer,
    confidence: 85,
    sources: detected.sources,
  };
}
