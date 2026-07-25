// =============================================================================
// server/src/repositories/order.repository.ts
// Data access layer for the Order and OrderItem models.
// =============================================================================

import { prisma } from '../config/database';
import type { OrderStatus } from '@prisma/client';

export type CreateOrderItemData = {
  menuItemId: string;
  quantity: number;
  priceAtOrder: number;
};

export type CreateOrderData = {
  userId: string;
  tableId?: string;
  status?: OrderStatus;
  total: number;
  items: CreateOrderItemData[];
};

export type FindOrdersFilter = {
  userId?: string;
  tableId?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
};

export async function findOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          menuItem: {
            select: { id: true, name: true, price: true, category: true, imageUrl: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
      table: true,
    },
  });
}

export async function findOrders(filter: FindOrdersFilter) {
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

  if (filter.startDate || filter.endDate) {
    where.createdAt = {};
    if (filter.startDate) where.createdAt.gte = filter.startDate;
    if (filter.endDate) where.createdAt.lte = filter.endDate;
  }

  return prisma.order.findMany({
    where,
    skip: filter.skip,
    take: filter.take,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          menuItem: {
            select: { id: true, name: true, price: true, category: true, imageUrl: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
      table: true,
    },
  });
}

export async function countOrders(filter: Omit<FindOrdersFilter, 'skip' | 'take'>): Promise<number> {
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

  if (filter.startDate || filter.endDate) {
    where.createdAt = {};
    if (filter.startDate) where.createdAt.gte = filter.startDate;
    if (filter.endDate) where.createdAt.lte = filter.endDate;
  }

  return prisma.order.count({ where });
}

export async function createOrder(data: CreateOrderData) {
  return prisma.order.create({
    data: {
      userId: data.userId,
      tableId: data.tableId,
      status: data.status ?? 'placed',
      total: data.total,
      items: {
        create: data.items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          priceAtOrder: i.priceAtOrder,
        })),
      },
    },
    include: {
      items: {
        include: {
          menuItem: {
            select: { id: true, name: true, price: true, category: true, imageUrl: true },
          },
        },
      },
      table: true,
    },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: {
          menuItem: {
            select: { id: true, name: true, price: true, category: true, imageUrl: true },
          },
        },
      },
      table: true,
    },
  });
}

export async function updateOrder(
  id: string,
  data: Partial<{ tableId: string | null; status: OrderStatus; total: number }>,
) {
  return prisma.order.update({
    where: { id },
    data,
    include: {
      items: {
        include: {
          menuItem: {
            select: { id: true, name: true, price: true, category: true, imageUrl: true },
          },
        },
      },
      table: true,
    },
  });
}
