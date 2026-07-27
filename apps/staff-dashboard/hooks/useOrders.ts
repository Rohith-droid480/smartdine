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

  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Web Audio API on first user gesture
  useEffect(() => {
    const handleFirstGesture = () => {
      try {
        if (!audioCtxRef.current) {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            audioCtxRef.current = new AudioCtx();
          }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      } catch {
        // Autoplay policy catch
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: false });
    window.addEventListener('keydown', handleFirstGesture, { once: false });
    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  // Loud, high-volume multi-tone restaurant kitchen bell sound
  const playNotificationChime = useCallback(() => {
    try {
      let ctx = audioCtxRef.current;
      if (!ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        ctx = new AudioCtx();
        audioCtxRef.current = ctx;
      }
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      
      // Ring 1: High C (1046 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now);
      gain1.gain.setValueAtTime(0.8, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Ring 2: High E (1318 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, now + 0.15);
      gain2.gain.setValueAtTime(0.9, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.45);

      // Ring 3: High G (1568 Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1567.98, now + 0.3);
      gain3.gain.setValueAtTime(1.0, now + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.3);
      osc3.stop(now + 0.6);

      // Ring 4: Crescendo High C5 (2093 Hz) - Loudest Peak
      const osc4 = ctx.createOscillator();
      const gain4 = ctx.createGain();
      osc4.type = 'sine';
      osc4.frequency.setValueAtTime(2093.0, now + 0.45);
      gain4.gain.setValueAtTime(1.0, now + 0.45);
      gain4.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc4.connect(gain4);
      gain4.connect(ctx.destination);
      osc4.start(now + 0.45);
      osc4.stop(now + 0.8);

    } catch {
      // Catch silent audio errors
    }
  }, []);

  // Silent background fetch for real-time live synchronization
  const fetchOrders = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await getOrders();
      const sorted = sortOrdersByDate(data, 'desc');

      // Detect any newly created order ID
      if (isInitializedRef.current) {
        for (const o of sorted) {
          if (!knownOrderIdsRef.current.has(o.id)) {
            // Found a brand new order created live by customer!
            playNotificationChime();
            setLatestAlert({
              id: o.id,
              tableNumber: o.tableNumber || 4,
              total: o.totalAmount || (o as any).total || 0,
              customerName: o.customerName || 'Dining Customer',
              itemCount: o.items?.length || 1,
            });
            break;
          }
        }
      }

      // Update known order IDs set
      const newIdSet = new Set<string>();
      sorted.forEach((o) => newIdSet.add(o.id));
      knownOrderIdsRef.current = newIdSet;
      isInitializedRef.current = true;

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
