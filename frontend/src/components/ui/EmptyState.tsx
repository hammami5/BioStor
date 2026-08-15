'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border',
        compact ? 'py-10 px-6' : 'py-20 px-6',
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-5">
          <Button
            asChild={!!actionHref}
            onClick={onAction}
            variant="gold"
          >
            {actionHref ? <a href={actionHref}>{actionLabel}</a> : actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
