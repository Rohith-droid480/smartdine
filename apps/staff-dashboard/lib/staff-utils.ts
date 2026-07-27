import { StaffMember, StaffRole, ShiftStatus } from './types';

export const ALLOWED_STAFF_ROLES: StaffRole[] = [
  'MANAGER',
  'CHEF',
  'WAITER',
  'HOST',
  'BARTENDER',
  'CLEANER',
];

export const ALLOWED_SHIFT_STATUSES: ShiftStatus[] = [
  'ON_DUTY',
  'ON_BREAK',
  'OFF_DUTY',
];

export function normalizeShiftStatus(status: ShiftStatus | string): ShiftStatus {
  const upper = String(status).toUpperCase();
  switch (upper) {
    case 'ON_DUTY':
      return 'ON_DUTY';
    case 'ON_BREAK':
      return 'ON_BREAK';
    case 'OFF_DUTY':
      return 'OFF_DUTY';
    default:
      return 'ON_DUTY';
  }
}

export function getShiftStatusBadgeClass(status: ShiftStatus | string): string {
  const normalized = normalizeShiftStatus(status);
  switch (normalized) {
    case 'ON_DUTY':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'ON_BREAK':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'OFF_DUTY':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function getShiftStatusLabel(status: ShiftStatus | string): string {
  const normalized = normalizeShiftStatus(status);
  switch (normalized) {
    case 'ON_DUTY':
      return 'On Duty';
    case 'ON_BREAK':
      return 'On Break';
    case 'OFF_DUTY':
      return 'Off Duty';
    default:
      return 'On Duty';
  }
}

export function getStaffRoleLabel(role: StaffRole | string): string {
  const upper = String(role).toUpperCase();
  switch (upper) {
    case 'MANAGER':
      return 'General Manager';
    case 'CHEF':
      return 'Executive Chef';
    case 'WAITER':
      return 'Floor Waiter';
    case 'HOST':
      return 'Head Host';
    case 'BARTENDER':
      return 'Mixologist / Bartender';
    case 'CLEANER':
      return 'Sanitation & Cleaner';
    default:
      return String(role);
  }
}

export function formatHourlyRate(rate: number): string {
  return `$${rate.toFixed(2)}/hr`;
}

export function formatJoinedDate(dateString: string): string {
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

export function sortStaffMembers(staff: StaffMember[]): StaffMember[] {
  return [...staff].sort((a, b) => {
    // On duty first, then on break, then off duty
    const statusOrder: Record<ShiftStatus, number> = {
      ON_DUTY: 0,
      ON_BREAK: 1,
      OFF_DUTY: 2,
    };
    const aOrder = statusOrder[normalizeShiftStatus(a.shiftStatus)] ?? 3;
    const bOrder = statusOrder[normalizeShiftStatus(b.shiftStatus)] ?? 3;

    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });
}
