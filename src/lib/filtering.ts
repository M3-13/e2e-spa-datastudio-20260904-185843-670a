import type { Column, Filter, Row } from './types';

export function applyFilters(
  rows: Row[],
  filters: Record<string, Filter>,
  search: string,
  visibleCols: Column[],
): Row[] {
  return rows;
}
