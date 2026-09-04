import type { ReactElement } from 'react';
import type { Column, Row } from '../lib/types';

export interface ChartsPanelProps {
  columns: Column[];
  rows: Row[];
}

export function ChartsPanel(props: ChartsPanelProps): ReactElement {
  void props;
  return (
    <section className="chartspanel">
      <p className="muted">Diagramme</p>
    </section>
  );
}
