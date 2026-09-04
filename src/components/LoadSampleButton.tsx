import type { ReactElement } from 'react';

export function LoadSampleButton(): ReactElement {
  return (
    <button type="button" className="loadsamplebutton" disabled>
      Beispieldatensatz laden
    </button>
  );
}
