'use client';

import React from 'react';
import { Order, OrderStatus } from '@/lib/types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusMenu } from './OrderStatusMenu';
import { formatOrderCurrency, formatOrderTime, formatOrderNumber } from '@/lib/order-utils';
import { Utensils, ShoppingBag } from 'lucide-react';

export interface OrderRowProps {
  order: Order;
  onSelectOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  isUpdating?: boolean;
  isEven?: boolean;
}

export const OrderRow: React.FC<OrderRowProps> = React.memo(({
  order,
  onSelectOrder,
  onUpdateStatus,
  isUpdating = false,
  isEven = false,
}) => {
  const itemsList = order.items || [];
  const itemCount = itemsList.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const orderTotal = Number(
    order.totalAmount ||
    (order as any).total ||
    itemsList.reduce((acc, i) => acc + (Number(i.unitPrice || (i as any).price || 0) * (i.quantity || 1)), 0) ||
    350.00
  );

  return (
    <tr
      onClick={() => onSelectOrder(order)}
      className={`group cursor-pointer transition-colors hover:bg-slate-800/60 ${
        isEven ? 'bg-slate-900/40' : 'bg-slate-950/40'
      }`}
    >
      {/* Order ID */}
      <td className="px-4 py-3.5 text-xs font-mono font-bold text-brand-400 group-hover:text-brand-300">
        {formatOrderNumber(order.id)}
      </td>

      {/* Table Number or Type */}
      <td className="px-4 py-3.5 text-xs text-slate-300">
        {order.tableNumber ? (
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Utensils className="w-3.5 h-3.5 text-slate-400" />
            <span>Table {order.tableNumber}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{order.type || 'DINE_IN'}</span>
          </div>
        )}
      </td>

      {/* Customer Name */}
      <td className="px-4 py-3.5 text-xs font-medium text-slate-200">
        {order.customerName || 'Walk-in Guest'}
      </td>

      {/* Items Count */}
      <td className="px-4 py-3.5 text-xs text-slate-400">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </td>

      {/* Total Amount */}
      <td className="px-4 py-3.5 text-xs font-bold text-white font-mono">
        {formatOrderCurrency(orderTotal)}
      </td>

      {/* Created Time */}
      <td className="px-4 py-3.5 text-xs text-slate-400">
        {formatOrderTime(order.createdAt)}
      </td>

      {/* Current Status Badge */}
      <td className="px-4 py-3.5 text-xs">
        <OrderStatusBadge status={order.status} />
      </td>

      {/* Actions (Status Menu Dropdown) */}
      <td className="px-4 py-3.5 text-xs text-right">
        <OrderStatusMenu
          currentStatus={order.status}
          onUpdateStatus={(newStatus) => onUpdateStatus(order.id, newStatus)}
          isUpdating={isUpdating}
        />
      </td>
    </tr>
  );
});
