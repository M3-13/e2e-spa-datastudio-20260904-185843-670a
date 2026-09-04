import type { ReactElement } from 'react';
import type { Column, Row, SortState } from '../lib/types';
import styles from './DataTable.module.css';

export interface DataTableProps {
  columns: Column[];
  rows: Row[];
  sort: SortState | null;
  onSort: (key: string) => void;
}

export function DataTable(props: DataTableProps): ReactElement {
  const { columns, rows, sort, onSort } = props;

  if (columns.length === 0) {
    return (
      <section className={styles.empty}>
        <p className={styles.emptyText}>Keine Daten geladen.</p>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sort?.key === col.key;
              const arrow = isSorted ? (sort?.dir === 'asc' ? '\u25b2' : '\u25bc') : '';
              return (
                <th key={col.key} className={styles.th}>
                  <button
                    type="button"
                    className={styles.thButton}
                    onClick={() => onSort(col.key)}
                  >
                    <span>{col.label}</span>
                    {arrow !== '' && (
                      <span className={styles.sortArrow}>{arrow}</span>
                    )}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={styles.row}>
              {columns.map((col) => (
                <td key={col.key} className={styles.td}>
                  {col.index < row.length ? row[col.index] : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
