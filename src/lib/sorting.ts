import type { Row, SortState } from './types';
import { isNumericColumn } from './numeric';

/**
 * Resolves a column key of the form `col-<index>` (the convention used by the
 * CSV parser) to the matching row index. Returns `null` when the key does not
 * follow that convention, so an unknown key leaves the order untouched.
 */
function columnIndexFromKey(key: string): number | null {
  const match = /^col-(\d+)$/.exec(key);
  if (!match) {
    return null;
  }
  const index = Number(match[1]);
  return Number.isInteger(index) && index >= 0 ? index : null;
}

function cellOf(row: Row, index: number): string {
  return index < row.length ? (row[index] ?? '') : '';
}

/**
 * Sorts rows by the column named in `sort.key`.
 *
 * - `null` sort leaves the rows in their current order.
 * - A numeric column (all non-empty values parse as finite numbers) is sorted
 *   numerically, otherwise lexically.
 * - Missing values (empty / whitespace-only) always sort after real values,
 *   regardless of direction.
 */
export function sortRows(rows: Row[], sort: SortState | null): Row[] {
  if (!sort) {
    return rows;
  }

  const index = columnIndexFromKey(sort.key);
  if (index === null) {
    return rows;
  }

  const values = rows.map((row) => cellOf(row, index));
  const numeric = isNumericColumn(values);
  const factor = sort.dir === 'desc' ? -1 : 1;

  return [...rows].sort((a, b) => {
    const av = cellOf(a, index);
    const bv = cellOf(b, index);

    if (!numeric) {
      return factor * av.localeCompare(bv);
    }

    const aMissing = av.trim() === '';
    const bMissing = bv.trim() === '';
    if (aMissing && bMissing) {
      return 0;
    }
    if (aMissing) {
      return 1;
    }
    if (bMissing) {
      return -1;
    }

    const an = Number(av);
    const bn = Number(bv);
    if (Number.isNaN(an) || Number.isNaN(bn)) {
      return 0;
    }
    return factor * (an - bn);
  });
}
