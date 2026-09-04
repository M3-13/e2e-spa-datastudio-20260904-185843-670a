import type { ReactElement } from 'react';
import type { Column, Row } from '../lib/types';
import { computeMetrics } from '../lib/metrics';
import styles from './MetricsPanel.module.css';

export interface MetricsPanelProps {
  columns: Column[];
  rows: Row[];
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  if (Number.isInteger(value)) {
    return value.toLocaleString('de-DE');
  }
  const rounded = Math.round(value * 10000) / 10000;
  return rounded.toLocaleString('de-DE', { maximumFractionDigits: 4 });
}

export function MetricsPanel(props: MetricsPanelProps): ReactElement {
  const { columns, rows } = props;
  const numericColumns = columns.filter((column) => column.type === 'number');

  if (numericColumns.length === 0) {
    return (
      <section className={styles.panel}>
        <h2 className={styles.title}>Kennzahlen</h2>
        <p className={styles.empty}>Keine numerischen Spalten vorhanden.</p>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>Kennzahlen</h2>
      <div className={styles.cards}>
        {numericColumns.map((column) => {
          const values = rows.map((row) => row[column.index] ?? '');
          const metric = computeMetrics(values);
          return (
            <article key={column.key} className={styles.card}>
              <h3 className={styles.columnLabel}>{column.label}</h3>
              <dl className={styles.grid}>
                <div className={styles.item}>
                  <dt className={styles.metricName}>Anzahl</dt>
                  <dd className={styles.metricValue}>{metric.count}</dd>
                </div>
                <div className={styles.item}>
                  <dt className={styles.metricName}>Summe</dt>
                  <dd className={styles.metricValue}>
                    {formatNumber(metric.sum)}
                  </dd>
                </div>
                <div className={styles.item}>
                  <dt className={styles.metricName}>Mittelwert</dt>
                  <dd className={styles.metricValue}>
                    {formatNumber(metric.mean)}
                  </dd>
                </div>
                <div className={styles.item}>
                  <dt className={styles.metricName}>Minimum</dt>
                  <dd className={styles.metricValue}>
                    {formatNumber(metric.min)}
                  </dd>
                </div>
                <div className={styles.item}>
                  <dt className={styles.metricName}>Maximum</dt>
                  <dd className={styles.metricValue}>
                    {formatNumber(metric.max)}
                  </dd>
                </div>
                <div className={styles.item}>
                  <dt className={styles.metricName}>Fehlende Werte</dt>
                  <dd className={styles.metricValue}>{metric.missing}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
