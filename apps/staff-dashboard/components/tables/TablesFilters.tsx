'use client';

import React from 'react';
import { ALLOWED_TABLE_STATUSES, getTableStatusLabel, TableStatus } from '@/lib/table-utils';
import { cn } from '@/lib/utils';

export interface TablesFiltersProps {
  currentFilter: string;
  onFilterChange: (status: string) => void;
  counts?: Record<string, number>;
}

export const TablesFilters: React.FC<TablesFiltersProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const filterOptions = ['all', ...ALLOWED_TABLE_STATUSES];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {filterOptions.map((filter) => {
        const isSelected = currentFilter === filter;
        const label = filter === 'all' ? 'All Tables' : getTableStatusLabel(filter as TableStatus);
        const count = counts ? counts[filter] ?? 0 : null;

        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
              isSelected
                ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 shadow-glow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            )}
          >
            <span>{label}</span>
            {count !== null && (
              <span
                className={cn(
                  'px-1.5 py-0.2 text-[10px] font-bold rounded-full',
                  isSelected ? 'bg-brand-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
