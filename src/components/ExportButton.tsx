import type { ReactElement } from 'react';
import type { Column, Row } from '../lib/types';

export interface ExportButtonProps {
  columns: Column[];
  rows: Row[];
}

export function ExportButton(props: ExportButtonProps): ReactElement {
  void props;
  return (
    <button type="button" className="exportbutton" disabled>
      Export
    </button>
  );
}
