import type { ReactElement } from 'react';

export function ClearDataButton(): ReactElement {
  return (
    <button type="button" className="cleardatabutton" disabled>
      Daten löschen
    </button>
  );
}
