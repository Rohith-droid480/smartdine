import React from 'react';
import { TableStatus, getTableStatusBadgeClass, getTableStatusLabel } from '@/lib/table-utils';
import { cn } from '@/lib/utils';

export interface TableStatusBadgeProps {
  status: TableStatus;
  className?: string;
}

export const TableStatusBadge: React.FC<TableStatusBadgeProps> = ({ status, className }) => {
  const badgeStyle = getTableStatusBadgeClass(status);
  const label = getTableStatusLabel(status);

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
