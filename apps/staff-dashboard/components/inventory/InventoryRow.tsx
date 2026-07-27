'use client';

import React from 'react';
import { InventoryItem } from '@/lib/types';
import { StockStatusBadge } from './StockStatusBadge';
import { formatQuantity, formatRestockedDate, normalizeStockStatus } from '@/lib/inventory-utils';

export interface InventoryRowProps {
  item: InventoryItem;
  onSelectItem: (item: InventoryItem) => void;
  isEven?: boolean;
}

export const InventoryRow: React.FC<InventoryRowProps> = React.memo(({
  item,
  onSelectItem,
  isEven = false,
}) => {
  const normStatus = normalizeStockStatus(item.status);
  const isLowStock = normStatus === 'LOW_STOCK';
  const isOutOfStock = normStatus === 'OUT_OF_STOCK';

  return (
    <tr
      onClick={() => onSelectItem(item)}
      className={`group cursor-pointer transition-colors hover:bg-slate-800/70 ${
        isOutOfStock
          ? 'bg-rose-950/20 hover:bg-rose-950/30'
          : isLowStock
          ? 'bg-amber-950/20 hover:bg-amber-950/30'
          : isEven
          ? 'bg-slate-900/40'
          : 'bg-slate-950/40'
      }`}
    >
      {/* Item Name */}
      <td className="px-4 py-3.5 text-xs font-bold text-white group-hover:text-brand-400">
        {item.name}
      </td>

      {/* Supplier */}
      <td className="px-4 py-3.5 text-xs text-slate-300 font-medium">
        {item.supplier}
      </td>

      {/* Current Quantity */}
      <td className="px-4 py-3.5 text-xs font-bold text-slate-100">
        <span className={isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-slate-100'}>
          {formatQuantity(item.quantity, item.unit)}
        </span>
      </td>

      {/* Minimum Threshold */}
      <td className="px-4 py-3.5 text-xs text-slate-400">
        {formatQuantity(item.minThreshold, item.unit)}
      </td>

      {/* Stock Status Badge */}
      <td className="px-4 py-3.5 text-xs">
        <StockStatusBadge status={item.status} />
      </td>

      {/* Last Restocked At */}
      <td className="px-4 py-3.5 text-xs text-slate-400">
        {formatRestockedDate(item.lastRestockedAt)}
      </td>
    </tr>
  );
});
