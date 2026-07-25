// =============================================================================
// server/src/repositories/inventory.repository.ts
// Data access layer for the InventoryItem model.
// =============================================================================

import { prisma } from '../config/database';
import type { InventoryItem } from '@prisma/client';

export type CreateInventoryItemData = {
  name: string;
  quantity: number;
  unit: string;
  reorderThreshold: number;
};

export type UpdateInventoryItemData = Partial<{
  name: string;
  quantity: number;
  unit: string;
  reorderThreshold: number;
}>;

export type FindInventoryFilter = {
  search?: string;
  lowStockOnly?: boolean;
  skip?: number;
  take?: number;
};

export async function findInventoryItemById(id: string): Promise<InventoryItem | null> {
  return prisma.inventoryItem.findUnique({ where: { id } });
}

export async function findInventoryItemByName(name: string): Promise<InventoryItem | null> {
  return prisma.inventoryItem.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
  });
}

export async function findInventoryItems(filter: FindInventoryFilter): Promise<InventoryItem[]> {
  const where: any = {};

  if (filter.search) {
    where.name = { contains: filter.search, mode: 'insensitive' };
  }

  if (filter.lowStockOnly) {
    // Prisma query comparison between fields or filtered post-query
    // Custom raw clause or where quantity <= reorderThreshold
    return prisma.$queryRaw<InventoryItem[]>`
      SELECT * FROM "inventory_items"
      WHERE "quantity" <= "reorderThreshold"
      ORDER BY "name" ASC
    `;
  }

  return prisma.inventoryItem.findMany({
    where,
    skip: filter.skip,
    take: filter.take,
    orderBy: { name: 'asc' },
  });
}

export async function countInventoryItems(filter: Omit<FindInventoryFilter, 'skip' | 'take'>): Promise<number> {
  if (filter.lowStockOnly) {
    const result = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "inventory_items"
      WHERE "quantity" <= "reorderThreshold"
    `;
    return Number(result[0]?.count ?? 0);
  }

  const where: any = {};
  if (filter.search) {
    where.name = { contains: filter.search, mode: 'insensitive' };
  }

  return prisma.inventoryItem.count({ where });
}

export async function createInventoryItem(data: CreateInventoryItemData): Promise<InventoryItem> {
  return prisma.inventoryItem.create({ data });
}

export async function updateInventoryItem(id: string, data: UpdateInventoryItemData): Promise<InventoryItem> {
  return prisma.inventoryItem.update({
    where: { id },
    data,
  });
}

export async function deleteInventoryItem(id: string): Promise<InventoryItem> {
  return prisma.inventoryItem.delete({ where: { id } });
}
