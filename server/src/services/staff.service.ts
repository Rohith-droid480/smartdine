// =============================================================================
// server/src/services/staff.service.ts
// Staff management business logic.
// Strictly admin controlled.
// =============================================================================

import { AppError } from '../utils/AppError';
import * as staffRepo from '../repositories/staff.repository';
import * as userRepo from '../repositories/user.repository';
import { paginate } from '@smartdine/shared/utils';
import type { Staff as SharedStaff } from '@smartdine/shared/types';
import type {
  CreateStaffInput,
  UpdateStaffInput,
  GetStaffQuery,
} from '../validators/staff.validator';

export interface DetailedStaff extends SharedStaff {
  name: string;
  email: string;
  systemRole: string;
  isVerified: boolean;
}

function toSharedStaff(staff: any): DetailedStaff {
  return {
    id: staff.id,
    userId: staff.userId,
    role: staff.role,
    shift: staff.shift,
    name: staff.user?.name ?? 'Unknown',
    email: staff.user?.email ?? '',
    systemRole: staff.user?.role ?? 'staff',
    isVerified: staff.user?.isVerified ?? false,
  };
}

export async function createStaff(input: CreateStaffInput): Promise<DetailedStaff> {
  const user = await userRepo.findUserById(input.userId);
  if (!user) {
    throw AppError.notFound('User');
  }

  const existing = await staffRepo.findStaffByUserId(input.userId);
  if (existing) {
    throw AppError.conflict('User already has a staff profile', 'STAFF_EXISTS');
  }

  // Update user system role to 'staff' if user is currently 'customer'
  if (user.role === 'customer') {
    await userRepo.updateUser(user.id, { role: 'staff' });
  }

  const staff = await staffRepo.createStaff({
    userId: input.userId,
    role: input.role,
    shift: input.shift,
  });

  return toSharedStaff(staff);
}

export async function updateStaff(id: string, input: UpdateStaffInput): Promise<DetailedStaff> {
  const existing = await staffRepo.findStaffById(id);
  if (!existing) {
    throw AppError.notFound('Staff profile');
  }

  const updated = await staffRepo.updateStaff(id, input);
  return toSharedStaff(updated);
}

export async function deleteStaff(id: string): Promise<DetailedStaff> {
  const existing = await staffRepo.findStaffById(id);
  if (!existing) {
    throw AppError.notFound('Staff profile');
  }

  const deleted = await staffRepo.deleteStaff(id);
  return toSharedStaff(deleted);
}

export async function getStaffById(id: string): Promise<DetailedStaff> {
  const staff = await staffRepo.findStaffById(id);
  if (!staff) {
    throw AppError.notFound('Staff profile');
  }

  return toSharedStaff(staff);
}

export async function listStaff(query: GetStaffQuery) {
  const total = await staffRepo.countStaff();
  const paginationMeta = paginate({ page: query.page, limit: query.limit }, total);

  const staffList = await staffRepo.findStaffList(paginationMeta.offset, paginationMeta.limit);

  return {
    items: staffList.map(toSharedStaff),
    pagination: {
      page: paginationMeta.page,
      limit: paginationMeta.limit,
      total: paginationMeta.total,
      totalPages: paginationMeta.totalPages,
    },
  };
}
