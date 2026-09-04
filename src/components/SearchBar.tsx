import type { ReactElement } from 'react';
import { useAppState } from '../state/AppState';
import styles from './SearchBar.module.css';

export function SearchBar(): ReactElement {
  const { search, setSearch } = useAppState();

  return (
    <div className={styles.searchbar}>
      <input
        type="search"
        className={styles.input}
        placeholder="Suchen …"
        aria-label="Volltextsuche"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
    </div>
  );
}
