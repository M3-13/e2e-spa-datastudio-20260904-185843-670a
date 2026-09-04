import type { Column, Filter, Row } from './types';

function cellOf(row: Row, col: Column): string {
  const cell = row[col.index];
  return cell ?? '';
}

function parseNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

function matchesSearch(
  row: Row,
  searchLower: string,
  visibleCols: Column[],
): boolean {
  if (searchLower === '') {
    return true;
  }
  for (const col of visibleCols) {
    if (cellOf(row, col).toLowerCase().includes(searchLower)) {
      return true;
    }
  }
  return false;
}

function matchesFilter(row: Row, col: Column, filter: Filter): boolean {
  const raw = cellOf(row, col);

  switch (filter.op) {
    case 'contains': {
      if (filter.value === '') {
        return true;
      }
      return raw.toLowerCase().includes(filter.value.toLowerCase());
    }
    case 'gt':
    case 'lt':
    case 'eq': {
      const value = parseNumber(filter.value);
      if (value === null) {
        return true;
      }
      const cell = parseNumber(raw);
      if (cell === null) {
        return false;
      }
      if (filter.op === 'gt') {
        return cell > value;
      }
      if (filter.op === 'lt') {
        return cell < value;
      }
      return cell === value;
    }
    case 'between': {
      const min = parseNumber(filter.value);
      const max = parseNumber(filter.value2 ?? '');
      if (min === null && max === null) {
        return true;
      }
      const cell = parseNumber(raw);
      if (cell === null) {
        return false;
      }
      if (min !== null && cell < min) {
        return false;
      }
      if (max !== null && cell > max) {
        return false;
      }
      return true;
    }
  }
}

export function applyFilters(
  rows: Row[],
  filters: Record<string, Filter>,
  search: string,
  visibleCols: Column[],
): Row[] {
  const searchLower = search.trim().toLowerCase();

  const colByKey = new Map<string, Column>();
  for (const col of visibleCols) {
    colByKey.set(col.key, col);
  }

  const active: { col: Column; filter: Filter }[] = [];
  for (const [key, filter] of Object.entries(filters)) {
    if (!filter) {
      continue;
    }
    const col = colByKey.get(key);
    if (!col) {
      continue;
    }
    active.push({ col, filter });
  }

  return rows.filter((row) => {
    if (!matchesSearch(row, searchLower, visibleCols)) {
      return false;
    }
    for (const entry of active) {
      if (!matchesFilter(row, entry.col, entry.filter)) {
        return false;
      }
    }
    return true;
  });
}
