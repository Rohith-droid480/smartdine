import { Reservation } from './types';

export type TableStatus = 'free' | 'reserved' | 'occupied';
export type DerivedReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface TableViewModel {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  reservation?: Reservation;
}

export const ALLOWED_TABLE_STATUSES: TableStatus[] = ['free', 'reserved', 'occupied'];

export function normalizeTableStatus(status: string): TableStatus {
  const lower = status.toLowerCase();
  switch (lower) {
    case 'available':
    case 'free':
      return 'free';
    case 'reserved':
      return 'reserved';
    case 'occupied':
    case 'seated':
      return 'occupied';
    default:
      return 'free';
  }
}

export function normalizeReservationStatus(status: string): DerivedReservationStatus {
  const lower = status.toLowerCase();
  switch (lower) {
    case 'pending':
      return 'pending';
    case 'confirmed':
      return 'confirmed';
    case 'cancelled':
      return 'cancelled';
    case 'completed':
    case 'seated':
      return 'completed';
    default:
      return 'confirmed';
  }
}

export function getTableStatusBadgeClass(status: TableStatus): string {
  switch (status) {
    case 'free':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'reserved':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'occupied':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function getTableStatusLabel(status: TableStatus): string {
  switch (status) {
    case 'free':
      return 'Free';
    case 'reserved':
      return 'Reserved';
    case 'occupied':
      return 'Occupied';
    default:
      return 'Free';
  }
}

export function getReservationStatusBadgeClass(status: string): string {
  const norm = normalizeReservationStatus(status);
  switch (norm) {
    case 'pending':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'confirmed':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'cancelled':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function getReservationStatusLabel(status: string): string {
  const norm = normalizeReservationStatus(status);
  switch (norm) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Confirmed';
  }
}

export function formatCapacity(capacity: number): string {
  return `${capacity} ${capacity === 1 ? 'Seat' : 'Seats'}`;
}

export function sortTablesByNumber(tables: TableViewModel[]): TableViewModel[] {
  return [...tables].sort((a, b) => a.number - b.number);
}
