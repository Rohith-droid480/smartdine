// =============================================================================
// server/src/services/forecast.service.ts
// Demand Forecasting Engine
// Deterministically calculates demand metrics from live database data.
// Gemini optionally enriches explanations/recommendations without altering numbers.
// =============================================================================

import * as aiRepo from '../repositories/ai.repository';
import { generateAiJson, isAiAvailable } from './ai.core';

export interface DemandForecastResponse {
  forecastDate: string;
  expectedCustomers: number;
  expectedOrders: number;
  expectedRevenue: number;
  peakPeriod: string;
  inventoryPressure: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  recommendations: string[];
}

/**
 * Helper to format date in YYYY-MM-DD format
 */
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0] ?? d.toDateString();
}

/**
 * Deterministically calculates restaurant demand forecast based on live database data.
 */
export async function generateDemandForecast(): Promise<DemandForecastResponse> {
  const today = new Date();
  const forecastDate = formatDate(today);

  // 1. Fetch live historical data & current database state
  const [recentOrders, salesSummary, reservations, inventory, staffList] = await Promise.all([
    aiRepo.getRecentOrders(14),
    aiRepo.getSalesSummary(14),
    aiRepo.getReservationSummary(24),
    aiRepo.getInventorySnapshot(),
    aiRepo.getStaffRoster(),
  ]);

  // 2. Average Order Value (AOV) & Daily Order Average
  const totalRevenue = salesSummary.totalRevenue;
  const totalOrders = salesSummary.totalOrders;
  const periodDays = Math.max(salesSummary.periodDays, 1);

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 450.0;
  const dailyOrderAverage = totalOrders > 0 ? totalOrders / periodDays : 10;

  // 3. Reservation Signal Integration
  const upcomingReservations = reservations;
  const upcomingGuests = upcomingReservations.reduce((sum, r) => sum + r.partySize, 0);
  const expectedReservationOrders = Math.ceil(upcomingGuests * 0.85);

  // Estimated total orders (blending historical daily baseline + reservation demand)
  const walkInOrders = Math.ceil(dailyOrderAverage * 0.75);
  const expectedOrders = Math.max(Math.ceil(dailyOrderAverage), expectedReservationOrders + walkInOrders);
  const expectedCustomers = Math.max(upcomingGuests, Math.ceil(expectedOrders * 1.8));
  const expectedRevenue = Math.round(expectedOrders * averageOrderValue * 100) / 100;

  // 4. Peak Operating Period Calculation from Order Density
  const hourCounts: Record<number, number> = {};
  recentOrders.forEach((o) => {
    const hr = new Date(o.createdAt).getHours();
    hourCounts[hr] = (hourCounts[hr] ?? 0) + 1;
  });

  let maxPeakHour = 19; // Default dinner peak if no history
  let maxCount = 0;
  Object.entries(hourCounts).forEach(([hrStr, count]) => {
    const hr = Number(hrStr);
    if (count > maxCount) {
      maxCount = count;
      maxPeakHour = hr;
    }
  });

  const peakStartStr = `${maxPeakHour.toString().padStart(2, '0')}:00`;
  const peakEndStr = `${((maxPeakHour + 2) % 24).toString().padStart(2, '0')}:30`;
  const peakPeriod = `${peakStartStr} - ${peakEndStr}`;

  // 5. Inventory Pressure Calculation
  const lowStockItems = inventory.filter((item) => Number(item.quantity) <= Number(item.reorderThreshold));
  const outOfStockItems = inventory.filter((item) => Number(item.quantity) <= 0);

  let inventoryPressure: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (outOfStockItems.length > 0 || lowStockItems.length >= 3) {
    inventoryPressure = 'HIGH';
  } else if (lowStockItems.length >= 1) {
    inventoryPressure = 'MEDIUM';
  }

  // 6. Confidence Score (derived from data points volume)
  let confidence = 85;
  if (totalOrders >= 20 && periodDays >= 10) {
    confidence = 94;
  } else if (totalOrders >= 5) {
    confidence = 82;
  } else {
    confidence = 68; // Graceful low-data confidence
  }

  // 7. Deterministic Default Recommendations
  const lowStockNames = lowStockItems.map((i) => i.name).join(', ');
  const activeStaffCount = staffList.length;

  const deterministicRecommendations: string[] = [
    `Forecast projects ~${expectedOrders} orders and ₹${expectedRevenue.toFixed(2)} revenue for ${forecastDate}.`,
  ];

  if (inventoryPressure === 'HIGH') {
    deterministicRecommendations.push(
      `HIGH INVENTORY PRESSURE: Reorder depleted ingredients immediately (${lowStockNames || 'low stock items'}).`
    );
  } else if (inventoryPressure === 'MEDIUM') {
    deterministicRecommendations.push(
      `MODERATE INVENTORY PRESSURE: Monitor stock for ${lowStockNames} before peak shift.`
    );
  } else {
    deterministicRecommendations.push(`Inventory stock levels are healthy for projected order volume.`);
  }

  if (upcomingGuests > 6 && activeStaffCount < 4) {
    deterministicRecommendations.push(
      `Staffing Alert: ${upcomingGuests} reserved guests expected during peak period (${peakPeriod}). Consider adding 1 floor staff.`
    );
  } else {
    deterministicRecommendations.push(
      `Staffing Roster (${activeStaffCount} active staff) is aligned with projected peak period (${peakPeriod}).`
    );
  }

  deterministicRecommendations.push(
    `Promote high-margin specials during ${peakPeriod} to maximize ticket average above ₹${averageOrderValue.toFixed(2)}.`
  );

  // 8. Gemini AI Operational Explanation (Optional & Fail-Safe)
  if (isAiAvailable()) {
    const summaryContext = {
      forecastDate,
      expectedCustomers,
      expectedOrders,
      expectedRevenue,
      peakPeriod,
      inventoryPressure,
      lowStockItemNames: lowStockItems.map((i) => i.name),
      upcomingReservationsCount: upcomingReservations.length,
      upcomingGuests,
      activeStaffCount,
      averageOrderValue,
    };

    const prompt = `You are an executive restaurant operations analyst.
Given these exact calculated forecast figures derived from database metrics:
${JSON.stringify(summaryContext, null, 2)}

STRICT RULES:
1. DO NOT change or invent any forecast numbers (customers: ${expectedCustomers}, orders: ${expectedOrders}, revenue: ${expectedRevenue}, peak: "${peakPeriod}", pressure: "${inventoryPressure}").
2. Provide 3 to 4 actionable, shift-management recommendations for staff explaining how to handle this projected demand.
3. Return JSON ONLY in this format:
{
  "recommendations": [
    "string 1",
    "string 2",
    "string 3"
  ]
}`;

    const aiResult = await generateAiJson<{ recommendations: string[] }>(
      prompt,
      'You are a senior restaurant operations strategist. Output raw JSON strictly matching the schema.'
    );

    if (aiResult?.recommendations && Array.isArray(aiResult.recommendations) && aiResult.recommendations.length > 0) {
      return {
        forecastDate,
        expectedCustomers,
        expectedOrders,
        expectedRevenue,
        peakPeriod,
        inventoryPressure,
        confidence,
        recommendations: aiResult.recommendations.map((r) => r.trim()),
      };
    }
  }

  return {
    forecastDate,
    expectedCustomers,
    expectedOrders,
    expectedRevenue,
    peakPeriod,
    inventoryPressure,
    confidence,
    recommendations: deterministicRecommendations,
  };
}
