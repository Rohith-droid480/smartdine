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
import { normalizeOrderStatus } from '@/lib/order-utils';

export default function OrdersPage() {
  const {
    orders,
    allOrders,
    loading,
    error,
    updatingOrderId,
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
