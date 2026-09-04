import type { Column, Row } from './types';
import { isNumericColumn } from './numeric';

/** Obergrenze für die Länge eines einzelnen Feldes in Zeichen. */
export const MAX_FIELD_LENGTH = 100_000;

/**
 * Parses CSV text into columns (derived from the header row) and data rows.
 *
 * The parser handles quoted fields, embedded delimiters and line breaks
 * inside quoted fields, and escaped quotes (`""`). The first line is treated
 * as the header. Fields longer than {@link MAX_FIELD_LENGTH} characters are
 * truncated so that arbitrarily large inputs are not held in memory unbounded.
 */
export function parseCsv(
  text: string,
  delimiter: string,
): { columns: Column[]; rows: Row[] } {
  if (delimiter.length === 0) {
    delimiter = ',';
  }

  const rawRows: Row[] = [];
  let row: Row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  const appendChar = (ch: string) => {
    if (field.length < MAX_FIELD_LENGTH) {
      field += ch;
    }
  };

  const commitField = () => {
    row.push(
      field.length > MAX_FIELD_LENGTH ? field.slice(0, MAX_FIELD_LENGTH) : field,
    );
    field = '';
  };

  const commitRow = () => {
    rawRows.push(row);
    row = [];
  };

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          appendChar('"');
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      appendChar(ch);
      i += 1;
      continue;
    }

    if (ch === '"' && field.length === 0) {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (ch === delimiter) {
      commitField();
      i += 1;
      continue;
    }

    if (ch === '\n') {
      commitField();
      commitRow();
      i += 1;
      continue;
    }

    if (ch === '\r') {
      commitField();
      commitRow();
      i += 1;
      if (i < text.length && text[i] === '\n') {
        i += 1;
      }
      continue;
    }

    appendChar(ch);
    i += 1;
  }

  if (field.length > 0 || row.length > 0 || inQuotes) {
    commitField();
    commitRow();
  }

  const rows = rawRows.filter((r) => r.some((cell) => cell !== ''));

  if (rows.length === 0) {
    return { columns: [], rows: [] };
  }

  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  const columns: Column[] = headerRow.map((label, index) => ({
    key: `col-${index}`,
    label: label === '' ? `Spalte ${index + 1}` : label,
    index,
    type: 'text',
  }));

  for (let c = 0; c < columns.length; c++) {
    const values = dataRows.map((r) => (c < r.length ? r[c] : ''));
    columns[c] = {
      ...columns[c],
      type: isNumericColumn(values) ? 'number' : 'text',
    };
  }

  return { columns, rows: dataRows };
}
