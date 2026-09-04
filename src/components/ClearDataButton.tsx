import type { ReactElement } from 'react';
import { useAppState } from '../state/AppState';
import { clearState } from '../lib/persistence';
import styles from './ClearDataButton.module.css';

export function ClearDataButton(): ReactElement {
  const { resetAll } = useAppState();

  const handleClick = () => {
    clearState();
    resetAll();
  };

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      title="Gespeicherte CSV-Daten und Ansichtseinstellungen vollständig löschen"
    >
      Daten löschen
    </button>
  );
}
