import { useEffect, useState } from 'react';
import { useAppState } from '../state/AppState';
import { loadState, saveState } from '../lib/persistence';

export function PersistenceSync(): null {
  const state = useAppState();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let loaded;
    try {
      loaded = loadState();
    } catch {
      loaded = null;
    }

    if (loaded) {
      if (loaded.data !== undefined && loaded.data !== null) {
        state.setData(loaded.data);
        state.setLoadStatus('ready');
      }
      if (loaded.delimiter !== undefined) {
        state.setDelimiter(loaded.delimiter);
      }
      if (loaded.visibleKeys !== undefined) {
        state.setVisibleKeys(loaded.visibleKeys);
      }
      if (loaded.sort !== undefined) {
        state.setSort(loaded.sort);
      }
      if (loaded.filters !== undefined) {
        state.setFilters(loaded.filters);
      }
      if (loaded.search !== undefined) {
        state.setSearch(loaded.search);
      }
      if (loaded.page !== undefined) {
        state.setPage(loaded.page);
      }
      if (loaded.pageSize !== undefined) {
        state.setPageSize(loaded.pageSize);
      }
      if (loaded.theme !== undefined) {
        state.setTheme(loaded.theme);
      }
      if (loaded.chartKey !== undefined) {
        state.setChartKey(loaded.chartKey);
      }
    }

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    try {
      saveState(state);
    } catch {
      // Ignore — persistence is best-effort and must never break the app.
    }
  }, [state, hydrated]);

  return null;
}
