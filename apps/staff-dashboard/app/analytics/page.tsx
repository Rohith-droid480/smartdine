'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  KPIGrid,
  AnalyticsToolbar,
  RevenueTrendChart,
  OrdersTrendChart,
  PeakHoursChart,
  TopItemsChart,
  OperationsPlanningWorkspace,
} from '@/components/analytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const {
    salesAnalytics,
    topItems,
    peakHours,
    loading,
    error,
    periodFilter,
    setPeriodFilter,
    metricType,
    setMetricType,
    refreshAnalytics,
  } = useAnalytics();

  const showRevenue = metricType === 'all' || metricType === 'revenue';
  const showOrders = metricType === 'all' || metricType === 'orders';

  return (
    <DashboardLayout>
      <PageHeader
        title="Sales & Revenue Analytics"
        subtitle="Historical revenue trends, order volume distribution, peak hours, and top seller breakdown"
      />

      {/* Analytics Toolbar */}
      <AnalyticsToolbar
        periodFilter={periodFilter}
        onPeriodFilterChange={setPeriodFilter}
        metricType={metricType}
        onMetricTypeChange={setMetricType}
        onRefresh={refreshAnalytics}
        isLoading={loading}
      />

      {/* Error View */}
      {error && !loading && (
        <ErrorState
          title="Failed to Load Analytics Metrics"
          message={error}
          onRetry={refreshAnalytics}
        />
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <LoadingSkeleton count={4} className="h-28 w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoadingSkeleton className="h-80 w-full" />
            <LoadingSkeleton className="h-80 w-full" />
          </div>
        </div>
      )}

      {/* Main Analytics Charts Layout */}
      {!loading && salesAnalytics && (
        <div className="space-y-8 animate-in fade-in">
          {/* Shift Operations Planning Workspace */}
          <OperationsPlanningWorkspace />

          {/* KPI Summary Row */}
          <KPIGrid salesAnalytics={salesAnalytics} />

          {/* Primary Trends Section (2 Column) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {showRevenue && <RevenueTrendChart data={salesAnalytics.salesByDate} />}
            {showOrders && <OrdersTrendChart data={salesAnalytics.salesByDate} />}
          </div>

          {/* Secondary Analytics Section (Peak Hours & Top Selling Dishes) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PeakHoursChart data={peakHours} />
            <TopItemsChart topItems={topItems} />
          </div>
        </div>
      )}

      {/* Fallback Empty State */}
      {!loading && !error && !salesAnalytics && (
        <EmptyState
          icon={<TrendingUp className="w-8 h-8" />}
          title="No Analytics Data Available"
          description="There are currently no sales analytics records for the selected period."
          actionText="Reload Analytics"
          onAction={refreshAnalytics}
        />
      )}
    </DashboardLayout>
  );
}
