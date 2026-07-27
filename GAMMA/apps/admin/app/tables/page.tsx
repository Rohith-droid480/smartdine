'use client';

import React, { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  TablesToolbar,
  TablesGrid,
  TableDetailsDrawer,
} from '@/components/tables';
import { useTables } from '@/hooks/useTables';

export default function TablesPage() {
  const {
    tables,
    allTables,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    capacityFilter,
    setCapacityFilter,
    selectedTable,
    setSelectedTable,
    refreshTables,
  } = useTables();

  // Compute status counts for filter tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allTables.length,
      free: 0,
      reserved: 0,
      occupied: 0,
    };

    allTables.forEach((t) => {
      if (counts[t.status] !== undefined) {
        counts[t.status]++;
      }
    });

    return counts;
  }, [allTables]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Table & Seating Management"
        subtitle="Real-time dining room floor plan, seating status, and guest reservations"
      />

      {/* Operations Toolbar */}
      <TablesToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        capacityFilter={capacityFilter}
        onCapacityFilterChange={setCapacityFilter}
        onRefresh={refreshTables}
        isLoading={loading}
        totalResults={tables.length}
        statusCounts={statusCounts}
      />

      {/* Tables Grid Layout */}
      <TablesGrid
        tables={tables}
        isLoading={loading}
        error={error}
        onSelectTable={(table) => setSelectedTable(table)}
        onRetry={refreshTables}
      />

      {/* Table Inspection Side Drawer */}
      <TableDetailsDrawer
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
      />
    </DashboardLayout>
  );
}
