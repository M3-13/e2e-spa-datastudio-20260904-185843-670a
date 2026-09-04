import type { ReactElement } from 'react';

export function StatusPanel(): ReactElement {
  return (
    <div className="statuspanel">
      <p className="muted">Noch keine Daten geladen.</p>
    </div>
  );
}
