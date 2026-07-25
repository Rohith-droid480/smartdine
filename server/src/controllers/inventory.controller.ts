// =============================================================================
// server/src/controllers/inventory.controller.ts
// Thin controller for inventory routes.
// =============================================================================

import type { Request, Response } from 'express';
import * as inventoryService from '../services/inventory.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';

export const createInventoryItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await inventoryService.createInventoryItem(req.body);
  sendCreated(res, result, 'Inventory item created successfully');
});

export const updateInventoryItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await inventoryService.updateInventoryItem(id, req.body);
  sendSuccess(res, result, 200, 'Inventory item updated successfully');
});

export const deleteInventoryItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await inventoryService.deleteInventoryItem(id);
  sendSuccess(res, result, 200, 'Inventory item deleted successfully');
});

export const getInventoryItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await inventoryService.getInventoryItemById(id);
  sendSuccess(res, result);
});

export const listInventoryItems = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { items, pagination } = await inventoryService.listInventoryItems(req.query as any);
  sendPaginated(res, items, pagination);
});

export const getLowStockItems = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const items = await inventoryService.getLowStockItems();
  sendSuccess(res, items);
});
