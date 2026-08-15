'use client';

import { useMemo } from 'react';
import { formatCompactMoney } from '@/lib/utils';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: ChartDataPoint[];
  height?: number;
  currency?: string;
  showArea?: boolean;
  valueFormatter?: (value: number) => string;
}

export function LineChart({
  data,
  height = 240,
  currency,
  showArea = true,
  valueFormatter,
}: LineChartProps) {
  const { points, max, min } = useMemo(() => {
    const values = data.map((d) => d.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const width = 100;
    const usableHeight = 100;
    const points = data.map((d, i) => ({
      x: data.length > 1 ? (i / (data.length - 1)) * width : 0,
      y: usableHeight - ((d.value - min) / range) * usableHeight,
      ...d,
    }));
    return { points, max, min };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height }}>
        No data available
      </div>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;
  const fmt = valueFormatter
    ? valueFormatter
    : (v: number) => (currency ? formatCompactMoney(v, currency) : String(Math.round(v)));

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{fmt(max)}</span>
      </div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ height }}
        className="w-full"
        role="img"
      >
        <defs>
          <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map((g) => (
          <line
            key={g}
            x1="0"
            y1={g}
            x2="100"
            y2={g}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="2 3"
            strokeWidth="0.3"
          />
        ))}
        {showArea && <path d={areaPath} fill="url(#chart-area)" />}
        <path d={linePath} fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="#0a0a0a" stroke="#e8c15a" strokeWidth="0.8" />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
        {points.filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1).map((p, i) => (
          <span key={i}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}
