'use client';

import React, { useEffect } from 'react';
import { X, User, Mail, Phone, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { StaffMember } from '@/lib/types';
import { StaffStatusBadge } from './StaffStatusBadge';
import { getStaffRoleLabel, formatHourlyRate, formatJoinedDate } from '@/lib/staff-utils';

export interface StaffDetailsDrawerProps {
  member: StaffMember | null;
  onClose: () => void;
}

export const StaffDetailsDrawer: React.FC<StaffDetailsDrawerProps> = ({
  member,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (member) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [member, onClose]);

  if (!member) return null;

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
        aria-label={`Staff details for ${member.name}`}
        className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{member.name}</h2>
              <StaffStatusBadge status={member.shiftStatus} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{getStaffRoleLabel(member.role)}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close Staff Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Staff Member Avatar Header Card */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center text-xl font-extrabold border border-brand-500/30 shrink-0 shadow-glow-sm">
              {member.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{member.name}</h3>
              <p className="text-xs font-semibold text-brand-400 mt-0.5">{getStaffRoleLabel(member.role)}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">ID: #{member.id}</p>
            </div>
          </div>

          {/* Key Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hourly Rate</span>
              </div>
              <p className="text-base font-extrabold text-emerald-400">
                {formatHourlyRate(member.hourlyRate)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Joined Date</span>
              </div>
              <p className="text-sm font-bold text-slate-200">
                {formatJoinedDate(member.joinedDate)}
              </p>
            </div>
          </div>

          {/* Detailed Contract Fields */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800/80">
              Contact & Roster Details
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Email Address
                </span>
                <span className="font-semibold text-white truncate max-w-[200px]">{member.email}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  Phone Number
                </span>
                <span className="font-mono text-slate-200">{member.phone}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  Assigned Role
                </span>
                <span className="font-bold text-brand-300">{getStaffRoleLabel(member.role)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">Current Shift Status</span>
          <StaffStatusBadge status={member.shiftStatus} />
        </div>
      </aside>
    </>
  );
};
