import React from 'react';
import { ShiftStatus } from '@/lib/types';
import { getShiftStatusBadgeClass, getShiftStatusLabel } from '@/lib/staff-utils';
import { cn } from '@/lib/utils';

export interface StaffStatusBadgeProps {
  status: ShiftStatus | string;
  className?: string;
}

export const StaffStatusBadge: React.FC<StaffStatusBadgeProps> = ({ status, className }) => {
  const badgeStyle = getShiftStatusBadgeClass(status);
  const label = getShiftStatusLabel(status);

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
