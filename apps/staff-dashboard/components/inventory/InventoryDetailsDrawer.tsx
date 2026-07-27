'use client';

import React, { useEffect } from 'react';
import { X, Boxes, Truck, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import { InventoryItem } from '@/lib/types';
import { StockStatusBadge } from './StockStatusBadge';
import { formatQuantity, formatRestockedDate, isLowOrOutOfStock } from '@/lib/inventory-utils';

export interface InventoryDetailsDrawerProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export const InventoryDetailsDrawer: React.FC<InventoryDetailsDrawerProps> = ({
  item,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (item) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const isWarning = isLowOrOutOfStock(item);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Inventory details for ${item.name}`}
        className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{item.name}</h2>
              <StockStatusBadge status={item.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Ingredient Stock Breakdown & Threshold Audit</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close Item Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Low Stock Warning Banner */}
          {isWarning && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-200">Re-order Alert Triggered</h4>
                <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                  Current stock ({formatQuantity(item.quantity, item.unit)}) is at or below the minimum threshold ({formatQuantity(item.minThreshold, item.unit)}).
                </p>
              </div>
            </div>
          )}

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Boxes className="w-3.5 h-3.5 text-brand-400" />
                <span>Current Quantity</span>
              </div>
              <p className="text-base font-extrabold text-white">
                {formatQuantity(item.quantity, item.unit)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Min Threshold</span>
              </div>
              <p className="text-base font-extrabold text-slate-200">
                {formatQuantity(item.minThreshold, item.unit)}
              </p>
            </div>
          </div>

          {/* Contract Metadata Card */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800/80">
              Supplier & Stock Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  Primary Supplier
                </span>
                <span className="font-bold text-white">{item.supplier}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Last Restocked
                </span>
                <span className="font-bold text-slate-200">
                  {formatRestockedDate(item.lastRestockedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">Stock Status</span>
          <StockStatusBadge status={item.status} />
        </div>
      </aside>
    </>
  );
};
