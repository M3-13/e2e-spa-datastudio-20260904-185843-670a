/**
 * Determines whether a column holds exclusively numeric values.
 *
 * A column is numeric when at least one cell contains a value and every
 * non-empty cell parses as a finite number. Empty / whitespace-only cells are
 * treated as missing values and therefore do not disqualify the column.
 */
export function isNumericColumn(values: string[]): boolean {
  if (!Array.isArray(values) || values.length === 0) {
    return false;
  }

  let seenValue = false;
  for (const raw of values) {
    if (raw == null) {
      continue;
    }
    const trimmed = raw.trim();
    if (trimmed === '') {
      continue;
    }
    seenValue = true;
    const num = Number(trimmed);
    if (Number.isNaN(num) || !Number.isFinite(num)) {
      return false;
    }
  }

  return seenValue;
}
