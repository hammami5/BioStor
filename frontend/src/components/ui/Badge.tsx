'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'destructive'
    | 'outline'
    | 'gold';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', dot, children, ...props }, ref) => {
    const variants = {
      default: 'bg-muted text-muted-foreground',
      primary: 'bg-primary/15 text-primary',
      secondary: 'bg-secondary text-secondary-foreground',
      success: 'bg-emerald-500/15 text-emerald-400',
      warning: 'bg-amber-500/15 text-amber-400',
      destructive: 'bg-red-500/15 text-red-400',
      outline: 'border border-border bg-transparent text-muted-foreground',
      gold: 'gold-gradient text-black',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-sm gap-1.5',
      lg: 'px-3 py-1.5 text-base gap-2',
    };

    const dotColors: Record<string, string> = {
      default: 'bg-muted-foreground',
      primary: 'bg-primary',
      secondary: 'bg-secondary-foreground',
      success: 'bg-emerald-400',
      warning: 'bg-amber-400',
      destructive: 'bg-red-400',
      outline: 'bg-current',
      gold: 'bg-black',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full border-0 whitespace-nowrap',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-[10px]',
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt || fallback || 'Avatar'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <div
          className={cn(
            'w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-muted text-foreground font-semibold',
            sizes[size]
          )}
        >
          {fallback || alt?.charAt(0).toUpperCase() || '?'}
        </div>
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'w-full h-px' : 'h-full w-px',
        className
      )}
      {...props}
    />
  )
);

Separator.displayName = 'Separator';

export { Badge, Avatar, Separator };
