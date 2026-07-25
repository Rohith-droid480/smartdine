// =============================================================================
// server/src/controllers/order.controller.ts
// Thin controller for order routes.
// =============================================================================

import type { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';

export const createOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await orderService.createOrder(req.user!.sub, req.body);
  sendCreated(res, result, 'Order placed successfully');
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await orderService.updateOrderStatus(
    id,
    req.user!.sub,
    req.user!.role,
    req.body,
  );
  sendSuccess(res, result, 200, 'Order status updated successfully');
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await orderService.cancelOrder(id, req.user!.sub, req.user!.role);
  sendSuccess(res, result, 200, 'Order cancelled successfully');
});

export const getOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await orderService.getOrderById(id, req.user!.sub, req.user!.role);
  sendSuccess(res, result);
});

export const listOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { items, pagination } = await orderService.listOrders(
    req.query as any,
    req.user!.sub,
    req.user!.role,
  );
  sendPaginated(res, items, pagination);
});
