import type { ReactElement } from 'react';
import type { Column, Row, SortState } from '../lib/types';

export interface DataTableProps {
  columns: Column[];
  rows: Row[];
  sort: SortState | null;
  onSort: (key: string) => void;
}

export function DataTable(props: DataTableProps): ReactElement {
  void props;
  return (
    <section className="datatable">
      <p className="muted">Keine Daten geladen.</p>
    </section>
  );
}
