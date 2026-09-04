import type { AppState } from '../state/AppState';
import type { Column, CsvData, Filter, Row, SortState } from './types';

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

// After `clearState()` the reset state must NOT be written back to storage by
// the auto-save effect in PersistenceSync. This one-shot flag suppresses exactly
// the next `saveState()` call triggered by `resetAll()`.
let skipNextSave = false;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isColumn(value: unknown): value is Column {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.key === 'string' &&
    typeof value.label === 'string' &&
    typeof value.index === 'number' &&
    (value.type === 'text' || value.type === 'number')
  );
}

function isRow(value: unknown): value is Row {
  return Array.isArray(value) && value.every((cell) => typeof cell === 'string');
}

function isCsvData(value: unknown): value is CsvData {
  if (!isRecord(value)) {
    return false;
  }
  return (
    Array.isArray(value.columns) &&
    value.columns.every(isColumn) &&
    Array.isArray(value.rows) &&
    value.rows.every(isRow)
  );
}

function isSortState(value: unknown): value is SortState {
  if (!isRecord(value)) {
    return false;
  }
  return typeof value.key === 'string' && (value.dir === 'asc' || value.dir === 'desc');
}

function isFilter(value: unknown): value is Filter {
  if (!isRecord(value)) {
    return false;
  }
  const ops: ReadonlyArray<string> = ['contains', 'gt', 'lt', 'eq', 'between'];
  return (
    typeof value.op === 'string' &&
    ops.includes(value.op) &&
    typeof value.value === 'string' &&
    (value.value2 === undefined || typeof value.value2 === 'string')
  );
}

function isFilters(value: unknown): value is Record<string, Filter> {
  if (!isRecord(value)) {
    return false;
  }
  return Object.values(value).every(isFilter);
}

function isPositiveInt(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 1
  );
}

export function saveState(s: AppState): void {
  if (skipNextSave) {
    skipNextSave = false;
    return;
  }
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
    if (!isRecord(parsed)) {
      return null;
    }

    const result: Partial<AppState> = {};

    if (parsed.data === null || isCsvData(parsed.data)) {
      result.data = parsed.data as CsvData | null;
    }
    if (parsed.delimiter === null || typeof parsed.delimiter === 'string') {
      result.delimiter = parsed.delimiter as string | null;
    }
    if (
      Array.isArray(parsed.visibleKeys) &&
      parsed.visibleKeys.every((key) => typeof key === 'string')
    ) {
      result.visibleKeys = parsed.visibleKeys as string[];
    }
    if (parsed.sort === null || isSortState(parsed.sort)) {
      result.sort = parsed.sort as SortState | null;
    }
    if (isFilters(parsed.filters)) {
      result.filters = parsed.filters as Record<string, Filter>;
    }
    if (typeof parsed.search === 'string') {
      result.search = parsed.search;
    }
    if (isPositiveInt(parsed.page)) {
      result.page = parsed.page;
    }
    if (isPositiveInt(parsed.pageSize)) {
      result.pageSize = parsed.pageSize;
    }
    if (parsed.theme === 'light' || parsed.theme === 'dark') {
      result.theme = parsed.theme;
    }
    if (parsed.chartKey === null || typeof parsed.chartKey === 'string') {
      result.chartKey = parsed.chartKey as string | null;
    }

    if (Object.keys(result).length === 0) {
      return null;
    }
    return result;
  } catch {
    return null;
  }
}

export function clearState(): void {
  skipNextSave = true;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — best-effort removal.
  }
}
