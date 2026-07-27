'use client';

import React from 'react';
import { MetricChartCard } from './MetricChartCard';
import { TopItemData, formatAnalyticsCurrency } from '@/lib/analytics-utils';
import { Utensils } from 'lucide-react';

export interface TopItemsChartProps {
  topItems: TopItemData[];
}

export const TopItemsChart: React.FC<TopItemsChartProps> = ({ topItems }) => {
  const maxRevenue = Math.max(...topItems.map((i) => i.revenue), 1);

  return (
    <MetricChartCard
      title="Top-Performing Menu Items"
      subtitle="Highest revenue generating dishes from customer orders"
      badge="Top Sellers"
    >
      <div className="space-y-4 pt-1">
        {topItems.map((item, idx) => {
          const percentage = Math.round((item.revenue / maxRevenue) * 100);

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-5 h-5 rounded-md bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-brand-500/30">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-100 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <span className="text-slate-400">{item.quantity} sold</span>
                  <span className="font-extrabold text-emerald-400">
                    {formatAnalyticsCurrency(item.revenue)}
                  </span>
                </div>
              </div>

              {/* Progress Fill Bar */}
              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-500 shadow-glow-sm"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </MetricChartCard>
  );
};
