import React from 'react';
import { cn } from '@/lib/utils';

export interface MetricChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const MetricChartCard: React.FC<MetricChartCardProps> = ({
  title,
  subtitle,
  badge,
  action,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {action && <div>{action}</div>}
      </div>

      <div className="flex-1 w-full min-h-[260px]">{children}</div>
    </div>
  );
};
