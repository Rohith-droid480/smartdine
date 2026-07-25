// =============================================================================
// server/src/repositories/table.repository.ts
// Data access layer for the Table model.
// =============================================================================

import { prisma } from '../config/database';
import type { Table, TableStatus } from '@prisma/client';

export type CreateTableData = {
  number: number;
  capacity: number;
  status?: TableStatus;
};

export type UpdateTableData = Partial<{
  number: number;
  capacity: number;
  status: TableStatus;
}>;

export async function findTableById(id: string): Promise<Table | null> {
  return prisma.table.findUnique({ where: { id } });
}

export async function findTableByNumber(number: number): Promise<Table | null> {
  return prisma.table.findUnique({ where: { number } });
}

export async function findAllTables(): Promise<Table[]> {
  return prisma.table.findMany({
    orderBy: { number: 'asc' },
  });
}

export async function createTable(data: CreateTableData): Promise<Table> {
  return prisma.table.create({ data });
}

export async function updateTable(id: string, data: UpdateTableData): Promise<Table> {
  return prisma.table.update({ where: { id }, data });
}

export async function findAvailableTables(capacity: number): Promise<Table[]> {
  return prisma.table.findMany({
    where: {
      capacity: { gte: capacity },
    },
    orderBy: [
      { capacity: 'asc' },
      { number: 'asc' },
    ],
  });
}
