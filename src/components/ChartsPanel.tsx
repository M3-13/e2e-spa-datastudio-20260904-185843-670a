import { useMemo } from 'react';
import type { ChangeEvent, ReactElement } from 'react';
import { useAppState } from '../state/AppState';
import type { Column, Row } from '../lib/types';
import styles from './ChartsPanel.module.css';

export interface ChartsPanelProps {
  columns: Column[];
  rows: Row[];
}

const WIDTH = 640;
const HEIGHT = 280;
const MARGIN = { top: 16, right: 16, bottom: 44, left: 56 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;
const MAX_BARS = 12;
const HIST_BINS = 10;
const MAX_LINE_POINTS = 400;

function columnValues(rows: Row[], column: Column): string[] {
  return rows.map((row) => row[column.index] ?? '');
}

function toNumbers(values: string[]): number[] {
  const out: number[] = [];
  for (const raw of values) {
    const trimmed = raw.trim();
    if (trimmed === '') continue;
    const num = Number(trimmed);
    if (Number.isFinite(num)) out.push(num);
  }
  return out;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '';
  if (Object.is(value, -0)) value = 0;
  if (Number.isInteger(value)) return String(value);
  const abs = Math.abs(value);
  if (abs >= 1000) return value.toFixed(0);
  if (abs >= 1) {
    const fixed = value.toFixed(1);
    return fixed.replace(/\.0$/, '');
  }
  return value.toPrecision(2);
}

function truncateLabel(label: string, max = 10): string {
  if (label.length <= max) return label;
  return `${label.slice(0, max)}…`;
}

function niceStep(range: number, target: number): number {
  const raw = range / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let step: number;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * mag;
}

function niceScale(
  min: number,
  max: number,
  tickCount = 5,
): { min: number; max: number; ticks: number[] } {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1, ticks: [0, 1] };
  }
  if (min === max) {
    const pad = max === 0 ? 1 : Math.abs(max) * 0.1;
    min -= pad;
    max += pad;
  }
  const step = niceStep(max - min, tickCount);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step * 1e-9; v += step) {
    ticks.push(Number(v.toFixed(decimals)));
  }
  return { min: lo, max: hi, ticks };
}

interface BarDatum {
  label: string;
  count: number;
}

function frequencyBars(values: string[], maxBars = MAX_BARS): BarDatum[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const key = raw.trim();
    if (key === '') continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxBars);
}

function histogramBars(values: number[], binCount = HIST_BINS): BarDatum[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return [{ label: formatNumber(min), count: values.length }];
  }
  const width = (max - min) / binCount;
  const bins = new Array<number>(binCount).fill(0);
  for (const value of values) {
    let idx = Math.floor((value - min) / width);
    if (idx >= binCount) idx = binCount - 1;
    bins[idx] += 1;
  }
  return bins.map((count, i) => ({
    label: `${formatNumber(min + i * width)}–${formatNumber(min + (i + 1) * width)}`,
    count,
  }));
}

interface LinePoint {
  x: number;
  y: number;
}

function linePoints(values: number[], maxPoints = MAX_LINE_POINTS): LinePoint[] {
  const points: LinePoint[] = [];
  for (let i = 0; i < values.length; i++) {
    if (Number.isFinite(values[i])) points.push({ x: i, y: values[i] });
  }
  if (points.length <= maxPoints) return points;
  const stride = points.length / maxPoints;
  const out: LinePoint[] = [];
  for (let k = 0; k < maxPoints; k++) {
    out.push(points[Math.floor(k * stride)]);
  }
  return out;
}

interface ChartCardProps {
  title: string;
  children?: ReactElement | null;
}

function ChartCard({ title, children }: ChartCardProps): ReactElement {
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>{title}</h3>
      {children}
    </div>
  );
}

function EmptyHint({ text }: { text: string }): ReactElement {
  return <p className={styles.empty}>{text}</p>;
}

