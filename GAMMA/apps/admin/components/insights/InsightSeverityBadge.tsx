import React from 'react';
import { InsightImpact } from '@/lib/types';
import { getInsightSeverityBadgeClass, getInsightSeverityLabel } from '@/lib/insights-utils';
import { cn } from '@/lib/utils';

export interface InsightSeverityBadgeProps {
  impact: InsightImpact | string;
  className?: string;
}

export const InsightSeverityBadge: React.FC<InsightSeverityBadgeProps> = ({
  impact,
  className,
}) => {
  const badgeStyle = getInsightSeverityBadgeClass(impact);
  const label = getInsightSeverityLabel(impact);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase',
        badgeStyle,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      <span>{label}</span>
    </span>
  );
};
