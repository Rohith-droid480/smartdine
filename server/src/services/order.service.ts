// =============================================================================
// server/src/services/order.service.ts
// Order business logic with real-time inventory depletion and table status sync.
// =============================================================================

import { AppError } from '../utils/AppError';
import * as orderRepo from '../repositories/order.repository';
import * as menuRepo from '../repositories/menu.repository';
import * as tableRepo from '../repositories/table.repository';
import * as inventoryRepo from '../repositories/inventory.repository';
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
    items: (order.items || []).map((i: any) => ({
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      priceAtOrder: Number(i.priceAtOrder || 0),
    })),
    status: order.status as OrderStatus,
    total: Number(order.total || 0),
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date().toISOString(),
  };
}

export async function createOrder(userId: string, input: CreateOrderInput): Promise<SharedOrder> {
  // Requirement 4: Table State Realism
  if (input.tableId) {
    const table = await tableRepo.findTableById(input.tableId);
    if (!table) {
      throw AppError.notFound('Table');
    }
    // Flip table status to occupied when dine-in order is placed
    await tableRepo.updateTable(input.tableId, { status: 'occupied' });
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
        `Menu item "${menuItem.name}" is currently unavailable / sold out`,
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

    // Requirement 3: Inventory Realism (Auto-deplete stock in DB)
    try {
      const firstWord = menuItem.name.split(' ')[0] || menuItem.name;
      const matchingInventory = await inventoryRepo.findInventoryItemByName(firstWord);

      if (matchingInventory) {
        const newQty = Math.max(0, Number(matchingInventory.quantity) - itemInput.quantity * 0.25);
        await inventoryRepo.updateInventoryItem(matchingInventory.id, { quantity: newQty });

        // If inventory reaches zero, set menu item to unavailable
        if (newQty <= 0) {
          await menuRepo.updateMenuItem(menuItem.id, { available: false });
        }
      }
    } catch {
      // Silently ignore optional inventory sync fallback errors
    }
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

  // Requirement 2: Status Lifecycle Validation
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

  // Requirement 4: Free up table when order status advances to billed
  if (targetStatus === 'billed' && existing.tableId) {
    try {
      await tableRepo.updateTable(existing.tableId, { status: 'free' });
    } catch {
      // Silently handle table update fallback
    }
  }

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

  if (existing.tableId) {
    try {
      await tableRepo.updateTable(existing.tableId, { status: 'free' });
    } catch {
      // Silently ignore fallback error
    }
  }

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
