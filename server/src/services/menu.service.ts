// =============================================================================
// server/src/services/menu.service.ts
// Menu business logic.
// Orchestrates repository and returns shared types.
// =============================================================================

import { AppError } from '../utils/AppError';
import * as menuRepo from '../repositories/menu.repository';
import { paginate } from '@smartdine/shared/utils';
import type { MenuItem as SharedMenuItem } from '@smartdine/shared/types';
import type { MenuItem as PrismaMenuItem } from '@prisma/client';
import type {
  CreateMenuItemInput,
  UpdateMenuItemInput,
  GetMenuItemsQuery,
} from '../validators/menu.validator';

function toSharedMenuItem(item: PrismaMenuItem): SharedMenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    category: item.category,
    available: item.available,
    ...(item.imageUrl && { imageUrl: item.imageUrl }),
  };
}

export async function createMenuItem(input: CreateMenuItemInput): Promise<SharedMenuItem> {
  const item = await menuRepo.createMenuItem({
    name: input.name,
    description: input.description,
    price: input.price,
    category: input.category,
    available: input.available,
    imageUrl: input.imageUrl || undefined,
  });

  return toSharedMenuItem(item);
}

export async function updateMenuItem(id: string, input: UpdateMenuItemInput): Promise<SharedMenuItem> {
  const existing = await menuRepo.findMenuItemById(id);
  if (!existing) {
    throw AppError.notFound('Menu item');
  }

  const updated = await menuRepo.updateMenuItem(id, {
    ...input,
    imageUrl: input.imageUrl === '' ? null : input.imageUrl,
  });

  return toSharedMenuItem(updated);
}

export async function deleteMenuItem(id: string): Promise<SharedMenuItem> {
  const existing = await menuRepo.findMenuItemById(id);
  if (!existing) {
    throw AppError.notFound('Menu item');
  }

  const deleted = await menuRepo.deleteMenuItem(id);
  return toSharedMenuItem(deleted);
}

export async function getMenuItemById(id: string): Promise<SharedMenuItem> {
  const item = await menuRepo.findMenuItemById(id);
  if (!item) {
    throw AppError.notFound('Menu item');
  }

  return toSharedMenuItem(item);
}

export async function listMenuItems(query: GetMenuItemsQuery) {
  const total = await menuRepo.countMenuItems({
    category: query.category,
    available: query.available,
    search: query.search,
  });

  const paginationMeta = paginate({ page: query.page, limit: query.limit }, total);

  const items = await menuRepo.findMenuItems({
    category: query.category,
    available: query.available,
    search: query.search,
    skip: paginationMeta.offset,
    take: paginationMeta.limit,
  });

  return {
    items: items.map(toSharedMenuItem),
    pagination: {
      page: paginationMeta.page,
      limit: paginationMeta.limit,
      total: paginationMeta.total,
      totalPages: paginationMeta.totalPages,
    },
  };
}
