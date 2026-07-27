'use client';

import React from 'react';
import { Search, RefreshCw, X, Filter } from 'lucide-react';
import { TablesFilters } from './TablesFilters';

export interface TablesToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  capacityFilter: string;
  onCapacityFilterChange: (capacity: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalResults: number;
  statusCounts?: Record<string, number>;
}

export const TablesToolbar: React.FC<TablesToolbarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  capacityFilter,
  onCapacityFilterChange,
  onRefresh,
  isLoading,
  totalResults,
  statusCounts,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-6">
      {/* Search Input & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search table # or guest name..."
            className="w-full pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-400 bg-slate-950/60 rounded-xl border border-slate-700/60 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Capacity Filter Dropdown & Refresh Button */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {/* Capacity Selector */}
          <div className="relative flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden xs:block" />
            <select
              value={capacityFilter}
              onChange={(e) => onCapacityFilterChange(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-950/60 border border-slate-700/60 text-slate-200 rounded-xl focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="all">All Capacities</option>
              <option value="2">2 Seats</option>
              <option value="4">4 Seats</option>
              <option value="6">6 Seats</option>
              <option value="8+">8+ Seats</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            <strong className="text-slate-200">{totalResults}</strong> {totalResults === 1 ? 'table' : 'tables'}
          </span>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all disabled:opacity-50"
            title="Refresh Tables"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pt-2 border-t border-slate-800/60">
        <TablesFilters
          currentFilter={statusFilter}
          onFilterChange={onStatusFilterChange}
          counts={statusCounts}
        />
      </div>
    </div>
  );
};
