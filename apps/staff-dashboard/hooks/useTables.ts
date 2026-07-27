'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getReservations } from '@/lib/api';
import { Reservation } from '@/lib/types';
import {
  TableViewModel,
  TableStatus,
  sortTablesByNumber,
} from '@/lib/table-utils';

// Standard Restaurant Floor Plan Setup
const INITIAL_FLOOR_PLAN: Array<{ number: number; capacity: number }> = [
  { number: 1, capacity: 6 },
  { number: 2, capacity: 2 },
  { number: 3, capacity: 4 },
  { number: 4, capacity: 2 },
  { number: 5, capacity: 4 },
  { number: 6, capacity: 4 },
  { number: 7, capacity: 4 },
  { number: 8, capacity: 8 },
  { number: 9, capacity: 2 },
  { number: 10, capacity: 4 },
  { number: 11, capacity: 6 },
  { number: 12, capacity: 4 },
];

export function useTables() {
  const [allTables, setAllTables] = useState<TableViewModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<TableViewModel | null>(null);

  // Fetch reservations strictly using api.getReservations()
  const fetchTablesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reservationsData: Reservation[] = await getReservations();

      // Derive visual Table View Model using ONLY shared reservation data
      const derivedTables: TableViewModel[] = INITIAL_FLOOR_PLAN.map((item) => {
        const activeRes = reservationsData.find(
          (r) => r.tableNumber === item.number && r.status !== 'CANCELLED'
        );

        let derivedStatus: TableStatus = 'free';
        if (activeRes) {
          if (activeRes.status === 'SEATED') {
            derivedStatus = 'occupied';
          } else if (activeRes.status === 'CONFIRMED') {
            derivedStatus = 'reserved';
          }
        }

        return {
          id: `tbl_${item.number}`,
          number: item.number,
          capacity: item.capacity,
          status: derivedStatus,
          reservation: activeRes,
        };
      });

      setAllTables(sortTablesByNumber(derivedTables));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch table reservations data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTablesData();
  }, [fetchTablesData]);

  // Sync selectedTable if drawer is open and data refreshes
  useEffect(() => {
    if (selectedTable) {
      const updated = allTables.find((t) => t.number === selectedTable.number);
      if (updated) {
        setSelectedTable(updated);
      }
    }
  }, [allTables, selectedTable]);

  // Filtered tables list
  const filteredTables = useMemo(() => {
    return allTables.filter((table) => {
      // Status filter
      if (statusFilter !== 'all' && table.status !== statusFilter) {
        return false;
      }

      // Capacity filter
      if (capacityFilter !== 'all') {
        if (capacityFilter === '8+') {
          if (table.capacity < 8) return false;
        } else {
          if (table.capacity !== parseInt(capacityFilter, 10)) return false;
        }
      }

      // Search term filter (table number or guest name)
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesNumber = `table ${table.number}`.includes(query) || `${table.number}`.includes(query);
        const matchesGuest = table.reservation?.guestName.toLowerCase().includes(query) || false;
        const matchesPhone = table.reservation?.contactPhone.includes(query) || false;

        return matchesNumber || matchesGuest || matchesPhone;
      }

      return true;
    });
  }, [allTables, statusFilter, capacityFilter, searchTerm]);

  return {
    tables: filteredTables,
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
    refreshTables: fetchTablesData,
  };
}
