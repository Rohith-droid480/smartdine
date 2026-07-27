'use client';

import React from 'react';
import { Search, RefreshCw, X, Filter, UserPlus } from 'lucide-react';
import { StaffFilters } from './StaffFilters';
import { ALLOWED_STAFF_ROLES, getStaffRoleLabel } from '@/lib/staff-utils';

export interface StaffToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  onRefresh: () => void;
  onAddStaff?: () => void;
  isLoading: boolean;
  totalResults: number;
  statusCounts?: Record<string, number>;
}

export const StaffToolbar: React.FC<StaffToolbarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  onRefresh,
  onAddStaff,
  isLoading,
  totalResults,
  statusCounts,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-6">
      {/* Search Bar & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search staff by name, email, phone..."
            className="w-full pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-400 bg-slate-950/60 rounded-xl border border-slate-700/60 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Selector & Refresh Button */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {/* Role Filter Dropdown */}
          <div className="relative flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden xs:block" />
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-950/60 border border-slate-700/60 text-slate-200 rounded-xl focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="all">All Roles</option>
              {ALLOWED_STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {getStaffRoleLabel(role)}
                </option>
              ))}
            </select>
          </div>

          {onAddStaff && (
            <button
              onClick={onAddStaff}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-brand-500 hover:bg-brand-400 rounded-xl transition-all shadow-glow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Staff</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all disabled:opacity-50"
            title="Refresh Staff List"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pt-2 border-t border-slate-800/60">
        <StaffFilters
          currentFilter={statusFilter}
          onFilterChange={onStatusFilterChange}
          counts={statusCounts}
        />
      </div>
    </div>
  );
};
