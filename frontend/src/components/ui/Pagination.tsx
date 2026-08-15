'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, total, pageSize, onPageChange, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    }
  }

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <p className="text-sm text-muted-foreground">
        Showing <span className="text-foreground font-medium">{(page - 1) * pageSize + 1}</span>–
        <span className="text-foreground font-medium">{Math.min(page * pageSize, total)}</span> of{' '}
        <span className="text-foreground font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) => {
          const prev = pages[i - 1];
          const showGap = prev && p - prev > 1;
          return (
            <span key={p} className="flex items-center">
              {showGap && <span className="px-1 text-muted-foreground">…</span>}
              <button
                onClick={() => onPageChange(p)}
                className={cn(
                  'min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {p}
              </button>
            </span>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
