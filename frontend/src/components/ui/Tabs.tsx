'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string; count?: number }[];
  className?: string;
}

export function Tabs({ value, onValueChange, items, className }: TabsProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onValueChange(item.value)}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
            value === item.value
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {item.label}
          {typeof item.count === 'number' && item.count > 0 && (
            <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

interface TabContentProps {
  value: string;
  activeValue: string;
  children: ReactNode;
}

export function TabContent({ value, activeValue, children }: TabContentProps) {
  if (value !== activeValue) return null;
  return <div className="animate-fade-in">{children}</div>;
}

export function useTabs(initial: string) {
  const [value, setValue] = useState(initial);
  return { value, setValue };
}
