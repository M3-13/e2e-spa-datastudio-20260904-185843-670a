import type { ReactElement } from 'react';

export function FileDropzone(): ReactElement {
  return (
    <section className="filedropzone">
      <p className="muted">CSV-Datei hierher ziehen oder zur Auswahl klicken.</p>
    </section>
  );
}
