// =============================================================================
// server/src/controllers/billing.controller.ts
// Thin controller for billing routes.
// =============================================================================

import type { Request, Response } from 'express';
import * as billingService from '../services/billing.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

export const generateBill = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await billingService.generateBill(req.body);
  sendSuccess(res, result, 200, 'Bill and receipt payload generated successfully');
});

export const getReceipt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params as { orderId: string };
  const result = await billingService.getReceiptByOrderId(orderId);
  sendSuccess(res, result);
});
