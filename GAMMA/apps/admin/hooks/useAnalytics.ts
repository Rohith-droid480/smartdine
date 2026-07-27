'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SalesAnalytics, Order } from '@/lib/types';
import { getSalesAnalytics, getOrders } from '@/lib/api';
import {
  deriveTopItemsFromOrders,
  derivePeakHoursFromOrders,
  TopItemData,
  PeakHourData,
} from '@/lib/analytics-utils';

export function useAnalytics() {
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [periodFilter, setPeriodFilter] = useState<string>('7d');
  const [metricType, setMetricType] = useState<string>('all');

  // Fetch analytics & order data strictly through api.ts
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, ordersData] = await Promise.all([
        getSalesAnalytics(),
        getOrders(),
      ]);
      setSalesAnalytics(analyticsData);
      setOrders(ordersData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch analytics metrics.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Derived Top Items
  const topItems: TopItemData[] = useMemo(() => {
    return deriveTopItemsFromOrders(orders, 5);
  }, [orders]);

  // Derived Peak Hours
  const peakHours: PeakHourData[] = useMemo(() => {
    return derivePeakHoursFromOrders(orders);
  }, [orders]);

  return {
    salesAnalytics,
    orders,
    topItems,
    peakHours,
    loading,
    error,
    periodFilter,
    setPeriodFilter,
    metricType,
    setMetricType,
    refreshAnalytics: fetchAnalyticsData,
  };
}
