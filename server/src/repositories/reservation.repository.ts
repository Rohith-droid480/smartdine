// =============================================================================
// server/src/repositories/reservation.repository.ts
// Data access layer for the Reservation model.
// =============================================================================

import { prisma } from '../config/database';
import type { Reservation, ReservationStatus } from '@prisma/client';

export type CreateReservationData = {
  userId: string;
  tableId: string;
  time: Date;
  partySize: number;
  status?: ReservationStatus;
};

export type UpdateReservationData = Partial<{
  tableId: string;
  time: Date;
  partySize: number;
  status: ReservationStatus;
}>;

export type FindReservationsFilter = {
  userId?: string;
  tableId?: string;
  status?: ReservationStatus;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
};

export async function findReservationById(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      table: true,
    },
  });
}

export async function findReservations(filter: FindReservationsFilter) {
  const where: any = {};

  if (filter.userId) {
    where.userId = filter.userId;
  }

  if (filter.tableId) {
    where.tableId = filter.tableId;
  }

  if (filter.status) {
    where.status = filter.status;
  }

  if (filter.date) {
    const startOfDay = new Date(filter.date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(filter.date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    where.time = {
      gte: startOfDay,
      lte: endOfDay,
    };
  } else if (filter.startDate || filter.endDate) {
    where.time = {};
    if (filter.startDate) where.time.gte = filter.startDate;
    if (filter.endDate) where.time.lte = filter.endDate;
  }

  return prisma.reservation.findMany({
    where,
    skip: filter.skip,
    take: filter.take,
    orderBy: { time: 'asc' },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      table: true,
    },
  });
}

export async function countReservations(filter: Omit<FindReservationsFilter, 'skip' | 'take'>): Promise<number> {
  const where: any = {};

  if (filter.userId) {
    where.userId = filter.userId;
  }

  if (filter.tableId) {
    where.tableId = filter.tableId;
  }

  if (filter.status) {
    where.status = filter.status;
  }

  if (filter.date) {
    const startOfDay = new Date(filter.date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(filter.date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    where.time = {
      gte: startOfDay,
      lte: endOfDay,
    };
  } else if (filter.startDate || filter.endDate) {
    where.time = {};
    if (filter.startDate) where.time.gte = filter.startDate;
    if (filter.endDate) where.time.lte = filter.endDate;
  }

  return prisma.reservation.count({ where });
}

export async function findOverlappingReservations(
  tableId: string,
  time: Date,
  windowMinutes = 120,
  excludeReservationId?: string,
): Promise<Reservation[]> {
  const windowMs = windowMinutes * 60 * 1000;
  const minTime = new Date(time.getTime() - windowMs);
  const maxTime = new Date(time.getTime() + windowMs);

  const where: any = {
    tableId,
    status: { in: ['pending', 'confirmed'] },
    time: {
      gt: minTime,
      lt: maxTime,
    },
  };

  if (excludeReservationId) {
    where.id = { not: excludeReservationId };
  }

  return prisma.reservation.findMany({ where });
}

export async function createReservation(data: CreateReservationData) {
  return prisma.reservation.create({
    data: {
      userId: data.userId,
      tableId: data.tableId,
      time: data.time,
      partySize: data.partySize,
      status: data.status ?? 'pending',
    },
    include: {
      table: true,
    },
  });
}

export async function updateReservation(id: string, data: UpdateReservationData) {
  return prisma.reservation.update({
    where: { id },
    data,
    include: {
      table: true,
    },
  });
}
