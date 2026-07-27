import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'PENDING':
    case 'LOW_STOCK':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'PREPARING':
    case 'ON_DUTY':
    case 'CONFIRMED':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'READY':
    case 'SEATED':
    case 'IN_STOCK':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'SERVED':
    case 'COMPLETED':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    case 'CANCELLED':
    case 'OUT_OF_STOCK':
    case 'OFF_DUTY':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}
