'use client';

import React, { useEffect } from 'react';
import { X, Utensils, Clock, User as UserIcon, DollarSign, Calendar } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusMenu } from './OrderStatusMenu';
import { formatOrderCurrency, formatOrderTime } from '@/lib/order-utils';

export interface OrderDetailsDrawerProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  isUpdating?: boolean;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  order,
  onClose,
  onUpdateStatus,
  isUpdating = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (order) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Order details for order ${order.id}`}
        className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-mono font-bold text-white">Order #{order.id}</h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Order Details & Item Summary</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close Order Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Status Management Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Update Status
              </span>
              <p className="text-xs text-slate-300 font-medium">Advance order to next kitchen stage</p>
            </div>
            <OrderStatusMenu
              currentStatus={order.status}
              onUpdateStatus={(newStatus) => onUpdateStatus(order.id, newStatus)}
              isUpdating={isUpdating}
            />
          </div>

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <UserIcon className="w-3.5 h-3.5 text-brand-400" />
                <span>Customer</span>
              </div>
              <p className="text-sm font-semibold text-white">{order.customerName || 'Walk-in Guest'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Utensils className="w-3.5 h-3.5 text-blue-400" />
                <span>Table / Type</span>
              </div>
              <p className="text-sm font-semibold text-white">
                {order.tableNumber ? `Table ${order.tableNumber}` : order.type}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Order Time</span>
              </div>
              <p className="text-sm font-semibold text-white">{formatOrderTime(order.createdAt)}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Amount</span>
              </div>
              <p className="text-sm font-bold text-emerald-400">
                {formatOrderCurrency(order.totalAmount)}
              </p>
            </div>
          </div>

          {/* Itemized Order List */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Ordered Items ({order.items.length})
            </h3>

            <div className="rounded-xl border border-slate-800/80 overflow-hidden bg-slate-950/40">
              <div className="divide-y divide-slate-800/60">
                {order.items.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-brand-500/20 text-brand-400 text-xs font-bold flex items-center justify-center border border-brand-500/30">
                          {item.quantity}x
                        </span>
                        <span className="text-xs font-bold text-white">{item.name}</span>
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-amber-300/80 italic mt-1 pl-8">
                          Note: "{item.notes}"
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-200">
                        {formatOrderCurrency(item.unitPrice * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-slate-500">
                          {formatOrderCurrency(item.unitPrice)} each
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total Charged</span>
          <span className="text-lg font-extrabold text-emerald-400">
            {formatOrderCurrency(order.totalAmount)}
          </span>
        </div>
      </aside>
    </>
  );
};
