'use client';

import React from 'react';
import { RefreshCw, Filter, Sparkles } from 'lucide-react';
import { InsightsFilters } from './InsightsFilters';
import { ALLOWED_INSIGHT_IMPACTS, getInsightSeverityLabel } from '@/lib/insights-utils';

export interface InsightsToolbarProps {
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (severity: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalResults: number;
  categoryCounts?: Record<string, number>;
}

export const InsightsToolbar: React.FC<InsightsToolbarProps> = ({
  categoryFilter,
  onCategoryFilterChange,
  severityFilter,
  onSeverityFilterChange,
  onRefresh,
  isLoading,
  totalResults,
  categoryCounts,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-6">
      {/* Action Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Operational Decision Intelligence Engine
          </span>
        </div>

        {/* Severity Selector & Refresh Button */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {/* Severity Selector Dropdown */}
          <div className="relative flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden xs:block" />
            <select
              value={severityFilter}
              onChange={(e) => onSeverityFilterChange(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-950/60 border border-slate-700/60 text-slate-200 rounded-xl focus:outline-none focus:border-brand-500 transition-all cursor-pointer font-semibold"
            >
              <option value="all">All Severities</option>
              {ALLOWED_INSIGHT_IMPACTS.map((impact) => (
                <option key={impact} value={impact}>
                  {getInsightSeverityLabel(impact)}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            <strong className="text-slate-200">{totalResults}</strong> {totalResults === 1 ? 'insight' : 'insights'}
          </span>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all disabled:opacity-50"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pt-2 border-t border-slate-800/60">
        <InsightsFilters
          currentCategory={categoryFilter}
          onCategoryChange={onCategoryFilterChange}
          categoryCounts={categoryCounts}
        />
      </div>
    </div>
  );
};
