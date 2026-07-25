// =============================================================================
// server/src/repositories/staff.repository.ts
// Data access layer for the Staff model.
// =============================================================================

import { prisma } from '../config/database';

export type CreateStaffData = {
  userId: string;
  role: string;
  shift: string;
};

export type UpdateStaffData = Partial<{
  role: string;
  shift: string;
}>;

export async function findStaffById(id: string) {
  return prisma.staff.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
      },
    },
  });
}

export async function findStaffByUserId(userId: string) {
  return prisma.staff.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
      },
    },
  });
}

export async function findStaffList(skip?: number, take?: number) {
  return prisma.staff.findMany({
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
      },
    },
  });
}

export async function countStaff(): Promise<number> {
  return prisma.staff.count();
}

export async function createStaff(data: CreateStaffData) {
  return prisma.staff.create({
    data,
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
      },
    },
  });
}

export async function updateStaff(id: string, data: UpdateStaffData) {
  return prisma.staff.update({
    where: { id },
    data,
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
      },
    },
  });
}

export async function deleteStaff(id: string) {
  return prisma.staff.delete({
    where: { id },
  });
}
