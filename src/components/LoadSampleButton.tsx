import { useCallback } from 'react';
import type { ReactElement } from 'react';
import { useAppState } from '../state/AppState';
import { getSampleCsv } from '../lib/sampleData';
import { parseCsv } from '../lib/csvParser';
import type { Column } from '../lib/types';
import styles from './LoadSampleButton.module.css';

export function LoadSampleButton(): ReactElement {
  const state = useAppState();

  const handleClick = useCallback(() => {
    state.setError(null);
    state.setLoadStatus('loading');
    try {
      const csv = getSampleCsv();
      const delimiter = ',';
      const parsed = parseCsv(csv, delimiter);
      if (parsed.columns.length === 0) {
        state.setError('Der Beispieldatensatz konnte nicht gelesen werden.');
        state.setLoadStatus('error');
        return;
      }
      state.setData({ columns: parsed.columns, rows: parsed.rows });
      state.setDelimiter(delimiter);
      state.setVisibleKeys([]);
      state.setSort(null);
      state.setFilters({});
      state.setSearch('');
      state.setPage(1);
      const firstNumeric = parsed.columns.find(
        (column: Column) => column.type === 'number',
      );
      state.setChartKey(firstNumeric ? firstNumeric.key : null);
      state.setLoadStatus('ready');
    } catch (error) {
      state.setError(
        error instanceof Error
          ? error.message
          : 'Der Beispieldatensatz konnte nicht gelesen werden.',
      );
      state.setLoadStatus('error');
    }
  }, [state]);

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      disabled={state.loadStatus === 'loading'}
    >
      {state.loadStatus === 'loading'
        ? 'Wird geladen …'
        : 'Beispieldatensatz laden'}
    </button>
  );
}
