'use client';

import React from 'react';
import { ALLOWED_INSIGHT_CATEGORIES, getInsightCategoryLabel } from '@/lib/insights-utils';
import { cn } from '@/lib/utils';

export interface InsightsFiltersProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export const InsightsFilters: React.FC<InsightsFiltersProps> = ({
  currentCategory,
  onCategoryChange,
  categoryCounts,
}) => {
  const options = ['all', ...ALLOWED_INSIGHT_CATEGORIES];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {options.map((cat) => {
        const isSelected = currentCategory === cat;
        const label = cat === 'all' ? 'All Insights' : getInsightCategoryLabel(cat);
        const count = categoryCounts ? categoryCounts[cat] ?? 0 : null;

        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
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
