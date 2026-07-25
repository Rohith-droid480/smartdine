// =============================================================================
// server/src/repositories/menu.repository.ts
// Data access layer for the MenuItem model.
// All Prisma calls related to menu items go here.
// =============================================================================

import { prisma } from '../config/database';
import type { MenuItem } from '@prisma/client';

export type CreateMenuItemData = {
  name: string;
  description: string;
  price: number;
  category: string;
  available?: boolean;
  imageUrl?: string;
};

export type UpdateMenuItemData = Partial<{
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl: string | null;
}>;

export type FindMenuItemsFilter = {
  category?: string;
  available?: boolean;
  search?: string;
  skip?: number;
  take?: number;
};

export async function findMenuItemById(id: string): Promise<MenuItem | null> {
  return prisma.menuItem.findUnique({ where: { id } });
}

export async function findMenuItems(filter: FindMenuItemsFilter): Promise<MenuItem[]> {
  const where: any = {};

  if (filter.category) {
    where.category = { equals: filter.category, mode: 'insensitive' };
  }

  if (filter.available !== undefined) {
    where.available = filter.available;
  }

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  return prisma.menuItem.findMany({
    where,
    skip: filter.skip,
    take: filter.take,
    orderBy: { createdAt: 'desc' },
  });
}

export async function countMenuItems(filter: Omit<FindMenuItemsFilter, 'skip' | 'take'>): Promise<number> {
  const where: any = {};

  if (filter.category) {
    where.category = { equals: filter.category, mode: 'insensitive' };
  }

  if (filter.available !== undefined) {
    where.available = filter.available;
  }

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  return prisma.menuItem.count({ where });
}

export async function createMenuItem(data: CreateMenuItemData): Promise<MenuItem> {
  return prisma.menuItem.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      available: data.available ?? true,
      imageUrl: data.imageUrl,
    },
  });
}

export async function updateMenuItem(id: string, data: UpdateMenuItemData): Promise<MenuItem> {
  return prisma.menuItem.update({
    where: { id },
    data,
  });
}

export async function deleteMenuItem(id: string): Promise<MenuItem> {
  return prisma.menuItem.delete({ where: { id } });
}
