import { OrderStatus, Order } from './types';

export const ALLOWED_ORDER_STATUSES: OrderStatus[] = [
  'placed',
  'preparing',
  'ready',
  'served',
  'billed',
];

export function formatOrderNumber(id: string): string {
  if (!id) return '#101';
  if (id.startsWith('#')) return id;
  const digitsOnly = id.replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 3) {
    return `#${digitsOnly.slice(-3)}`;
  }
  const hash = Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const num = (hash % 900) + 101;
  return `#${num}`;
}

export function normalizeOrderStatus(status: OrderStatus): 'placed' | 'preparing' | 'ready' | 'served' | 'billed' {
  const lower = String(status).toLowerCase();
  switch (lower) {
    case 'pending':
    case 'placed':
      return 'placed';
    case 'preparing':
      return 'preparing';
    case 'ready':
      return 'ready';
    case 'served':
      return 'served';
    case 'cancelled':
    case 'completed':
    case 'billed':
      return 'billed';
    default:
      return 'placed';
  }
}

export function getOrderStatusBadgeClass(status: OrderStatus): string {
  const normalized = normalizeOrderStatus(status);
  switch (normalized) {
    case 'placed':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'preparing':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'ready':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'served':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'billed':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function getOrderStatusLabel(status: OrderStatus): string {
  const normalized = normalizeOrderStatus(status);
  switch (normalized) {
    case 'placed':
      return 'Placed';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready';
    case 'served':
      return 'Served';
    case 'billed':
      return 'Billed';
    default:
      return 'Placed';
  }
}

export function sortOrdersByDate(orders: Order[], direction: 'asc' | 'desc' = 'desc'): Order[] {
  return [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return direction === 'desc' ? timeB - timeA : timeA - timeB;
  });
}

export function formatOrderCurrency(amount: number): string {
  const safeAmount = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isNaN(safeAmount) ? 0 : safeAmount);
}

export function formatOrderTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}
