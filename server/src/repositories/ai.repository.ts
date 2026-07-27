// =============================================================================
// server/src/repositories/ai.repository.ts
// Pure database access layer for AI & Data Insights.
// Direct Prisma queries only — strictly zero business logic.
// =============================================================================

import { prisma } from '../config/database';

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

export async function getRecentOrders(days = 7) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return prisma.order.findMany({
    where: { createdAt: { gte: cutoff } },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPopularMenuItems(limit = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  const ids = grouped.map((g) => g.menuItemId);
  return prisma.menuItem.findMany({
    where: { id: { in: ids } },
  });
}

export async function getItemPopularityMap() {
  const grouped = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    _sum: { quantity: true },
  });

  const map = new Map<string, number>();
  grouped.forEach((g) => {
    map.set(g.menuItemId, g._sum.quantity ?? 0);
  });
  return map;
}

export async function getAvailableMenuItems() {
  return prisma.menuItem.findMany({
    where: { available: true },
    orderBy: { category: 'asc' },
  });
}

export async function getInventorySnapshot() {
  return prisma.inventoryItem.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getReservationSummary(windowHours = 24) {
  const now = new Date();
  const futureCutoff = new Date(now.getTime() + windowHours * 60 * 60 * 1000);
  return prisma.reservation.findMany({
    where: {
      time: { gte: now, lte: futureCutoff },
      status: { in: ['pending', 'confirmed'] },
    },
    include: { table: true, user: { select: { name: true, email: true } } },
    orderBy: { time: 'asc' },
  });
}

export async function getSalesSummary(days = 7) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const aggregate = await prisma.order.aggregate({
    _sum: { total: true },
    _count: { id: true },
    where: {
      status: { notIn: ['placed'] },
      createdAt: { gte: cutoff },
    },
  });

  return {
    totalRevenue: Number(aggregate._sum.total ?? 0),
    totalOrders: aggregate._count.id ?? 0,
    periodDays: days,
  };
}

export async function getOrderHistory(userId: string, limit = 10) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getStaffRoster() {
  return prisma.staff.findMany({
    include: { user: { select: { name: true, email: true, role: true } } },
  });
}
