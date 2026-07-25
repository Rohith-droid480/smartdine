import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
}) => {
  return (
    <div
      className={clsx(
        'animate-shimmer rounded-xl bg-slate-800/80',
        variant === 'circle' && 'rounded-full',
        variant === 'card' && 'h-48 w-full',
        variant === 'text' && 'h-4 w-full',
        className
      )}
    />
  );
};
