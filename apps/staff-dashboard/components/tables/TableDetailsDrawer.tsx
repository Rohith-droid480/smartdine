'use client';

import React, { useEffect } from 'react';
import { X, Utensils, Users, Clock, Phone, FileText, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { TableViewModel, formatCapacity, getReservationStatusBadgeClass, getReservationStatusLabel } from '@/lib/table-utils';
import { TableStatusBadge } from './TableStatusBadge';

export interface TableDetailsDrawerProps {
  table: TableViewModel | null;
  onClose: () => void;
}

export const TableDetailsDrawer: React.FC<TableDetailsDrawerProps> = ({
  table,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (table) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [table, onClose]);

  if (!table) return null;

  const reservation = table.reservation;

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
        aria-label={`Table details for table ${table.number}`}
        className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Table {table.number}</h2>
              <TableStatusBadge status={table.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Floor Plan Details & Seating Status</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close Table Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Key Table Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Utensils className="w-3.5 h-3.5 text-brand-400" />
                <span>Table ID</span>
              </div>
              <p className="text-sm font-mono font-bold text-white">Table #{table.number}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Seating Capacity</span>
              </div>
              <p className="text-sm font-bold text-white">{formatCapacity(table.capacity)}</p>
            </div>
          </div>

          {/* Active Reservation Section */}
          {reservation ? (
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-bold text-white">Active Reservation</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getReservationStatusBadgeClass(
                    reservation.status
                  )}`}
                >
                  {getReservationStatusLabel(reservation.status)}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Guest Name</span>
                  <span className="font-bold text-white">{reservation.guestName}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Scheduled Time</span>
                  <span className="font-bold text-brand-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {reservation.reservationTime}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Party Size</span>
                  <span className="font-bold text-white">{reservation.guestCount} Guests</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Contact Phone</span>
                  <span className="font-mono text-slate-300 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {reservation.contactPhone}
                  </span>
                </div>

                {reservation.specialNotes && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1 mb-1">
                      <FileText className="w-3 h-3 text-amber-400" />
                      Special Notes:
                    </span>
                    <p className="text-slate-300 italic bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      "{reservation.specialNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-200">Table is Currently Free</h3>
              <p className="text-xs text-emerald-300/70 max-w-xs mx-auto">
                No active reservations are linked to Table {table.number}. Table is ready for immediate seating.
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">Table Status</span>
          <TableStatusBadge status={table.status} />
        </div>
      </aside>
    </>
  );
};
