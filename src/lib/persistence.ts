import type { AppState } from '../state/AppState';

const STORAGE_KEY = 'csv-datenstudio.state';

export type PersistedState = Pick<
  AppState,
  | 'data'
  | 'delimiter'
  | 'visibleKeys'
  | 'sort'
  | 'filters'
  | 'search'
  | 'page'
  | 'pageSize'
  | 'theme'
  | 'chartKey'
>;

function pickState(s: AppState): PersistedState {
  return {
    data: s.data,
    delimiter: s.delimiter,
    visibleKeys: s.visibleKeys,
    sort: s.sort,
    filters: s.filters,
    search: s.search,
    page: s.page,
    pageSize: s.pageSize,
    theme: s.theme,
    chartKey: s.chartKey,
  };
}

function isValidState(value: unknown): value is Partial<PersistedState> {
  return value !== null && typeof value === 'object';
}

export function saveState(s: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pickState(s)));
  } catch {
    // Storage may be unavailable (private mode / quota) — persistence is best-effort.
  }
}

export function loadState(): Partial<AppState> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isValidState(parsed) || Object.keys(parsed).length === 0) {
      return null;
    }
    return parsed as Partial<AppState>;
  } catch {
    return null;
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — best-effort removal.
  }
}
