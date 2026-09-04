import type { ReactElement } from 'react';

export interface ResultCountProps {
  filtered: number;
  total: number;
}

export function ResultCount(props: ResultCountProps): ReactElement {
  void props;
  return (
    <p className="resultcount muted">
      <span className="resultcount__filtered">0</span> von{' '}
      <span className="resultcount__total">0</span> Datensätzen
    </p>
  );
}
