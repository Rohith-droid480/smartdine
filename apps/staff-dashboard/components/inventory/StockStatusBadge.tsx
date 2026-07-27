import React from 'react';
import { StockStatus } from '@/lib/types';
import { getStockStatusBadgeClass, getStockStatusLabel } from '@/lib/inventory-utils';
import { cn } from '@/lib/utils';

export interface StockStatusBadgeProps {
  status: StockStatus | string;
  className?: string;
}

export const StockStatusBadge: React.FC<StockStatusBadgeProps> = ({ status, className }) => {
  const badgeStyle = getStockStatusBadgeClass(status);
  const label = getStockStatusLabel(status);

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
