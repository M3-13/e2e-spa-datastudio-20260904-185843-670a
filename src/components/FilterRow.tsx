import type { ReactElement } from 'react';
import { useAppState } from '../state/AppState';
import { getVisibleColumns } from '../lib/columns';
import type { Column, Filter } from '../lib/types';
import styles from './FilterRow.module.css';

const OP_LABELS: Record<Filter['op'], string> = {
  contains: 'enthält',
  gt: 'größer als',
  lt: 'kleiner als',
  eq: 'gleich',
  between: 'Bereich',
};

export function FilterRow(): ReactElement {
  const { data, visibleKeys, filters, setFilters } = useAppState();
  const columns = data?.columns ?? [];
  const visibleCols = getVisibleColumns(columns, visibleKeys);

  const commit = (
    col: Column,
    op: Filter['op'],
    value: string,
    value2?: string,
  ) => {
    const next = { ...filters };
    if (value === '' && (value2 === undefined || value2 === '')) {
      delete next[col.key];
    } else if (value2 === undefined) {
      next[col.key] = { op, value };
    } else {
      next[col.key] = { op, value, value2 };
    }
    setFilters(next);
  };

  if (visibleCols.length === 0) {
    return <div className={styles.filterrow} />;
  }

  return (
    <div className={styles.filterrow}>
      {visibleCols.map((col) => {
        const filter = filters[col.key];

        if (col.type === 'text') {
          return (
            <div className={styles.field} key={col.key}>
              <label className={styles.label} htmlFor={`filter-${col.key}`}>
                {col.label}
              </label>
              <input
                id={`filter-${col.key}`}
                type="text"
                className={styles.input}
                placeholder="enthält …"
                value={filter?.value ?? ''}
                onChange={(event) =>
                  commit(col, 'contains', event.target.value)
                }
              />
            </div>
          );
        }

        const op = filter?.op ?? 'gt';
        const value = filter?.value ?? '';
        const value2 = filter?.value2 ?? '';

        return (
          <div className={styles.field} key={col.key}>
            <label className={styles.label} htmlFor={`filter-${col.key}`}>
              {col.label}
            </label>
            <div className={styles.numberControls}>
              <select
                id={`filter-${col.key}`}
                className={styles.select}
                value={op}
                onChange={(event) =>
                  commit(col, event.target.value as Filter['op'], '')
                }
              >
                <option value="gt">{OP_LABELS.gt}</option>
                <option value="lt">{OP_LABELS.lt}</option>
                <option value="eq">{OP_LABELS.eq}</option>
                <option value="between">{OP_LABELS.between}</option>
              </select>
              <input
                type="number"
                className={styles.input}
                placeholder="Wert"
                value={value}
                onChange={(event) =>
                  commit(col, op, event.target.value, value2)
                }
              />
              {op === 'between' && (
                <input
                  type="number"
                  className={styles.input}
                  placeholder="bis"
                  value={value2}
                  onChange={(event) =>
                    commit(col, op, value, event.target.value)
                  }
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
