'use client';

import React from 'react';
import { StaffMember } from '@/lib/types';
import { StaffStatusBadge } from './StaffStatusBadge';
import { getStaffRoleLabel, formatHourlyRate, formatJoinedDate } from '@/lib/staff-utils';
import { UserCheck } from 'lucide-react';

export interface StaffRowProps {
  member: StaffMember;
  onSelectStaff: (member: StaffMember) => void;
  isEven?: boolean;
}

export const StaffRow: React.FC<StaffRowProps> = React.memo(({
  member,
  onSelectStaff,
  isEven = false,
}) => {
  return (
    <tr
      onClick={() => onSelectStaff(member)}
      className={`group cursor-pointer transition-colors hover:bg-slate-800/70 ${
        isEven ? 'bg-slate-900/40' : 'bg-slate-950/40'
      }`}
    >
      {/* Name & Email */}
      <td className="px-4 py-3.5 text-xs font-bold text-white group-hover:text-brand-400">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-brand-400 flex items-center justify-center text-xs font-bold border border-slate-700/60 shrink-0">
            {member.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-bold">{member.name}</div>
            <div className="text-[11px] text-slate-400 font-normal">{member.email}</div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3.5 text-xs text-slate-300 font-semibold">
        {getStaffRoleLabel(member.role)}
      </td>

      {/* Shift Status */}
      <td className="px-4 py-3.5 text-xs">
        <StaffStatusBadge status={member.shiftStatus} />
      </td>

      {/* Hourly Rate */}
      <td className="px-4 py-3.5 text-xs font-mono font-bold text-emerald-400">
        {formatHourlyRate(member.hourlyRate)}
      </td>

      {/* Contact Phone */}
      <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
        {member.phone}
      </td>

      {/* Joined Date */}
      <td className="px-4 py-3.5 text-xs text-slate-400">
        {formatJoinedDate(member.joinedDate)}
      </td>
    </tr>
  );
});
