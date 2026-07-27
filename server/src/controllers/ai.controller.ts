// =============================================================================
// server/src/controllers/ai.controller.ts
// Thin controller for AI endpoints.
// Strictly delegates execution to service layer.
// =============================================================================

import type { Request, Response } from 'express';
import * as insightsService from '../services/insights.service';
import * as recommendationService from '../services/recommendation.service';
import * as forecastService from '../services/forecast.service';
import * as assistantService from '../services/assistant.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

export const getInsights = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const insights = await insightsService.getOperationalInsights();
  sendSuccess(res, insights, 200, 'Operational insights retrieved successfully');
});

export const getRecommendations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  const recommendations = await recommendationService.getPersonalizedRecommendations(userId);
  sendSuccess(res, recommendations, 200, 'Personalized menu recommendations retrieved successfully');
});

export const getForecast = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const forecast = await forecastService.generateDemandForecast();
  sendSuccess(res, forecast, 200, 'Demand forecast calculated successfully');
});

export const getAssistant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const message = (req.body?.message || req.body?.query || '').toString();
  const result = await assistantService.processAssistantQuery(message);
  sendSuccess(res, result, 200, result.supported ? 'Query processed successfully' : 'Query out of operational scope');
});
