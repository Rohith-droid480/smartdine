// =============================================================================
// server/src/services/reservation.service.ts
// Reservation business logic.
// Includes capacity validation, table assignment, and conflict detection.
// =============================================================================

import { AppError } from '../utils/AppError';
import * as reservationRepo from '../repositories/reservation.repository';
import * as tableRepo from '../repositories/table.repository';
import { isPast, paginate } from '@smartdine/shared/utils';
import type { Reservation as SharedReservation, ReservationStatus } from '@smartdine/shared/types';
import type {
  CreateReservationInput,
  UpdateReservationInput,
  GetReservationsQuery,
} from '../validators/reservation.validator';

function toSharedReservation(res: any): SharedReservation {
  return {
    id: res.id,
    userId: res.userId,
    tableId: res.tableId,
    time: res.time.toISOString(),
    partySize: res.partySize,
    status: res.status as ReservationStatus,
  };
}

export async function createReservation(
  userId: string,
  input: CreateReservationInput,
): Promise<SharedReservation> {
  const reservationTime = new Date(input.time);

  if (isPast(reservationTime)) {
    throw AppError.badRequest('Reservation time cannot be in the past', 'INVALID_TIME');
  }

  let assignedTableId = input.tableId;

  if (assignedTableId) {
    const table = await tableRepo.findTableById(assignedTableId);
    if (!table) {
      throw AppError.notFound('Table');
    }

    if (table.capacity < input.partySize) {
      throw AppError.badRequest(
        `Table ${table.number} capacity (${table.capacity}) is smaller than party size (${input.partySize})`,
        'INSUFFICIENT_CAPACITY',
      );
    }

    const conflicts = await reservationRepo.findOverlappingReservations(assignedTableId, reservationTime);
    if (conflicts.length > 0) {
      throw AppError.conflict(
        'Table is already reserved for the requested time slot',
        'TABLE_CONFLICT',
      );
    }
  } else {
    // Auto-assign table
    const candidateTables = await tableRepo.findAvailableTables(input.partySize);
    let selectedTableId: string | null = null;

    for (const table of candidateTables) {
      const conflicts = await reservationRepo.findOverlappingReservations(table.id, reservationTime);
      if (conflicts.length === 0) {
        selectedTableId = table.id;
        break;
      }
    }

    if (!selectedTableId) {
      throw AppError.badRequest(
        'No available table found matching your party size for the requested time slot',
        'NO_AVAILABLE_TABLE',
      );
    }

    assignedTableId = selectedTableId;
  }

  const reservation = await reservationRepo.createReservation({
    userId,
    tableId: assignedTableId,
    time: reservationTime,
    partySize: input.partySize,
    status: 'pending',
  });

  return toSharedReservation(reservation);
}

export async function updateReservation(
  id: string,
  currentUserId: string,
  userRole: string,
  input: UpdateReservationInput,
): Promise<SharedReservation> {
  const existing = await reservationRepo.findReservationById(id);
  if (!existing) {
    throw AppError.notFound('Reservation');
  }

  if (userRole === 'customer' && existing.userId !== currentUserId) {
    throw AppError.forbidden('You can only update your own reservations');
  }

  const targetTableId = input.tableId ?? existing.tableId;
  const targetTime = input.time ? new Date(input.time) : existing.time;
  const targetPartySize = input.partySize ?? existing.partySize;

  if (input.time || input.partySize || input.tableId) {
    if (isPast(targetTime)) {
      throw AppError.badRequest('Reservation time cannot be in the past', 'INVALID_TIME');
    }

    const table = await tableRepo.findTableById(targetTableId);
    if (!table) {
      throw AppError.notFound('Table');
    }

    if (table.capacity < targetPartySize) {
      throw AppError.badRequest(
        `Table capacity (${table.capacity}) is smaller than party size (${targetPartySize})`,
        'INSUFFICIENT_CAPACITY',
      );
    }

    const conflicts = await reservationRepo.findOverlappingReservations(
      targetTableId,
      targetTime,
      120,
      id,
    );

    if (conflicts.length > 0) {
      throw AppError.conflict(
        'Table is already reserved for the requested time slot',
        'TABLE_CONFLICT',
      );
    }
  }

  const updated = await reservationRepo.updateReservation(id, {
    ...(input.tableId && { tableId: input.tableId }),
    ...(input.time && { time: targetTime }),
    ...(input.partySize && { partySize: input.partySize }),
    ...(input.status && { status: input.status as ReservationStatus }),
  });

  return toSharedReservation(updated);
}

export async function cancelReservation(
  id: string,
  currentUserId: string,
  userRole: string,
): Promise<SharedReservation> {
  const existing = await reservationRepo.findReservationById(id);
  if (!existing) {
    throw AppError.notFound('Reservation');
  }

  if (userRole === 'customer' && existing.userId !== currentUserId) {
    throw AppError.forbidden('You can only cancel your own reservations');
  }

  const updated = await reservationRepo.updateReservation(id, {
    status: 'cancelled',
  });

  return toSharedReservation(updated);
}

export async function getReservationById(
  id: string,
  currentUserId: string,
  userRole: string,
): Promise<SharedReservation> {
  const reservation = await reservationRepo.findReservationById(id);
  if (!reservation) {
    throw AppError.notFound('Reservation');
  }

  if (userRole === 'customer' && reservation.userId !== currentUserId) {
    throw AppError.forbidden('You can only view your own reservations');
  }

  return toSharedReservation(reservation);
}

export async function listReservations(
  query: GetReservationsQuery,
  currentUserId: string,
  userRole: string,
) {
  const filterUserId = userRole === 'customer' ? currentUserId : query.userId;

  const dateFilter = query.date ? new Date(query.date) : undefined;
  const startDateFilter = query.startDate ? new Date(query.startDate) : undefined;
  const endDateFilter = query.endDate ? new Date(query.endDate) : undefined;

  const total = await reservationRepo.countReservations({
    userId: filterUserId,
    tableId: query.tableId,
    status: query.status as ReservationStatus | undefined,
    date: dateFilter,
    startDate: startDateFilter,
    endDate: endDateFilter,
  });

  const paginationMeta = paginate({ page: query.page, limit: query.limit }, total);

  const reservations = await reservationRepo.findReservations({
    userId: filterUserId,
    tableId: query.tableId,
    status: query.status as ReservationStatus | undefined,
    date: dateFilter,
    startDate: startDateFilter,
    endDate: endDateFilter,
    skip: paginationMeta.offset,
    take: paginationMeta.limit,
  });

  return {
    items: reservations.map(toSharedReservation),
    pagination: {
      page: paginationMeta.page,
      limit: paginationMeta.limit,
      total: paginationMeta.total,
      totalPages: paginationMeta.totalPages,
    },
  };
}

export async function listTables() {
  const tables = await tableRepo.findAllTables();
  return tables.map((t) => ({
    id: t.id,
    number: t.number,
    capacity: t.capacity,
    status: t.status,
  }));
}
