import type { ReactElement } from 'react';
import { useAppState } from '../state/AppState';
import styles from './ColumnSelector.module.css';

export function ColumnSelector(): ReactElement {
  const { data, visibleKeys, setVisibleKeys } = useAppState();
  const columns = data?.columns ?? [];

  if (columns.length === 0) {
    return (
      <div className={styles.selector}>
        <span className={styles.muted}>Spaltenauswahl</span>
      </div>
    );
  }

  const allKeys = columns.map((column) => column.key);
  const allVisible = visibleKeys.length === 0;
  const isVisible = (key: string): boolean =>
    allVisible || visibleKeys.includes(key);

  const toggleColumn = (key: string): void => {
    const current = allVisible
      ? allKeys
      : visibleKeys.filter((k) => allKeys.includes(k));
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    setVisibleKeys(next.length === allKeys.length ? [] : next);
  };

  return (
    <details className={styles.selector}>
      <summary className={styles.summary}>Spalten</summary>
      <div className={styles.panel}>
        {columns.map((column) => (
          <label key={column.key} className={styles.item}>
            <input
              type="checkbox"
              checked={isVisible(column.key)}
              onChange={() => toggleColumn(column.key)}
            />
            <span>{column.label}</span>
          </label>
        ))}
      </div>
    </details>
  );
}
