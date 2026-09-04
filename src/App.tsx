import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { useAppState } from './state/AppState';
import { getVisibleColumns } from './lib/columns';
import { applyFilters } from './lib/filtering';
import { sortRows } from './lib/sorting';
import { paginate } from './lib/pagination';
import { FileDropzone } from './components/FileDropzone';
import { DataTable } from './components/DataTable';
import { Pagination } from './components/Pagination';
import { SearchBar } from './components/SearchBar';
import { ColumnSelector } from './components/ColumnSelector';
import { FilterRow } from './components/FilterRow';
import { MetricsPanel } from './components/MetricsPanel';
import { ChartsPanel } from './components/ChartsPanel';
import { ExportButton } from './components/ExportButton';
import { LoadSampleButton } from './components/LoadSampleButton';
import { ThemeToggle } from './components/ThemeToggle';
import { ResetButton } from './components/ResetButton';
import { ClearDataButton } from './components/ClearDataButton';
import { ResultCount } from './components/ResultCount';
import { StatusPanel } from './components/StatusPanel';
import { PersistenceSync } from './components/PersistenceSync';

export default function App(): ReactElement {
  const state = useAppState();
  const { data, visibleKeys, filters, search, sort, page, pageSize } = state;

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
  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort]);
  const pageRows = useMemo(
    () => paginate(sorted, page, pageSize),
    [sorted, page, pageSize],
  );

  const handleSort = (key: string) => {
    const dir: 'asc' | 'desc' =
      sort && sort.key === key && sort.dir === 'asc' ? 'desc' : 'asc';
    state.setSort({ key, dir });
  };

  return (
    <div className="app">
      <PersistenceSync />
      <header className="app-header">
        <h1>CSV-Datenstudio</h1>
        <div className="app-header__actions">
          <LoadSampleButton />
          <ThemeToggle />
          <ClearDataButton />
          <ResetButton />
        </div>
      </header>

      <main className="app-main">
        <StatusPanel />
        <FileDropzone />
        <div className="app-toolbar">
          <SearchBar />
          <ColumnSelector />
          <ExportButton columns={visibleCols} rows={sorted} />
        </div>
        <FilterRow />
        <ResultCount filtered={filtered.length} total={rows.length} />
        <DataTable
          columns={visibleCols}
          rows={pageRows}
          sort={sort}
          onSort={handleSort}
        />
        <Pagination />
        <MetricsPanel columns={visibleCols} rows={filtered} />
        <ChartsPanel columns={visibleCols} rows={filtered} />
      </main>

      <footer className="app-footer">
        CSV-Datenstudio — Datenauswertung vollständig im Browser.
      </footer>
    </div>
  );
}
