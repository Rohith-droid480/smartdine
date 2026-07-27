// =============================================================================
// server/src/services/recommendation.service.ts
// Personalized Recommendation Engine
// Priority: Available items -> Inventory -> Meal Period -> Popularity -> User History -> AI Personalization
// =============================================================================

import * as aiRepo from '../repositories/ai.repository';
import { generateAiJson, isAiAvailable } from './ai.core';

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

/**
 * Determines current meal period based on local server hour.
 */
export function getMealPeriod(hour: number): 'Breakfast' | 'Lunch' | 'Evening' | 'Dinner' {
  if (hour >= 5 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 16) return 'Lunch';
  if (hour >= 16 && hour < 19) return 'Evening';
  return 'Dinner';
}

/**
 * Generates personalized dish recommendations for a user.
 */
export async function getPersonalizedRecommendations(
  userId?: string
): Promise<RecommendationResponse> {
  const currentHour = new Date().getHours();
  const mealPeriod = getMealPeriod(currentHour);

  // 1. Fetch available menu items from database
  const availableItems = await aiRepo.getAvailableMenuItems();

  // Filter out any items with missing or non-available status
  const validCandidates = availableItems.filter((item) => item.available);

  if (validCandidates.length === 0) {
    return { mealPeriod, recommendations: [] };
  }

  // 2. Fetch popularity map and user order history
  const [popularityMap, userOrders] = await Promise.all([
    aiRepo.getItemPopularityMap(),
    userId ? aiRepo.getOrderHistory(userId, 15) : Promise.resolve([]),
  ]);

  // Aggregate user order history per menu item
  const userOrderCountMap = new Map<string, number>();
  const userFavoriteCategories = new Map<string, number>();

  userOrders.forEach((order) => {
    order.items.forEach((item) => {
      userOrderCountMap.set(
        item.menuItemId,
        (userOrderCountMap.get(item.menuItemId) ?? 0) + item.quantity
      );
      if (item.menuItem?.category) {
        const cat = item.menuItem.category;
        userFavoriteCategories.set(cat, (userFavoriteCategories.get(cat) ?? 0) + item.quantity);
      }
    });
  });

  // 3. Score and rank candidates deterministically
  const scoredCandidates = validCandidates.map((item) => {
    let score = 50; // base score

    // Popularity score boost (up to +20)
    const popularity = popularityMap.get(item.id) ?? 0;
    score += Math.min(popularity * 2, 20);

    // User personal order history boost (up to +25)
    const userOrdered = userOrderCountMap.get(item.id) ?? 0;
    if (userOrdered > 0) {
      score += Math.min(userOrdered * 10, 25);
    } else if (userFavoriteCategories.get(item.category)) {
      score += 10; // User likes this category
    }

    // Meal period category alignment (+15)
    const catUpper = item.category.toUpperCase();
    if (mealPeriod === 'Breakfast' && (catUpper.includes('BEVERAGE') || catUpper.includes('STARTER') || catUpper.includes('BREAKFAST'))) {
      score += 15;
    } else if ((mealPeriod === 'Lunch' || mealPeriod === 'Dinner') && (catUpper.includes('MAIN') || catUpper.includes('SPECIAL'))) {
      score += 15;
    } else if (mealPeriod === 'Evening' && (catUpper.includes('BEVERAGE') || catUpper.includes('APPETIZER') || catUpper.includes('STARTER'))) {
      score += 15;
    }

    return {
      item,
      score,
      popularity,
      userOrdered,
    };
  });

  // Sort descending by score
  scoredCandidates.sort((a, b) => b.score - a.score);

  // Take top candidates (up to 4)
  const topCandidates = scoredCandidates.slice(0, 4);

  // Default deterministic recommendations
  const deterministicRecommendations: RecommendationItem[] = topCandidates.map(({ item, userOrdered, popularity }) => {
    let reason = `Popular chef selection perfect for ${mealPeriod} service.`;
    if (userOrdered > 0) {
      reason = `Frequently reordered based on your dining history.`;
    } else if (popularity > 3) {
      reason = `Top customer favorite with high order volume tonight.`;
    }

    const confidence = Math.min(Math.max(Math.round(80 + (userOrdered > 0 ? 12 : 0) + Math.min(popularity, 5)), 75), 98);

    return {
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      reason,
      confidence,
      available: item.available,
    };
  });

  // 4. Gemini AI Personalization Enhancement (Optional)
  if (isAiAvailable() && topCandidates.length > 0) {
    const candidateSummary = topCandidates.map(({ item, popularity, userOrdered }) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: Number(item.price),
      popularityCount: popularity,
      userTimesOrdered: userOrdered,
    }));

    const prompt = `You are an AI Sommelier and Culinary Recommendation Engine for SmartDine.
Current Meal Period: ${mealPeriod}
User Account Type: ${userId ? 'Returning Customer' : 'Guest'}

Candidate Dishes Available in Kitchen:
${JSON.stringify(candidateSummary, null, 2)}

Instructions:
Select and rank up to 4 recommendations from the candidates list.
For EACH recommendation, write a 1-sentence persuasive reason tailored to the ${mealPeriod} meal period and customer profile.
Assign a confidence score (number 75-98).

STRICT SAFETY RULE: Use ONLY the item IDs present in the candidate list. Do NOT invent new dish names or IDs.

Return JSON ONLY in this format:
[
  { "menuItemId": "candidate_id_here", "reason": "Reason sentence here", "confidence": 95 }
]`;

    const aiResults = await generateAiJson<Array<{ menuItemId: string; reason: string; confidence: number }>>(
      prompt,
      'You are a high-end restaurant recommendation engine. Output strictly raw JSON.'
    );

    if (Array.isArray(aiResults) && aiResults.length > 0) {
      const validMap = new Map(topCandidates.map(({ item }) => [item.id, item]));
      const aiRecommendations: RecommendationItem[] = [];

      for (const res of aiResults) {
        const item = validMap.get(res.menuItemId);
        if (item && res.reason) {
          aiRecommendations.push({
            menuItemId: item.id,
            name: item.name,
            price: Number(item.price),
            reason: res.reason.trim(),
            confidence: typeof res.confidence === 'number' ? Math.min(Math.max(res.confidence, 70), 99) : 90,
            available: item.available,
          });
        }
      }

      if (aiRecommendations.length > 0) {
        return { mealPeriod, recommendations: aiRecommendations };
      }
    }
  }

  return {
    mealPeriod,
    recommendations: deterministicRecommendations,
  };
}
