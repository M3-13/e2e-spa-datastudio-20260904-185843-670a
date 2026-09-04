import type { ReactElement } from 'react';
import { useAppState } from '../state/AppState';
import styles from './StatusPanel.module.css';

export function StatusPanel(): ReactElement | null {
  const { data, loadStatus, error, setLoadStatus, setError } = useAppState();

  const handleRetry = () => {
    setError(null);
    setLoadStatus('idle');
  };

  if (loadStatus === 'loading') {
    return (
      <div className={styles.panel} role="status" aria-live="polite">
        <svg
          className={styles.icon}
          viewBox="0 0 32 32"
          width="32"
          height="32"
          aria-hidden="true"
        >
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.25"
          />
          <path
            d="M16 4a12 12 0 0 1 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <h2 className={styles.title}>Daten werden geladen …</h2>
        <p className={styles.text}>
          Bitte warten Sie, während die CSV-Datei eingelesen und aufbereitet
          wird.
        </p>
      </div>
    );
  }

  if (loadStatus === 'error') {
    return (
      <div className={styles.panel} role="alert">
        <svg
          className={styles.iconError}
          viewBox="0 0 32 32"
          width="32"
          height="32"
          aria-hidden="true"
        >
          <path
            d="M16 5 28 27H4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <line
            x1="16"
            y1="12"
            x2="16"
            y2="19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="23" r="1.5" fill="currentColor" />
        </svg>
        <h2 className={styles.title}>Datei konnte nicht geladen werden</h2>
        <p className={styles.text}>{error}</p>
        <p className={styles.hint}>
          Mögliche Ursachen: Die Datei ist zu groß, leer oder nicht als CSV
          lesbar. Bitte wählen Sie eine andere Datei aus.
        </p>
        <button type="button" className={styles.button} onClick={handleRetry}>
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.panel}>
        <svg
          className={styles.icon}
          viewBox="0 0 32 32"
          width="32"
          height="32"
          aria-hidden="true"
        >
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="16"
            y1="12"
            x2="16"
            y2="12.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="16"
            y1="16"
            x2="16"
            y2="21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <h2 className={styles.title}>Keine Daten geladen</h2>
        <p className={styles.text}>
          Ziehen Sie eine CSV-Datei in die Ablage oder wählen Sie eine Datei
          aus, um loszulegen. Alternativ können Sie den Beispieldatensatz
          laden.
        </p>
      </div>
    );
  }

  return null;
}
