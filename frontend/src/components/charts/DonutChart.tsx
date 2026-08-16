'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';

interface DonutChartProps {
  data: { label: string; value: number; color?: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

const DEFAULT_COLORS = ['#d4af37', '#e8c15a', '#7a5e22', '#f3e08c', '#3c2c10', '#b8932a'];

export function DonutChart({
  data,
  size = 180,
  thickness = 22,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const { t } = useTranslation();
  const segments = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return [];
    let offset = 0;
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    return data.map((d, i) => {
      const fraction = d.value / total;
      const segment = {
        ...d,
        color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        dash: fraction * circumference,
        offset,
      };
      offset += fraction * circumference;
      return segment;
    });
  }, [data, size, thickness]);

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ width: size, height: size }}>
        {t.chart_no_data}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={thickness} />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="text-xl font-bold">{centerValue}</span>}
          {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-medium ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
