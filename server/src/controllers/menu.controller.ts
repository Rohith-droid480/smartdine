// =============================================================================
// server/src/controllers/menu.controller.ts
// Thin controller for menu routes.
// =============================================================================

import type { Request, Response } from 'express';
import * as menuService from '../services/menu.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';

export const createMenuItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await menuService.createMenuItem(req.body);
  sendCreated(res, result, 'Menu item created successfully');
});

export const updateMenuItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await menuService.updateMenuItem(id, req.body);
  sendSuccess(res, result, 200, 'Menu item updated successfully');
});

export const deleteMenuItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await menuService.deleteMenuItem(id);
  sendSuccess(res, result, 200, 'Menu item deleted successfully');
});

export const getMenuItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await menuService.getMenuItemById(id);
  sendSuccess(res, result);
});

export const listMenuItems = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { items, pagination } = await menuService.listMenuItems(req.query as any);
  sendPaginated(res, items, pagination);
});
