'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { StaffMember } from '@/lib/types';
import { getStaff, createStaffMember } from '@/lib/api';
import { normalizeShiftStatus, sortStaffMembers } from '@/lib/staff-utils';

export function useStaff() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Drawer selection state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Fetch staff strictly through api.getStaff()
  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStaff();
      const sorted = sortStaffMembers(data);
      setStaffMembers(sorted);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch staff members list.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Add staff member handler
  const addStaffMember = useCallback(async (data: Omit<StaffMember, 'id'>) => {
    const created = await createStaffMember(data);
    setStaffMembers((prev) => sortStaffMembers([created, ...prev]));
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Keep selectedStaff in sync if drawer is open during refresh
  useEffect(() => {
    if (selectedStaff) {
      const updated = staffMembers.find((s) => s.id === selectedStaff.id);
      if (updated) {
        setSelectedStaff(updated);
      }
    }
  }, [staffMembers, selectedStaff]);

  // Filtered staff members list
  const filteredStaff = useMemo(() => {
    return staffMembers.filter((member) => {
      // Shift Status Filter
      if (statusFilter !== 'all') {
        const normCurrent = normalizeShiftStatus(member.shiftStatus);
        const normFilter = normalizeShiftStatus(statusFilter);
        if (normCurrent !== normFilter) {
          return false;
        }
      }

      // Role Filter
      if (roleFilter !== 'all') {
        if (member.role.toUpperCase() !== roleFilter.toUpperCase()) {
          return false;
        }
      }

      // Search Query Filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(query);
        const matchesEmail = member.email.toLowerCase().includes(query);
        const matchesPhone = member.phone.includes(query);
        const matchesRole = member.role.toLowerCase().includes(query);

        return matchesName || matchesEmail || matchesPhone || matchesRole;
      }

      return true;
    });
  }, [staffMembers, statusFilter, roleFilter, searchTerm]);

  return {
    staff: filteredStaff,
    allStaff: staffMembers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    selectedStaff,
    setSelectedStaff,
    addStaffMember,
    refreshStaff: fetchStaffData,
  };
}
