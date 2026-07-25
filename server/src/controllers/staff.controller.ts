// =============================================================================
// server/src/controllers/staff.controller.ts
// Thin controller for staff management routes.
// =============================================================================

import type { Request, Response } from 'express';
import * as staffService from '../services/staff.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';

export const createStaff = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await staffService.createStaff(req.body);
  sendCreated(res, result, 'Staff member assigned successfully');
});

export const updateStaff = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await staffService.updateStaff(id, req.body);
  sendSuccess(res, result, 200, 'Staff member details updated successfully');
});

export const deleteStaff = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await staffService.deleteStaff(id);
  sendSuccess(res, result, 200, 'Staff member profile removed successfully');
});

export const getStaff = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await staffService.getStaffById(id);
  sendSuccess(res, result);
});

export const listStaff = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { items, pagination } = await staffService.listStaff(req.query as any);
  sendPaginated(res, items, pagination);
});
