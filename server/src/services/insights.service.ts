// =============================================================================
// server/src/services/insights.service.ts
// Operational Insights Engine
// Derives real-time business insights strictly from live database state.
// Enriches high-impact insights with Gemini AI recommendations when available.
// =============================================================================

import * as aiRepo from '../repositories/ai.repository';
import { generateAiJson, isAiAvailable } from './ai.core';

export interface OperationalInsight {
  id: string;
  title: string;
  description: string;
  category: 'INVENTORY' | 'STAFFING' | 'MENU_OPTIMIZATION' | 'REVENUE';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actionableRecommendation: string;
  createdAt: string;
}

/**
 * Generates operational insights strictly from live database data.
 */
export async function getOperationalInsights(): Promise<OperationalInsight[]> {
  const insights: OperationalInsight[] = [];
  const now = new Date();

  // 1. Fetch live data from database repositories
  const [inventory, recentOrders, reservations, staffList, menuItems, salesSummary] = await Promise.all([
    aiRepo.getInventorySnapshot(),
    aiRepo.getRecentOrders(7),
    aiRepo.getReservationSummary(24),
    aiRepo.getStaffRoster(),
    aiRepo.getAvailableMenuItems(),
    aiRepo.getSalesSummary(7),
  ]);

  // ---------------------------------------------------------------------------
  // Rule 1: Low Inventory / Depletion Risk
  // ---------------------------------------------------------------------------
  const lowStockItems = inventory.filter((item) => Number(item.quantity) <= Number(item.reorderThreshold));
  if (lowStockItems.length > 0) {
    const itemNames = lowStockItems.map((i) => `${i.name} (${Number(i.quantity)} ${i.unit})`).join(', ');
    insights.push({
      id: `ins_inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'Critical Ingredient Depletion Warning',
      description: `Live stock audit identified ${lowStockItems.length} item(s) at or below reorder thresholds: ${itemNames}.`,
      category: 'INVENTORY',
      impact: lowStockItems.length >= 3 ? 'HIGH' : 'MEDIUM',
      actionableRecommendation: `Initiate emergency stock re-order for ${lowStockItems[0]?.name ?? 'affected items'} or flag dependent dishes as unavailable in kitchen tickets.`,
      createdAt: now.toISOString(),
    });
  }

  // ---------------------------------------------------------------------------
  // Rule 2: Peak Reservations vs Floor Staffing
  // ---------------------------------------------------------------------------
  const upcomingGuests = reservations.reduce((sum, r) => sum + r.partySize, 0);
  const activeStaffCount = staffList.length;

  if (upcomingGuests > 6 && activeStaffCount < 4) {
    insights.push({
      id: `ins_stf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'Peak Shift Floor Staffing Bottleneck',
      description: `Upcoming 24-hour reservation load (${reservations.length} bookings, ${upcomingGuests} guests) exceeds current scheduled floor coverage (${activeStaffCount} staff).`,
      category: 'STAFFING',
      impact: 'HIGH',
      actionableRecommendation: `Schedule 1 additional floor waiter to handle anticipated guest arrival surge.`,
      createdAt: now.toISOString(),
    });
  }

  // ---------------------------------------------------------------------------
  // Rule 3: Kitchen Workload & Active Orders
  // ---------------------------------------------------------------------------
  const activeOrders = recentOrders.filter((o) => o.status === 'placed' || o.status === 'preparing');
  if (activeOrders.length > 0) {
    insights.push({
      id: `ins_ktc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'Active Kitchen Order Volume',
      description: `There are currently ${activeOrders.length} order(s) active in preparation status requiring kitchen throughput monitoring.`,
      category: 'REVENUE',
      impact: activeOrders.length > 5 ? 'HIGH' : 'MEDIUM',
      actionableRecommendation: `Prioritize expedite prep line to maintain kitchen throughput below 15-minute fulfillment SLA.`,
      createdAt: now.toISOString(),
    });
  }

  // ---------------------------------------------------------------------------
  // Rule 4: Sales Performance & Revenue Velocity
  // ---------------------------------------------------------------------------
  if (salesSummary.totalOrders > 0) {
    const avgTicket = salesSummary.totalOrders > 0 ? (salesSummary.totalRevenue / salesSummary.totalOrders).toFixed(2) : '0.00';
    insights.push({
      id: `ins_rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: '7-Day Revenue Velocity & Average Ticket',
      description: `System generated ₹${salesSummary.totalRevenue.toFixed(2)} across ${salesSummary.totalOrders} order(s) with an average ticket value of ₹${avgTicket}.`,
      category: 'REVENUE',
      impact: 'LOW',
      actionableRecommendation: `Promote high-margin beverage pairings during peak hours to elevate average ticket size above target thresholds.`,
      createdAt: now.toISOString(),
    });
  }

  // ---------------------------------------------------------------------------
  // Rule 5: Menu Item Optimization
  // ---------------------------------------------------------------------------
  if (menuItems.length > 0) {
    const topCategory = menuItems[0]?.category ?? 'Main Courses';
    insights.push({
      id: `ins_mnu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'Menu Category Upsell Opportunity',
      description: `Category "${topCategory}" currently features ${menuItems.length} active menu item(s) ready for customer ordering.`,
      category: 'MENU_OPTIMIZATION',
      impact: 'LOW',
      actionableRecommendation: `Feature top chef recommendations from ${topCategory} at the head of customer digital menu lists.`,
      createdAt: now.toISOString(),
    });
  }

  // ---------------------------------------------------------------------------
  // AI Enrichment Layer (Optional & Fail-Safe)
  // If Gemini API is available, enrich the top HIGH-impact insight with AI reasoning
  // ---------------------------------------------------------------------------
  if (isAiAvailable()) {
    const highImpactInsight = insights.find((i) => i.impact === 'HIGH');
    if (highImpactInsight) {
      const prompt = `Given this restaurant operational risk context:
Title: "${highImpactInsight.title}"
Description: "${highImpactInsight.description}"
Low Stock Items Count: ${lowStockItems.length}
Upcoming Reservations Count: ${reservations.length}

Provide ONE short, highly tactical, professional recommendation (maximum 25 words) for the restaurant manager.
Return JSON format: {"recommendation": "your recommendation here"}`;

      const aiResponse = await generateAiJson<{ recommendation: string }>(
        prompt,
        'You are an executive restaurant operations consultant. Provide concise, highly actionable advice.'
      );

      if (aiResponse?.recommendation && aiResponse.recommendation.trim()) {
        highImpactInsight.actionableRecommendation = `AI Strategy: ${aiResponse.recommendation.trim()}`;
      }
    }
  }

  return insights;
}
