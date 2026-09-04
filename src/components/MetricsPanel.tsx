import type { ReactElement } from 'react';
import type { Column, Row } from '../lib/types';

export interface MetricsPanelProps {
  columns: Column[];
  rows: Row[];
}

export function MetricsPanel(props: MetricsPanelProps): ReactElement {
  void props;
  return (
    <section className="metricspanel">
      <p className="muted">Kennzahlen</p>
    </section>
  );
}
