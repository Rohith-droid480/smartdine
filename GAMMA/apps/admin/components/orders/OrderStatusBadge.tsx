import React from 'react';
import { OrderStatus } from '@/lib/types';
import { getOrderStatusBadgeClass, getOrderStatusLabel } from '@/lib/order-utils';
import { cn } from '@/lib/utils';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  const badgeStyle = getOrderStatusBadgeClass(status);
  const label = getOrderStatusLabel(status);

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
