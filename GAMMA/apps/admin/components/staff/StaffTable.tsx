'use client';

import React from 'react';
import { StaffMember } from '@/lib/types';
import { StaffRow } from './StaffRow';
import { StaffStatusBadge } from './StaffStatusBadge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { getStaffRoleLabel, formatHourlyRate } from '@/lib/staff-utils';
import { Users, Phone, Mail } from 'lucide-react';

export interface StaffTableProps {
  staff: StaffMember[];
  isLoading: boolean;
  error: string | null;
  onSelectStaff: (member: StaffMember) => void;
  onRetry: () => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  isLoading,
  error,
  onSelectStaff,
  onRetry,
}) => {
  // Error View
  if (error && !isLoading) {
    return (
      <ErrorState
        title="Failed to Load Staff Roster"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  // Loading View
  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton count={6} className="h-14 w-full" />
      </div>
    );
  }

  // Empty View
  if (staff.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-8 h-8" />}
        title="No Staff Members Found"
        description="There are currently no staff members matching your search or role filter criteria."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 overflow-hidden shadow-card">
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Staff Name</th>
              <th className="px-4 py-3.5">Assigned Role</th>
              <th className="px-4 py-3.5">Shift Status</th>
              <th className="px-4 py-3.5">Hourly Rate</th>
              <th className="px-4 py-3.5">Phone</th>
              <th className="px-4 py-3.5">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {staff.map((member, idx) => (
              <StaffRow
                key={member.id}
                member={member}
                isEven={idx % 2 === 0}
                onSelectStaff={onSelectStaff}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout (Visible only on mobile < 768px) */}
      <div className="block md:hidden divide-y divide-slate-800/80">
        {staff.map((member) => (
          <div
            key={member.id}
            onClick={() => onSelectStaff(member)}
            className="p-4 bg-slate-900/60 active:bg-slate-800/80 transition-colors space-y-3 cursor-pointer"
          >
            {/* Header: Name & Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-brand-400 flex items-center justify-center text-xs font-bold border border-slate-700/60">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{member.name}</h4>
                  <p className="text-[11px] text-brand-400 font-medium">{getStaffRoleLabel(member.role)}</p>
                </div>
              </div>
              <StaffStatusBadge status={member.shiftStatus} />
            </div>

            {/* Contact & Rate Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" /> {member.phone}
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-400">
                {formatHourlyRate(member.hourlyRate)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
