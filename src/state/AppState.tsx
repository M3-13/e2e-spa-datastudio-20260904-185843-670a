import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { CsvData, Filter, SortState } from '../lib/types';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';
export type Theme = 'light' | 'dark';

export interface AppState {
  data: CsvData | null;
  delimiter: string | null;
  loadStatus: LoadStatus;
  error: string | null;
  visibleKeys: string[];
  sort: SortState | null;
  filters: Record<string, Filter>;
  search: string;
  page: number;
  pageSize: number;
  theme: Theme;
  chartKey: string | null;
  setData: (data: CsvData | null) => void;
  setDelimiter: (delimiter: string | null) => void;
  setLoadStatus: (loadStatus: LoadStatus) => void;
  setError: (error: string | null) => void;
  setVisibleKeys: (visibleKeys: string[]) => void;
  setSort: (sort: SortState | null) => void;
  setFilters: (filters: Record<string, Filter>) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTheme: (theme: Theme) => void;
  setChartKey: (chartKey: string | null) => void;
  resetAll: () => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CsvData | null>(null);
  const [delimiter, setDelimiter] = useState<string | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [sort, setSort] = useState<SortState | null>(null);
  const [filters, setFilters] = useState<Record<string, Filter>>({});
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [theme, setTheme] = useState<Theme>('light');
  const [chartKey, setChartKey] = useState<string | null>(null);

  const resetAll = useCallback(() => {
    setData(null);
    setDelimiter(null);
    setLoadStatus('idle');
    setError(null);
    setVisibleKeys([]);
    setSort(null);
    setFilters({});
    setSearch('');
    setPage(1);
    setPageSize(25);
    setTheme('light');
    setChartKey(null);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      data,
      delimiter,
      loadStatus,
      error,
      visibleKeys,
      sort,
      filters,
      search,
      page,
      pageSize,
      theme,
      chartKey,
      setData,
      setDelimiter,
      setLoadStatus,
      setError,
      setVisibleKeys,
      setSort,
      setFilters,
      setSearch,
      setPage,
      setPageSize,
      setTheme,
      setChartKey,
      resetAll,
    }),
    [
      data,
      delimiter,
      loadStatus,
      error,
      visibleKeys,
      sort,
      filters,
      search,
      page,
      pageSize,
      theme,
      chartKey,
      resetAll,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (ctx === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}
