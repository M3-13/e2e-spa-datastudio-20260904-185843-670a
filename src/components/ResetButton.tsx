import type { ReactElement } from 'react';

export function ResetButton(): ReactElement {
  return (
    <button type="button" className="resetbutton" disabled>
      Zurücksetzen
    </button>
  );
}
