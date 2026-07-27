'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  StaffToolbar,
  StaffTable,
  StaffDetailsDrawer,
  CreateStaffModal,
} from '@/components/staff';
import { useStaff } from '@/hooks/useStaff';
import { normalizeShiftStatus } from '@/lib/staff-utils';

export default function StaffPage() {
  const {
    staff,
    allStaff,
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
    refreshStaff,
  } = useStaff();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Compute status counts for filter tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allStaff.length,
      ON_DUTY: 0,
      ON_BREAK: 0,
      OFF_DUTY: 0,
    };

    allStaff.forEach((member) => {
      const norm = normalizeShiftStatus(member.shiftStatus);
      if (counts[norm] !== undefined) {
        counts[norm]++;
      }
    });

    return counts;
  }, [allStaff]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Staff & Shift Roster"
        subtitle="Real-time employee directory, shift status tracking, and role assignments"
      />

      {/* Operations Toolbar */}
      <StaffToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onRefresh={refreshStaff}
        onAddStaff={() => setIsCreateModalOpen(true)}
        isLoading={loading}
        totalResults={staff.length}
        statusCounts={statusCounts}
      />

      {/* Staff Data Table / Mobile Card Grid */}
      <StaffTable
        staff={staff}
        isLoading={loading}
        error={error}
        onSelectStaff={(member) => setSelectedStaff(member)}
        onRetry={refreshStaff}
      />

      {/* Staff Member Inspection Side Drawer */}
      <StaffDetailsDrawer
        member={selectedStaff}
        onClose={() => setSelectedStaff(null)}
      />

      {/* Add Staff Member Modal */}
      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={addStaffMember}
      />
    </DashboardLayout>
  );
}
