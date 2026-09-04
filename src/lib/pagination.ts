import type { Row } from './types';

/**
 * Returns the slice of rows that belongs to `page` (1-based) at the given
 * `pageSize`. Values below 1 (or non-finite) are clamped to 1 so that a
 * caller passing a bogus page or size still receives a stable, in-bounds
 * window instead of an empty one caused by negative offsets.
 */
export function paginate(rows: Row[], page: number, pageSize: number): Row[] {
  const current = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const size =
    Number.isFinite(pageSize) && pageSize >= 1 ? Math.floor(pageSize) : 1;

  const start = (current - 1) * size;
  return rows.slice(start, start + size);
}
