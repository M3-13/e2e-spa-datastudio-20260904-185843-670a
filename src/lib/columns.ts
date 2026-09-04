import type { Column } from './types';

export function getVisibleColumns(
  columns: Column[],
  visibleKeys: string[],
): Column[] {
  if (visibleKeys.length === 0) {
    return columns;
  }
  const keys = new Set(visibleKeys);
  return columns.filter((column) => keys.has(column.key));
}
