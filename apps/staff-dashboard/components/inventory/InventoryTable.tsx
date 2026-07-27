'use client';

import React from 'react';
import { InventoryItem } from '@/lib/types';
import { InventoryRow } from './InventoryRow';
import { StockStatusBadge } from './StockStatusBadge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatQuantity, formatRestockedDate, isLowOrOutOfStock } from '@/lib/inventory-utils';
import { Boxes, Truck } from 'lucide-react';

export interface InventoryTableProps {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  onSelectItem: (item: InventoryItem) => void;
  onRetry: () => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  isLoading,
  error,
  onSelectItem,
  onRetry,
}) => {
  // Error View
  if (error && !isLoading) {
    return (
      <ErrorState
        title="Failed to Load Inventory"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  // Loading View
  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton count={6} className="h-14 w-full" />
      </div>
    );
  }

  // Empty View
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Boxes className="w-8 h-8" />}
        title="No Ingredients Found"
        description="There are currently no stock items matching your filter or search criteria."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 overflow-hidden shadow-card">
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Item Name</th>
              <th className="px-4 py-3.5">Supplier</th>
              <th className="px-4 py-3.5">Current Quantity</th>
              <th className="px-4 py-3.5">Min Threshold</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Last Restocked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {items.map((item, idx) => (
              <InventoryRow
                key={item.id}
                item={item}
                isEven={idx % 2 === 0}
                onSelectItem={onSelectItem}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout (Visible only on mobile < 768px) */}
      <div className="block md:hidden divide-y divide-slate-800/80">
        {items.map((item) => {
          const isWarning = isLowOrOutOfStock(item);

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`p-4 transition-colors space-y-3 cursor-pointer ${
                isWarning ? 'bg-amber-950/20 active:bg-amber-950/40' : 'bg-slate-900/60 active:bg-slate-800/80'
              }`}
            >
              {/* Header: Item & Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {item.name}
                </span>
                <StockStatusBadge status={item.status} />
              </div>

              {/* Quantity & Threshold */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Stock: </span>
                  <span className="font-bold text-slate-100">{formatQuantity(item.quantity, item.unit)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Min: </span>
                  <span className="font-semibold text-slate-300">{formatQuantity(item.minThreshold, item.unit)}</span>
                </div>
              </div>

              {/* Supplier & Date Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-slate-500" /> {item.supplier}
                </span>
                <span>Restocked {formatRestockedDate(item.lastRestockedAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
