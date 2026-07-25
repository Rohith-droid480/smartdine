// =============================================================================
// server/src/services/inventory.service.ts
// Inventory business logic.
// Includes stock quantity rules, threshold validation, and low stock detection.
// =============================================================================

import { AppError } from '../utils/AppError';
import * as inventoryRepo from '../repositories/inventory.repository';
import { paginate } from '@smartdine/shared/utils';
import type { InventoryItem as SharedInventoryItem } from '@smartdine/shared/types';
import type { InventoryItem as PrismaInventoryItem } from '@prisma/client';
import type {
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  GetInventoryQuery,
} from '../validators/inventory.validator';

export interface DetailedInventoryItem extends SharedInventoryItem {
  isLowStock: boolean;
}

function toSharedInventoryItem(item: PrismaInventoryItem): DetailedInventoryItem {
  const quantity = Number(item.quantity);
  const reorderThreshold = Number(item.reorderThreshold);
  return {
    id: item.id,
    name: item.name,
    quantity,
    unit: item.unit,
    reorderThreshold,
    isLowStock: quantity <= reorderThreshold,
  };
}

export async function createInventoryItem(input: CreateInventoryItemInput): Promise<DetailedInventoryItem> {
  if (input.quantity < 0) {
    throw AppError.badRequest('Stock quantity cannot be negative', 'INVALID_QUANTITY');
  }

  const existing = await inventoryRepo.findInventoryItemByName(input.name);
  if (existing) {
    throw AppError.conflict(`Inventory item with name "${input.name}" already exists`, 'DUPLICATE_NAME');
  }

  const item = await inventoryRepo.createInventoryItem({
    name: input.name,
    quantity: input.quantity,
    unit: input.unit,
    reorderThreshold: input.reorderThreshold,
  });

  return toSharedInventoryItem(item);
}

export async function updateInventoryItem(
  id: string,
  input: UpdateInventoryItemInput,
): Promise<DetailedInventoryItem> {
  const existing = await inventoryRepo.findInventoryItemById(id);
  if (!existing) {
    throw AppError.notFound('Inventory item');
  }

  if (input.quantity !== undefined && input.quantity < 0) {
    throw AppError.badRequest('Stock quantity cannot be negative', 'INVALID_QUANTITY');
  }

  if (input.name && input.name.toLowerCase() !== existing.name.toLowerCase()) {
    const duplicate = await inventoryRepo.findInventoryItemByName(input.name);
    if (duplicate) {
      throw AppError.conflict(`Inventory item with name "${input.name}" already exists`, 'DUPLICATE_NAME');
    }
  }

  const updated = await inventoryRepo.updateInventoryItem(id, input);
  return toSharedInventoryItem(updated);
}

export async function deleteInventoryItem(id: string): Promise<DetailedInventoryItem> {
  const existing = await inventoryRepo.findInventoryItemById(id);
  if (!existing) {
    throw AppError.notFound('Inventory item');
  }

  const deleted = await inventoryRepo.deleteInventoryItem(id);
  return toSharedInventoryItem(deleted);
}

export async function getInventoryItemById(id: string): Promise<DetailedInventoryItem> {
  const item = await inventoryRepo.findInventoryItemById(id);
  if (!item) {
    throw AppError.notFound('Inventory item');
  }

  return toSharedInventoryItem(item);
}

export async function listInventoryItems(query: GetInventoryQuery) {
  const total = await inventoryRepo.countInventoryItems({
    search: query.search,
    lowStockOnly: query.lowStockOnly,
  });

  const paginationMeta = paginate({ page: query.page, limit: query.limit }, total);

  const items = await inventoryRepo.findInventoryItems({
    search: query.search,
    lowStockOnly: query.lowStockOnly,
    skip: paginationMeta.offset,
    take: paginationMeta.limit,
  });

  return {
    items: items.map(toSharedInventoryItem),
    pagination: {
      page: paginationMeta.page,
      limit: paginationMeta.limit,
      total: paginationMeta.total,
      totalPages: paginationMeta.totalPages,
    },
  };
}

export async function getLowStockItems() {
  const items = await inventoryRepo.findInventoryItems({ lowStockOnly: true });
  return items.map(toSharedInventoryItem);
}
