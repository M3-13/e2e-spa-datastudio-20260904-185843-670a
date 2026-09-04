import type { ReactElement } from 'react';
import styles from './ResultCount.module.css';

export interface ResultCountProps {
  filtered: number;
  total: number;
}

function formatCount(value: number): string {
  return value.toLocaleString('de-DE');
}

export function ResultCount(props: ResultCountProps): ReactElement {
  const { filtered, total } = props;

  return (
    <p className={styles.resultcount} aria-live="polite">
      <span className={styles.filtered}>{formatCount(filtered)}</span>
      <span className={styles.separator}>von</span>
      <span className={styles.total}>{formatCount(total)}</span>
      <span className={styles.label}>Zeilen</span>
    </p>
  );
}
