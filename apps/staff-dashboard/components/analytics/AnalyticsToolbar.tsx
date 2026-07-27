'use client';

import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { AnalyticsFilters } from './AnalyticsFilters';

export interface AnalyticsToolbarProps {
  periodFilter: string;
  onPeriodFilterChange: (period: string) => void;
  metricType: string;
  onMetricTypeChange: (metric: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const AnalyticsToolbar: React.FC<AnalyticsToolbarProps> = ({
  periodFilter,
  onPeriodFilterChange,
  metricType,
  onMetricTypeChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-6">
      {/* Date Range Selector & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Reporting Period:
          </span>
          <select
            value={periodFilter}
            onChange={(e) => onPeriodFilterChange(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-950/60 border border-slate-700/60 text-slate-200 rounded-xl focus:outline-none focus:border-brand-500 transition-all cursor-pointer font-semibold"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all disabled:opacity-50"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics Data</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="pt-2 border-t border-slate-800/60">
        <AnalyticsFilters currentFilter={metricType} onFilterChange={onMetricTypeChange} />
      </div>
    </div>
  );
};
