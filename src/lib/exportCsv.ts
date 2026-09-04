import type { Column, Row } from './types';

const DANGEROUS_PREFIX = /^[=+\-@\t\r]/;
const NEEDS_QUOTING = /[",\n\r]/;

function protectFormula(value: string): string {
  if (DANGEROUS_PREFIX.test(value)) {
    return "'" + value;
  }
  return value;
}

function escapeField(value: string): string {
  const protectedValue = protectFormula(value);
  if (NEEDS_QUOTING.test(protectedValue)) {
    return '"' + protectedValue.replace(/"/g, '""') + '"';
  }
  return protectedValue;
}

export function buildCsv(rows: Row[], columns: Column[]): string {
  const header = columns.map((column) => escapeField(column.label)).join(',');
  const body = rows.map((row) =>
    columns
      .map((column) => {
        const cell = row[column.index];
        return escapeField(cell ?? '');
      })
      .join(','),
  );
  return [header, ...body].join('\r\n');
}
