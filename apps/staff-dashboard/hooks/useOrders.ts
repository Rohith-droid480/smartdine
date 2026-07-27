'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Order, OrderStatus } from '@/lib/types';
import { getOrders, updateOrderStatus } from '@/lib/api';
import { normalizeOrderStatus, sortOrdersByDate } from '@/lib/order-utils';

export interface NewOrderAlertInfo {
  id: string;
  tableNumber?: string | number;
  total: number;
  customerName?: string;
  itemCount: number;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [latestAlert, setLatestAlert] = useState<NewOrderAlertInfo | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const prevOrderCountRef = useRef<number>(0);

  const playNotificationChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio autoplay restrictions catch
    }
  }, []);

  // Silent background fetch for real-time live synchronization
  const fetchOrders = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await getOrders();
      const sorted = sortOrdersByDate(data, 'desc');

      // Check if a new customer order landed in real-time
      if (!isInitial && prevOrderCountRef.current > 0 && sorted.length > prevOrderCountRef.current) {
        const newest = sorted[0];
        if (newest) {
          playNotificationChime();
          setLatestAlert({
            id: newest.id,
            tableNumber: newest.tableNumber || 4,
            total: newest.totalAmount || (newest as any).total || 0,
            customerName: newest.customerName || 'Dining Customer',
            itemCount: newest.items?.length || 1,
          });
        }
      }

      prevOrderCountRef.current = sorted.length;
      setOrders(sorted);
      setError(null);
    } catch (err: unknown) {
      if (isInitial) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch orders list.');
        }
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [playNotificationChime]);

  useEffect(() => {
    fetchOrders(true);

    // High-frequency 3-second live sync polling interval
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 3000);

    return () => clearInterval(interval);
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
    latestAlert,
    dismissAlert: () => setLatestAlert(null),
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedOrder,
    setSelectedOrder,
    refreshOrders: () => fetchOrders(true),
    updateStatus: handleUpdateStatus,
  };
}
