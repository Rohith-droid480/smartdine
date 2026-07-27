'use client';

import React from 'react';
import { Search, RefreshCw, X } from 'lucide-react';
import { OrdersFilters } from './OrdersFilters';

export interface OrdersToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalResults: number;
  statusCounts?: Record<string, number>;
}

export const OrdersToolbar: React.FC<OrdersToolbarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  isLoading,
  totalResults,
  statusCounts,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-6">
      {/* Top Search Bar & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order #, customer, table..."
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

        {/* Action Controls & Result Count */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-200">{totalResults}</strong> {totalResults === 1 ? 'order' : 'orders'}
          </span>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all disabled:opacity-50"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pt-2 border-t border-slate-800/60">
        <OrdersFilters
          currentFilter={statusFilter}
          onFilterChange={onStatusFilterChange}
          counts={statusCounts}
        />
      </div>
    </div>
  );
};
