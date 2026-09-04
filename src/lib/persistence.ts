import type { AppState } from '../state/AppState';

export function loadState(): Partial<AppState> | null {
  return null;
}

export function saveState(s: AppState): void {
  void s;
}

export function clearState(): void {}
