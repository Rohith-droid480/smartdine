'use client';

import React, { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  InventoryToolbar,
  InventoryTable,
  InventoryDetailsDrawer,
} from '@/components/inventory';
import { useInventory } from '@/hooks/useInventory';
import { normalizeStockStatus } from '@/lib/inventory-utils';

export default function InventoryPage() {
  const {
    inventory,
    allInventory,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedItem,
    setSelectedItem,
    refreshInventory,
  } = useInventory();

  // Compute status counts for filter tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allInventory.length,
      IN_STOCK: 0,
      LOW_STOCK: 0,
      OUT_OF_STOCK: 0,
    };

    allInventory.forEach((item) => {
      const norm = normalizeStockStatus(item.status);
      if (counts[norm] !== undefined) {
        counts[norm]++;
      }
    });

    return counts;
  }, [allInventory]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Inventory Control & Stock Management"
        subtitle="Real-time ingredient stock levels, low threshold warnings, and supplier details"
      />

      {/* Operations Toolbar */}
      <InventoryToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={refreshInventory}
        isLoading={loading}
        totalResults={inventory.length}
        statusCounts={statusCounts}
      />

      {/* Inventory Data Table / Mobile Card Grid */}
      <InventoryTable
        items={inventory}
        isLoading={loading}
        error={error}
        onSelectItem={(item) => setSelectedItem(item)}
        onRetry={refreshInventory}
      />

      {/* Item Inspection Side Drawer */}
      <InventoryDetailsDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </DashboardLayout>
  );
}
