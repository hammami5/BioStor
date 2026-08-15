'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  loading?: boolean;
}

export function DataTable<T>({ columns, data, rowKey, onRowClick, empty, loading }: TableProps<T>) {
  const hideClass = (below?: 'sm' | 'md' | 'lg' | 'xl') => {
    if (!below) return '';
    return { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' }[below];
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap',
                  col.className,
                  hideClass(col.hideBelow)
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3.5', col.className, hideClass(col.hideBelow))}>
                      <div className="h-4 rounded bg-muted animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            : data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-border/40 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-muted/40'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3.5', col.className, hideClass(col.hideBelow))}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      {!loading && data.length === 0 && empty}
    </div>
  );
}
