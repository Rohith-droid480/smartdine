import React from 'react';
import { Reservation } from '@/lib/types';
import { getReservationStatusBadgeClass, getReservationStatusLabel } from '@/lib/table-utils';
import { Clock, Users, User } from 'lucide-react';

export interface ReservationPreviewProps {
  reservation?: Reservation;
}

export const ReservationPreview: React.FC<ReservationPreviewProps> = ({ reservation }) => {
  if (!reservation) return null;

  const statusBadgeStyle = getReservationStatusBadgeClass(reservation.status);
  const statusLabel = getReservationStatusLabel(reservation.status);

  return (
    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
      {/* Reservation Status & Time */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Clock className="w-3.5 h-3.5 text-brand-400" />
          <span>{reservation.reservationTime}</span>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusBadgeStyle}`}>
          {statusLabel}
        </span>
      </div>

      {/* Guest Name & Party Size */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 truncate pr-2">
          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate font-medium text-slate-300">{reservation.guestName}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <Users className="w-3.5 h-3.5" />
          <span>{reservation.guestCount} guests</span>
        </div>
      </div>
    </div>
  );
};
