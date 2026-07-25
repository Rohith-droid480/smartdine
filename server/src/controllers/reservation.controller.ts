// =============================================================================
// server/src/controllers/reservation.controller.ts
// Thin controller for reservation routes.
// =============================================================================

import type { Request, Response } from 'express';
import * as reservationService from '../services/reservation.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';

export const createReservation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await reservationService.createReservation(req.user!.sub, req.body);
  sendCreated(res, result, 'Reservation created successfully');
});

export const updateReservation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await reservationService.updateReservation(
    id,
    req.user!.sub,
    req.user!.role,
    req.body,
  );
  sendSuccess(res, result, 200, 'Reservation updated successfully');
});

export const cancelReservation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await reservationService.cancelReservation(id, req.user!.sub, req.user!.role);
  sendSuccess(res, result, 200, 'Reservation cancelled successfully');
});

export const getReservation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await reservationService.getReservationById(id, req.user!.sub, req.user!.role);
  sendSuccess(res, result);
});

export const listReservations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { items, pagination } = await reservationService.listReservations(
    req.query as any,
    req.user!.sub,
    req.user!.role,
  );
  sendPaginated(res, items, pagination);
});

export const listTables = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const tables = await reservationService.listTables();
  sendSuccess(res, tables);
});
