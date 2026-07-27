'use client';

import React from 'react';
import { TableViewModel } from '@/lib/table-utils';
import { TableCard } from './TableCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Grid } from 'lucide-react';

export interface TablesGridProps {
  tables: TableViewModel[];
  isLoading: boolean;
  error: string | null;
  onSelectTable: (table: TableViewModel) => void;
  onRetry: () => void;
}

export const TablesGrid: React.FC<TablesGridProps> = ({
  tables,
  isLoading,
  error,
  onSelectTable,
  onRetry,
}) => {
  // Error View
  if (error && !isLoading) {
    return (
      <ErrorState
        title="Failed to Load Table Floor Plan"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  // Loading View
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <LoadingSkeleton count={8} className="h-44 w-full" />
      </div>
    );
  }

  // Empty View
  if (tables.length === 0) {
    return (
      <EmptyState
        icon={<Grid className="w-8 h-8" />}
        title="No Tables Found"
        description="There are currently no dining tables matching your filter or search criteria."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onSelectTable={onSelectTable}
        />
      ))}
    </div>
  );
};
