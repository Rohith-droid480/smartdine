// =============================================================================
// server/src/services/order.service.ts
// Order business logic.
// Includes menu item availability verification and total calculation.
// =============================================================================

import { AppError } from '../utils/AppError';
import * as orderRepo from '../repositories/order.repository';
import * as menuRepo from '../repositories/menu.repository';
import * as tableRepo from '../repositories/table.repository';
import { paginate } from '@smartdine/shared/utils';
import { ORDER_STATUS_TRANSITIONS } from '@smartdine/shared/constants';
import type { Order as SharedOrder, OrderStatus } from '@smartdine/shared/types';
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
  GetOrdersQuery,
} from '../validators/order.validator';

function toSharedOrder(order: any): SharedOrder {
  return {
    id: order.id,
    userId: order.userId,
    ...(order.tableId && { tableId: order.tableId }),
    items: order.items.map((i: any) => ({
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      priceAtOrder: Number(i.priceAtOrder),
    })),
    status: order.status as OrderStatus,
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
  };
}

export async function createOrder(userId: string, input: CreateOrderInput): Promise<SharedOrder> {
  if (input.tableId) {
    const table = await tableRepo.findTableById(input.tableId);
    if (!table) {
      throw AppError.notFound('Table');
    }
  }

  const orderItemsData: { menuItemId: string; quantity: number; priceAtOrder: number }[] = [];
  let calculatedTotal = 0;

  for (const itemInput of input.items) {
    const menuItem = await menuRepo.findMenuItemById(itemInput.menuItemId);
    if (!menuItem) {
      throw AppError.notFound(`Menu item (${itemInput.menuItemId})`);
    }

    if (!menuItem.available) {
      throw AppError.badRequest(
        `Menu item "${menuItem.name}" is currently unavailable`,
        'ITEM_UNAVAILABLE',
      );
    }

    const priceAtOrder = Number(menuItem.price);
    const itemTotal = priceAtOrder * itemInput.quantity;
    calculatedTotal += itemTotal;

    orderItemsData.push({
      menuItemId: itemInput.menuItemId,
      quantity: itemInput.quantity,
      priceAtOrder,
    });
  }

  const order = await orderRepo.createOrder({
    userId,
    tableId: input.tableId,
    status: 'placed',
    total: calculatedTotal,
    items: orderItemsData,
  });

  return toSharedOrder(order);
}

export async function updateOrderStatus(
  orderId: string,
  _currentUserId: string,
  _userRole: string,
  input: UpdateOrderStatusInput,
): Promise<SharedOrder> {
  const existing = await orderRepo.findOrderById(orderId);
  if (!existing) {
    throw AppError.notFound('Order');
  }

  const currentStatus = existing.status;
  const targetStatus = input.status as OrderStatus;

  if (currentStatus !== targetStatus) {
    const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(targetStatus) && targetStatus !== currentStatus) {
      throw AppError.badRequest(
        `Invalid status transition from "${currentStatus}" to "${targetStatus}". Allowed next statuses: ${allowedNextStatuses.join(', ') || 'none'}`,
        'INVALID_STATUS_TRANSITION',
      );
    }
  }

  const updated = await orderRepo.updateOrderStatus(orderId, targetStatus);
  return toSharedOrder(updated);
}

export async function cancelOrder(
  orderId: string,
  currentUserId: string,
  userRole: string,
): Promise<SharedOrder> {
  const existing = await orderRepo.findOrderById(orderId);
  if (!existing) {
    throw AppError.notFound('Order');
  }

  if (userRole === 'customer') {
    if (existing.userId !== currentUserId) {
      throw AppError.forbidden('You can only cancel your own orders');
    }

    if (existing.status !== 'placed') {
      throw AppError.badRequest(
        `Cannot cancel order with status "${existing.status}". Only orders with status "placed" can be cancelled.`,
        'CANNOT_CANCEL',
      );
    }
  }

  const updated = await orderRepo.updateOrderStatus(orderId, 'billed');
  return toSharedOrder(updated);
}

export async function getOrderById(
  orderId: string,
  currentUserId: string,
  userRole: string,
): Promise<SharedOrder> {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) {
    throw AppError.notFound('Order');
  }

  if (userRole === 'customer' && order.userId !== currentUserId) {
    throw AppError.forbidden('You can only view your own orders');
  }

  return toSharedOrder(order);
}

export async function listOrders(
  query: GetOrdersQuery,
  currentUserId: string,
  userRole: string,
) {
  const filterUserId = userRole === 'customer' ? currentUserId : query.userId;

  const startDateFilter = query.startDate ? new Date(query.startDate) : undefined;
  const endDateFilter = query.endDate ? new Date(query.endDate) : undefined;

  const total = await orderRepo.countOrders({
    userId: filterUserId,
    tableId: query.tableId,
    status: query.status as OrderStatus | undefined,
    startDate: startDateFilter,
    endDate: endDateFilter,
  });

  const paginationMeta = paginate({ page: query.page, limit: query.limit }, total);

  const orders = await orderRepo.findOrders({
    userId: filterUserId,
    tableId: query.tableId,
    status: query.status as OrderStatus | undefined,
    startDate: startDateFilter,
    endDate: endDateFilter,
    skip: paginationMeta.offset,
    take: paginationMeta.limit,
  });

  return {
    items: orders.map(toSharedOrder),
    pagination: {
      page: paginationMeta.page,
      limit: paginationMeta.limit,
      total: paginationMeta.total,
      totalPages: paginationMeta.totalPages,
    },
  };
}
