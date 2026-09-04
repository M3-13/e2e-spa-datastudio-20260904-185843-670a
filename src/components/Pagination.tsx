import { useEffect, useMemo } from 'react';
import type { ChangeEvent, ReactElement } from 'react';
import { useAppState } from '../state/AppState';
import { getVisibleColumns } from '../lib/columns';
import { applyFilters } from '../lib/filtering';
import styles from './Pagination.module.css';

const PAGE_SIZES = [10, 25, 50, 100];

export function Pagination(): ReactElement | null {
  const { data, visibleKeys, filters, search, page, pageSize, setPage, setPageSize } =
    useAppState();

  const columns = data?.columns ?? [];
  const rows = data?.rows ?? [];

  const visibleCols = useMemo(
    () => getVisibleColumns(columns, visibleKeys),
    [columns, visibleKeys],
  );

  const filtered = useMemo(
    () => applyFilters(rows, filters, search, visibleCols),
    [rows, filters, search, visibleCols],
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);

  if (data === null) {
    return null;
  }

  const currentPage = Math.min(Math.max(1, page), totalPages);

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const size = Number(event.target.value);
    if (!Number.isFinite(size) || size < 1) {
      return;
    }
    setPageSize(size);
    setPage(1);
  };

  return (
    <nav className={styles.pagination} aria-label="Seitennavigation">
      <div className={styles.info}>
        Seite <span className={styles.page}>{currentPage}</span> von{' '}
        <span className={styles.page}>{totalPages}</span> ·{' '}
        <span className={styles.total}>{total}</span> Datensätze
      </div>

      <div className={styles.controls}>
        <label className={styles.sizeLabel}>
          <span>Seitengröße</span>
          <select
            className={styles.select}
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.nav}>
          <button
            type="button"
            className={styles.button}
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            ‹ Zurück
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Vor ›
          </button>
        </div>
      </div>
    </nav>
  );
}
