'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface AnalyticsFiltersProps {
  currentFilter: string;
  onFilterChange: (metric: string) => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const options = [
    { id: 'all', label: 'All Operations' },
    { id: 'revenue', label: 'Revenue Focus' },
    { id: 'orders', label: 'Order Volume' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {options.map((opt) => {
        const isSelected = currentFilter === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => onFilterChange(opt.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
              isSelected
                ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 shadow-glow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            )}
          >
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
