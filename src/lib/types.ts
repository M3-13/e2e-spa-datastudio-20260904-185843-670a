export type Row = string[];

export type Column = {
  key: string;
  label: string;
  index: number;
  type: 'text' | 'number';
};

export type CsvData = {
  columns: Column[];
  rows: Row[];
};

export type SortState = {
  key: string;
  dir: 'asc' | 'desc';
};

export type Filter = {
  op: 'contains' | 'gt' | 'lt' | 'eq' | 'between';
  value: string;
  value2?: string;
};

export type Metric = {
  count: number;
  sum: number;
  mean: number;
  min: number;
  max: number;
  missing: number;
};
