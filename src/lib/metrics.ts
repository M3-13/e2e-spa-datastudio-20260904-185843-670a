import type { Metric } from './types';

export function computeMetrics(values: string[]): Metric {
  return { count: 0, sum: 0, mean: 0, min: 0, max: 0, missing: 0 };
}