function BarChart({ column, rows }: { column: Column; rows: Row[] }): ReactElement {
  const bars = useMemo<BarDatum[]>(() => {
    const values = columnValues(rows, column);
    if (column.type === 'number') {
      return histogramBars(toNumbers(values));
    }
    return frequencyBars(values);
  }, [column, rows]);

  if (bars.length === 0) {
    return (
      <ChartCard title="Balkendiagramm">
        <EmptyHint text="Keine auswertbaren Werte in dieser Spalte." />
      </ChartCard>
    );
  }

  const maxCount = Math.max(...bars.map((bar) => bar.count));
  const scale = niceScale(0, maxCount);
  const slot = PLOT_W / bars.length;
  const barWidth = slot * 0.8;

  const y = (value: number): number =>
    MARGIN.top + PLOT_H - ((value - scale.min) / (scale.max - scale.min)) * PLOT_H;

  return (
    <ChartCard title="Balkendiagramm">
      <svg
        className={styles.svg}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Balkendiagramm für Spalte ${column.label}`}
      >
        {scale.ticks.map((tick) => (
          <g key={tick}>
            <line
              className={styles.gridLine}
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y(tick)}
              y2={y(tick)}
            />
            <text
              className={styles.axisText}
              x={MARGIN.left - 8}
              y={y(tick) + 3}
              textAnchor="end"
            >
              {formatNumber(tick)}
            </text>
          </g>
        ))}
        <line
          className={styles.axisLine}
          x1={MARGIN.left}
          x2={MARGIN.left}
          y1={MARGIN.top}
          y2={MARGIN.top + PLOT_H}
        />
        <line
          className={styles.axisLine}
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={MARGIN.top + PLOT_H}
          y2={MARGIN.top + PLOT_H}
        />
        {bars.map((bar, i) => {
          const x = MARGIN.left + i * slot + (slot - barWidth) / 2;
          const height = y(0) - y(bar.count);
          return (
            <g key={`${bar.label}-${i}`}>
              <rect
                className={styles.bar}
                x={x}
                y={y(bar.count)}
                width={barWidth}
                height={Math.max(0, height)}
                rx={4}
              >
                <title>{`${bar.label}: ${bar.count}`}</title>
              </rect>
              <text
                className={styles.axisText}
                x={x + barWidth / 2}
                y={MARGIN.top + PLOT_H + 16}
                textAnchor="middle"
              >
                {truncateLabel(bar.label)}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
}

function LineChart({ column, rows }: { column: Column; rows: Row[] }): ReactElement {
  const points = useMemo<LinePoint[]>(() => {
    if (column.type !== 'number') return [];
    const values = columnValues(rows, column);
    return linePoints(toNumbers(values));
  }, [column, rows]);

  if (column.type !== 'number') {
    return (
      <ChartCard title="Liniendiagramm">
        <EmptyHint text="Für Textspalten ist kein Liniendiagramm verfügbar – wählen Sie eine numerische Spalte." />
      </ChartCard>
    );
  }

  if (points.length < 2) {
    return (
      <ChartCard title="Liniendiagramm">
        <EmptyHint text="Zu wenige numerische Werte für ein Liniendiagramm." />
      </ChartCard>
    );
  }

  const yMin = Math.min(...points.map((p) => p.y));
  const yMax = Math.max(...points.map((p) => p.y));
  const scale = niceScale(yMin, yMax);
  const xMax = Math.max(...points.map((p) => p.x));

  const x = (value: number): number =>
    MARGIN.left + (xMax === 0 ? 0 : (value / xMax) * PLOT_W);
  const y = (value: number): number =>
    MARGIN.top + PLOT_H - ((value - scale.min) / (scale.max - scale.min)) * PLOT_H;

  const polyline = points
    .map((p) => `${x(p.x).toFixed(2)},${y(p.y).toFixed(2)}`)
    .join(' ');

  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * xMax));

  return (
    <ChartCard title="Liniendiagramm">
      <svg
        className={styles.svg}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Liniendiagramm für Spalte ${column.label}`}
      >
        {scale.ticks.map((tick) => (
          <g key={tick}>
            <line
              className={styles.gridLine}
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y(tick)}
              y2={y(tick)}
            />
            <text
              className={styles.axisText}
              x={MARGIN.left - 8}
              y={y(tick) + 3}
              textAnchor="end"
            >
              {formatNumber(tick)}
            </text>
          </g>
        ))}
        <line
          className={styles.axisLine}
          x1={MARGIN.left}
          x2={MARGIN.left}
          y1={MARGIN.top}
          y2={MARGIN.top + PLOT_H}
        />
        <line
          className={styles.axisLine}
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={MARGIN.top + PLOT_H}
          y2={MARGIN.top + PLOT_H}
        />
        {xTicks.map((tick) => (
          <text
            key={tick}
            className={styles.axisText}
            x={x(tick)}
            y={MARGIN.top + PLOT_H + 16}
            textAnchor="middle"
          >
            {formatNumber(tick)}
          </text>
        ))}
        <polyline className={styles.line} points={polyline} />
      </svg>
    </ChartCard>
  );
}

export function ChartsPanel(props: ChartsPanelProps): ReactElement {
  const { columns, rows } = props;
  const { chartKey, setChartKey } = useAppState();

  const selected = useMemo(
    () => columns.find((col) => col.key === chartKey) ?? null,
    [columns, chartKey],
  );

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setChartKey(event.target.value === '' ? null : event.target.value);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Diagramme</h2>
        <label className={styles.selectLabel}>
          <span>Spalte</span>
          <select
            className={styles.select}
            value={chartKey ?? ''}
            onChange={handleChange}
          >
            <option value="">Spalte auswählen…</option>
            {columns.map((col) => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {columns.length === 0 ? (
        <EmptyHint text="Keine Daten geladen. Laden Sie eine CSV-Datei, um Diagramme zu sehen." />
      ) : !selected ? (
        <EmptyHint text="Wählen Sie eine Spalte aus, um Balken- und Liniendiagramm zu sehen." />
      ) : (
        <div className={styles.charts}>
          <BarChart column={selected} rows={rows} />
          <LineChart column={selected} rows={rows} />
        </div>
      )}
    </section>
  );
}
