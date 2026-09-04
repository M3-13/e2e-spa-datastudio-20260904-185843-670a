import type { ReactElement } from 'react';
import { useAppState } from '../state/AppState';
import styles from './ResetButton.module.css';

export function ResetButton(): ReactElement {
  const { resetAll } = useAppState();

  return (
    <button type="button" className={styles.button} onClick={resetAll}>
      Zurücksetzen
    </button>
  );
}
