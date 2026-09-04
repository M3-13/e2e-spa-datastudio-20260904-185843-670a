import type { ReactElement } from 'react';
import type { Column, Row } from '../lib/types';
import { buildCsv } from '../lib/exportCsv';
import styles from './ExportButton.module.css';

export interface ExportButtonProps {
  columns: Column[];
  rows: Row[];
}

export function ExportButton(props: ExportButtonProps): ReactElement {
  const { columns, rows } = props;
  const disabled = columns.length === 0;

  const handleClick = () => {
    const csv = buildCsv(rows, columns);
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      className={styles.exportButton}
      onClick={handleClick}
      disabled={disabled}
    >
      Export
    </button>
  );
}
