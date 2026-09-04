import type { Column, Row } from './types';

export function parseCsv(
  text: string,
  delimiter: string,
): { columns: Column[]; rows: Row[] } {
  return { columns: [], rows: [] };
}
