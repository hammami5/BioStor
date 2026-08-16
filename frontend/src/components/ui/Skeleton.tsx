'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'animate-pulse rounded-lg bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-shimmer',
      className
    )}
    {...props}
  />
));
Skeleton.displayName = 'Skeleton';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <svg className={cn('animate-spin text-primary', sizes[size], className)} viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

interface PageLoaderProps {
  label?: string;
}

const PageLoader = ({ label }: PageLoaderProps) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <Spinner size="lg" />
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export { Skeleton, Spinner, PageLoader };
