'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AIInsight } from '@/lib/types';
import {
  getAIInsights,
  getInventory,
  getOrders,
  getStaff,
  getReservations,
} from '@/lib/api';
import { evaluateOperationalInsights } from '@/lib/insights-utils';

export function useInsights() {
  const [insightsList, setInsightsList] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Fetch insights and operational data strictly through lib/api.ts
  const fetchInsightsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apiInsights, inventory, orders, staff, reservations] = await Promise.all([
        getAIInsights(),
        getInventory(),
        getOrders(),
        getStaff(),
        getReservations(),
      ]);

      // Derive operational rule insights from contract objects
      const derivedInsights = evaluateOperationalInsights(
        inventory,
        orders,
        staff,
        reservations
      );

      // Merge and deduplicate by title
      const combined = [...apiInsights, ...derivedInsights];
      const uniqueMap = new Map<string, AIInsight>();
      combined.forEach((item) => {
        if (!uniqueMap.has(item.title)) {
          uniqueMap.set(item.title, item);
        }
      });

      setInsightsList(Array.from(uniqueMap.values()));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load operational AI insights.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsightsData();
  }, [fetchInsightsData]);

  // Filtered Insights
  const filteredInsights = useMemo(() => {
    return insightsList.filter((item) => {
      // Category Filter
      if (categoryFilter !== 'all') {
        if (item.category.toUpperCase() !== categoryFilter.toUpperCase()) {
          return false;
        }
      }

      // Severity Filter
      if (severityFilter !== 'all') {
        if (item.impact.toUpperCase() !== severityFilter.toUpperCase()) {
          return false;
        }
      }

      return true;
    });
  }, [insightsList, categoryFilter, severityFilter]);

  // Derived Opportunities (e.g. MENU_OPTIMIZATION or REVENUE)
  const opportunities = useMemo(() => {
    return insightsList.filter(
      (item) => item.category === 'MENU_OPTIMIZATION' || item.category === 'REVENUE'
    );
  }, [insightsList]);

  return {
    insights: filteredInsights,
    allInsights: insightsList,
    opportunities,
    loading,
    error,
    categoryFilter,
    setCategoryFilter,
    severityFilter,
    setSeverityFilter,
    refreshInsights: fetchInsightsData,
  };
}
