'use client';

import React from 'react';
import { TableViewModel, formatCapacity } from '@/lib/table-utils';
import { TableStatusBadge } from './TableStatusBadge';
import { ReservationPreview } from './ReservationPreview';
import { Utensils, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TableCardProps {
  table: TableViewModel;
  onSelectTable: (table: TableViewModel) => void;
}

export const TableCard: React.FC<TableCardProps> = React.memo(({ table, onSelectTable }) => {
  const isFree = table.status === 'free';
  const isReserved = table.status === 'reserved';
  const isOccupied = table.status === 'occupied';

  return (
    <div
      onClick={() => onSelectTable(table)}
      className={cn(
        'group cursor-pointer p-5 rounded-2xl bg-slate-900/80 border transition-all duration-200 shadow-card flex flex-col justify-between hover:scale-[1.01]',
        isFree && 'border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900',
        isReserved && 'border-amber-500/30 hover:border-amber-500/60 bg-slate-900/90',
        isOccupied && 'border-rose-500/30 hover:border-rose-500/60 bg-slate-900/90'
      )}
    >
      {/* Top Header: Table Number & Status Badge */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800 text-brand-400 border border-slate-700/60 group-hover:scale-105 transition-transform">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-none">
                Table {table.number}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <Users className="w-3 h-3 text-slate-500" />
                <span>{formatCapacity(table.capacity)}</span>
              </div>
            </div>
          </div>

          <TableStatusBadge status={table.status} />
        </div>

        {/* Reservation Preview Component */}
        <ReservationPreview reservation={table.reservation} />
      </div>

      {/* Footer Helper for Free tables */}
      {isFree && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <span>Ready for seating</span>
          <span className="text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">
            Available
          </span>
        </div>
      )}
    </div>
  );
});
