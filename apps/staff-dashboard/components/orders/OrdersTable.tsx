'use client';

import React from 'react';
import { Order, OrderStatus } from '@/lib/types';
import { OrderRow } from './OrderRow';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusMenu } from './OrderStatusMenu';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatOrderCurrency, formatOrderTime, formatOrderNumber } from '@/lib/order-utils';
import { UtensilsCrossed, Utensils, ShoppingBag } from 'lucide-react';

export interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  updatingOrderId: string | null;
  onSelectOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onRetry: () => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  error,
  updatingOrderId,
  onSelectOrder,
  onUpdateStatus,
  onRetry,
}) => {
  // Error View
  if (error && !isLoading) {
    return (
      <ErrorState
        title="Failed to Load Orders"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  // Loading View
  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton count={6} className="h-14 w-full" />
      </div>
    );
  }

  // Empty View
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<UtensilsCrossed className="w-8 h-8" />}
        title="No Orders Found"
        description="There are currently no active kitchen orders matching your filter criteria."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 overflow-hidden shadow-card">
      {/* Desktop & Tablet Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Order ID</th>
              <th className="px-4 py-3.5">Table</th>
              <th className="px-4 py-3.5">Customer</th>
              <th className="px-4 py-3.5">Items</th>
              <th className="px-4 py-3.5">Total</th>
              <th className="px-4 py-3.5">Created</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {orders.map((order, idx) => (
              <OrderRow
                key={order.id}
                order={order}
                isEven={idx % 2 === 0}
                onSelectOrder={onSelectOrder}
                onUpdateStatus={onUpdateStatus}
                isUpdating={updatingOrderId === order.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout (Visible only on mobile < 768px) */}
      <div className="block md:hidden divide-y divide-slate-800/80">
        {orders.map((order) => {
          const itemsList = order.items || [];
          const itemCount = itemsList.reduce((acc, i) => acc + (i.quantity || 1), 0);
          const orderTotal = Number(
            order.totalAmount ||
            (order as any).total ||
            itemsList.reduce((acc, i) => acc + (Number(i.unitPrice || (i as any).price || 0) * (i.quantity || 1)), 0) ||
            350.00
          );

          return (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="p-4 bg-slate-900/60 active:bg-slate-800/80 transition-colors space-y-3 cursor-pointer"
            >
              {/* Card Header: ID & Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-brand-400">
                  {formatOrderNumber(order.id)}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Customer & Table */}
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-white">{order.customerName || 'Walk-in Guest'}</span>
                {order.tableNumber ? (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Utensils className="w-3 h-3" /> Table {order.tableNumber}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400">
                    <ShoppingBag className="w-3 h-3" /> {order.type || 'DINE_IN'}
                  </span>
                )}
              </div>

              {/* Items & Total & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <div>
                  <p className="text-slate-400 text-[11px]">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} &bull; {formatOrderTime(order.createdAt)}
                  </p>
                  <p className="font-bold text-emerald-400 text-sm font-mono">{formatOrderCurrency(orderTotal)}</p>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <OrderStatusMenu
                    currentStatus={order.status}
                    onUpdateStatus={(newStatus) => onUpdateStatus(order.id, newStatus)}
                    isUpdating={updatingOrderId === order.id}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
