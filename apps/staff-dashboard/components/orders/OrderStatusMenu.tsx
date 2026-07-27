'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Loader2, Check } from 'lucide-react';
import { OrderStatus } from '@/lib/types';
import { ALLOWED_ORDER_STATUSES, getOrderStatusLabel, normalizeOrderStatus } from '@/lib/order-utils';
import { cn } from '@/lib/utils';

export interface OrderStatusMenuProps {
  currentStatus: OrderStatus;
  onUpdateStatus: (newStatus: OrderStatus) => void;
  isUpdating?: boolean;
}

export const OrderStatusMenu: React.FC<OrderStatusMenuProps> = ({
  currentStatus,
  onUpdateStatus,
  isUpdating = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const normalizedCurrent = normalizeOrderStatus(currentStatus);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (status: OrderStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (status !== normalizedCurrent) {
      onUpdateStatus(status);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={isUpdating}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-700/80 bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 hover:text-white transition-all disabled:opacity-50',
          isOpen && 'ring-2 ring-brand-500/50 border-brand-500'
        )}
      >
        {isUpdating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
        ) : (
          <span>Update Status</span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Advance Order Status
          </div>
          {ALLOWED_ORDER_STATUSES.map((status) => {
            const isSelected = status === normalizedCurrent;
            return (
              <button
                key={status}
                onClick={(e) => handleSelect(status, e)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors',
                  isSelected
                    ? 'bg-brand-500/10 text-brand-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <span>{getOrderStatusLabel(status)}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
