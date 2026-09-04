import type { ReactElement } from 'react';

export function SearchBar(): ReactElement {
  return (
    <div className="searchbar">
      <input type="search" placeholder="Suchen …" disabled />
    </div>
  );
}
