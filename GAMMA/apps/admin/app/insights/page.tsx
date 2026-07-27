'use client';

import React, { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  InsightsToolbar,
  InsightCard,
  OpportunityCard,
} from '@/components/insights';
import { useInsights } from '@/hooks/useInsights';
import { Sparkles } from 'lucide-react';

export default function InsightsPage() {
  const {
    insights,
    allInsights,
    opportunities,
    loading,
    error,
    categoryFilter,
    setCategoryFilter,
    severityFilter,
    setSeverityFilter,
    refreshInsights,
  } = useInsights();

  // Compute category counts for filter tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allInsights.length,
      INVENTORY: 0,
      STAFFING: 0,
      MENU_OPTIMIZATION: 0,
      REVENUE: 0,
    };

    allInsights.forEach((item) => {
      const cat = item.category.toUpperCase();
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });

    return counts;
  }, [allInsights]);

  return (
    <DashboardLayout>
      <PageHeader
        title="AI Operational Insights & Decision Center"
        subtitle="Explainable risk alerts, inventory warnings, staffing recommendations, and revenue growth opportunities"
      />

      {/* Decision Intelligence Toolbar */}
      <InsightsToolbar
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        onRefresh={refreshInsights}
        isLoading={loading}
        totalResults={insights.length}
        categoryCounts={categoryCounts}
      />

      {/* Error View */}
      {error && !loading && (
        <ErrorState
          title="Failed to Load Operational Insights"
          message={error}
          onRetry={refreshInsights}
        />
      )}

      {/* Loading View */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton count={6} className="h-64 w-full" />
        </div>
      )}

      {/* Insights Grid Layout */}
      {!loading && insights.length > 0 && (
        <div className="space-y-8 animate-in fade-in">
          {/* Main Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>

          {/* Highlighted Upsell & Revenue Growth Opportunities */}
          {opportunities.length > 0 && categoryFilter === 'all' && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  High-Impact Revenue Opportunities
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {opportunities.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && insights.length === 0 && (
        <EmptyState
          icon={<Sparkles className="w-8 h-8" />}
          title="No Operational Insights Found"
          description="There are currently no active risk alerts or decision recommendations matching your filter selection."
          actionText="Reload Insights"
          onAction={refreshInsights}
        />
      )}
    </DashboardLayout>
  );
}
