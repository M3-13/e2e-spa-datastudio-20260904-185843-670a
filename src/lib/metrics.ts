import type { Metric } from './types';

/**
 * Computes descriptive metrics over a single column of raw cell values.
 *
 * - `count`   — number of values that parse as a finite number
 * - `sum`     — sum of those values
 * - `mean`    — arithmetic mean (0 when there are no numeric values)
 * - `min`     — smallest numeric value (0 when there are none)
 * - `max`     — largest numeric value (0 when there are none)
 * - `missing` — number of empty / whitespace-only cells
 *
 * Non-numeric, non-empty values are ignored and do not influence any metric.
 */
export function computeMetrics(values: string[]): Metric {
  let count = 0;
  let sum = 0;
  let min = 0;
  let max = 0;
  let missing = 0;

  for (const raw of values) {
    if (raw == null) {
      missing += 1;
      continue;
    }

    const trimmed = raw.trim();
    if (trimmed === '') {
      missing += 1;
      continue;
    }

    const num = Number(trimmed);
    if (Number.isNaN(num) || !Number.isFinite(num)) {
      continue;
    }

    if (count === 0) {
      min = num;
      max = num;
    } else {
      if (num < min) {
        min = num;
      }
      if (num > max) {
        max = num;
      }
    }

    sum += num;
    count += 1;
  }

  const mean = count > 0 ? sum / count : 0;

  return { count, sum, mean, min, max, missing };
}
