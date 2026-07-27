import { InventoryItem, StockStatus } from './types';

export const ALLOWED_STOCK_STATUSES: StockStatus[] = [
  'IN_STOCK',
  'LOW_STOCK',
  'OUT_OF_STOCK',
];

export function normalizeStockStatus(status: StockStatus | string): StockStatus {
  const upper = String(status).toUpperCase();
  switch (upper) {
    case 'IN_STOCK':
      return 'IN_STOCK';
    case 'LOW_STOCK':
      return 'LOW_STOCK';
    case 'OUT_OF_STOCK':
      return 'OUT_OF_STOCK';
    default:
      return 'IN_STOCK';
  }
}

export function getStockStatusBadgeClass(status: StockStatus | string): string {
  const normalized = normalizeStockStatus(status);
  switch (normalized) {
    case 'IN_STOCK':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'LOW_STOCK':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'OUT_OF_STOCK':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function getStockStatusLabel(status: StockStatus | string): string {
  const normalized = normalizeStockStatus(status);
  switch (normalized) {
    case 'IN_STOCK':
      return 'In Stock';
    case 'LOW_STOCK':
      return 'Low Stock';
    case 'OUT_OF_STOCK':
      return 'Out of Stock';
    default:
      return 'In Stock';
  }
}

export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity} ${unit}`;
}

export function formatRestockedDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function isLowOrOutOfStock(item: InventoryItem): boolean {
  const norm = normalizeStockStatus(item.status);
  return norm === 'LOW_STOCK' || norm === 'OUT_OF_STOCK';
}

export function sortInventoryItems(items: InventoryItem[]): InventoryItem[] {
  return [...items].sort((a, b) => {
    // Low / Out of stock items first
    const aWarning = isLowOrOutOfStock(a) ? 0 : 1;
    const bWarning = isLowOrOutOfStock(b) ? 0 : 1;
    if (aWarning !== bWarning) return aWarning - bWarning;
    return a.name.localeCompare(b.name);
  });
}
