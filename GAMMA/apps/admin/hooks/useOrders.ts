'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Order, OrderStatus } from '@/lib/types';
import { getOrders, updateOrderStatus } from '@/lib/api';
import { normalizeOrderStatus, sortOrdersByDate } from '@/lib/order-utils';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders from lib/api.ts
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      const sorted = sortOrdersByDate(data, 'desc');
      setOrders(sorted);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch orders list.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update order status with Optimistic UI update
  const handleUpdateStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      setUpdatingOrderId(orderId);

      // Save previous state for potential rollback
      const previousOrders = [...orders];

      // Perform Optimistic State Update
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return order;
        })
      );

      // Also update selectedOrder if it's currently open in drawer
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      try {
        // Call api.updateOrderStatus strictly via lib/api.ts
        const updated = await updateOrderStatus(orderId, newStatus);
        
        // Sync state with returned API object
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updated : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
      } catch (err: unknown) {
        // Rollback state on failure
        setOrders(previousOrders);
        const errMessage = err instanceof Error ? err.message : 'Failed to update order status.';
        setError(`Failed to update status for order ${orderId}: ${errMessage}`);
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [orders, selectedOrder]
  );

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all') {
        const normalizedCurrent = normalizeOrderStatus(order.status);
        const normalizedTarget = normalizeOrderStatus(statusFilter as OrderStatus);
        if (normalizedCurrent !== normalizedTarget) {
          return false;
        }
      }

      // Search filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesCustomer = order.customerName?.toLowerCase().includes(query) || false;
        const matchesTable = order.tableNumber ? String(order.tableNumber).includes(query) : false;
        const matchesItem = order.items.some((i) => i.name.toLowerCase().includes(query));

        return matchesId || matchesCustomer || matchesTable || matchesItem;
      }

      return true;
    });
  }, [orders, statusFilter, searchTerm]);

  return {
    orders: filteredOrders,
    allOrders: orders,
    loading,
    error,
    updatingOrderId,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedOrder,
    setSelectedOrder,
    refreshOrders: fetchOrders,
    updateStatus: handleUpdateStatus,
  };
}
