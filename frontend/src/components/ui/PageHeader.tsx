'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6 flex-wrap', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  change?: { value: number; positive: boolean } | null;
  hint?: string;
}

export function StatCard({ label, value, icon, change, hint }: StatCardProps) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
      </div>
      {(change || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={cn(
                'font-medium',
                change.positive ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {change.positive ? '↑' : '↓'} {Math.abs(change.value)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
}

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export function Toolbar({ children, className }: ToolbarProps) {
  return <div className={cn('flex items-center gap-3 flex-wrap', className)}>{children}</div>;
}
