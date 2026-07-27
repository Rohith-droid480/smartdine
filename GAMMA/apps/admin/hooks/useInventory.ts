'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { InventoryItem } from '@/lib/types';
import { getInventory } from '@/lib/api';
import { normalizeStockStatus, sortInventoryItems } from '@/lib/inventory-utils';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Selected State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Fetch inventory strictly from api.getInventory()
  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventory();
      const sorted = sortInventoryItems(data);
      setItems(sorted);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch inventory stock items.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // Keep selectedItem in sync if drawer is open during refresh
  useEffect(() => {
    if (selectedItem) {
      const updated = items.find((i) => i.id === selectedItem.id);
      if (updated) {
        setSelectedItem(updated);
      }
    }
  }, [items, selectedItem]);

  // Filtered inventory list
  const filteredInventory = useMemo(() => {
    return items.filter((item) => {
      // Status Filter
      if (statusFilter !== 'all') {
        const normCurrent = normalizeStockStatus(item.status);
        const normFilter = normalizeStockStatus(statusFilter);
        if (normCurrent !== normFilter) {
          return false;
        }
      }

      // Search Query Filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSupplier = item.supplier.toLowerCase().includes(query);
        const matchesUnit = item.unit.toLowerCase().includes(query);

        return matchesName || matchesSupplier || matchesUnit;
      }

      return true;
    });
  }, [items, statusFilter, searchTerm]);

  return {
    inventory: filteredInventory,
    allInventory: items,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedItem,
    setSelectedItem,
    refreshInventory: fetchInventoryData,
  };
}
