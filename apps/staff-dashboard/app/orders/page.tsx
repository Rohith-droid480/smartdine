'use client';

import React, { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  OrdersToolbar,
  OrdersTable,
  OrderDetailsDrawer,
} from '@/components/orders';
import { useOrders } from '@/hooks/useOrders';
import { normalizeOrderStatus, formatOrderCurrency } from '@/lib/order-utils';
import { Bell, X } from 'lucide-react';

export default function OrdersPage() {
  const {
    orders,
    allOrders,
    loading,
    error,
    updatingOrderId,
    latestAlert,
    dismissAlert,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedOrder,
    setSelectedOrder,
    refreshOrders,
    updateStatus,
  } = useOrders();

  // Compute status counts for filter tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allOrders.length,
      placed: 0,
      preparing: 0,
      ready: 0,
      served: 0,
      billed: 0,
    };

    allOrders.forEach((o) => {
      const norm = normalizeOrderStatus(o.status);
      if (counts[norm] !== undefined) {
        counts[norm]++;
      }
    });

    return counts;
  }, [allOrders]);

  return (
    <DashboardLayout>
      {/* Real-time Order Arrival Banner Notification */}
      {latestAlert && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full rounded-2xl bg-amber-500 text-slate-950 p-4 shadow-2xl border border-amber-300 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-slate-950 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs uppercase tracking-wider bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full">
                  LIVE KITCHEN TICKET
                </span>
                <span className="text-[10px] font-bold opacity-80 font-mono">
                  Table #{latestAlert.tableNumber}
                </span>
              </div>
              <p className="text-xs font-black mt-1">
                New Order #{latestAlert.id.substring(0, 8)} ({latestAlert.itemCount} items) — {formatOrderCurrency(latestAlert.total)}
              </p>
            </div>
          </div>
          <button
            onClick={dismissAlert}
            className="p-1 hover:bg-slate-950/20 rounded-lg transition-colors font-bold text-slate-950"
            aria-label="Dismiss Alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <PageHeader
        title="Live Orders Management"
        subtitle="Real-time kitchen dispatch board, order status updates, and guest tickets"
      />

      {/* Operations Toolbar */}
      <OrdersToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={refreshOrders}
        isLoading={loading}
        totalResults={orders.length}
        statusCounts={statusCounts}
      />

      {/* Orders Data Table / Mobile Card Grid */}
      <OrdersTable
        orders={orders}
        isLoading={loading}
        error={error}
        updatingOrderId={updatingOrderId}
        onSelectOrder={(order) => setSelectedOrder(order)}
        onUpdateStatus={updateStatus}
        onRetry={refreshOrders}
      />

      {/* Order Inspection Side Drawer */}
      <OrderDetailsDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={updateStatus}
        isUpdating={updatingOrderId === (selectedOrder?.id ?? '')}
      />
    </DashboardLayout>
  );
}
