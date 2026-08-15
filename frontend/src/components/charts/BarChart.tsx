'use client';

import { useMemo } from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  currency?: string;
}

export function BarChart({ data, height = 220, currency }: BarChartProps) {
  const { bars, max } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 1);
    return { bars: data, max };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {bars.map((bar) => (
        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <div className="w-full flex items-end" style={{ height: height - 28 }}>
            <div
              className="w-full rounded-t-md gold-gradient opacity-80 hover:opacity-100 transition-opacity"
              style={{ height: `${(bar.value / max) * 100}%` }}
              title={`${bar.label}: ${bar.value}${currency ? ' ' + currency : ''}`}
            />
          </div>
          <span className="text-[10px] text-muted-foreground truncate w-full text-center">
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
}
