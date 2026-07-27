import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = true,
  glass = true,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-2xl p-5 border overflow-hidden transition-all duration-300',
        glass ? 'glass-card' : 'bg-slate-900 border-slate-800',
        hoverEffect && 'hover:-translate-y-1 hover:shadow-glow-amber',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
