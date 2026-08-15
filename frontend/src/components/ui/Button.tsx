'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode, isValidElement, cloneElement } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, asChild = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-primary text-primary-foreground hover:brightness-110 shadow-sm hover:shadow-glow-gold',
      gold: 'gold-gradient text-black hover:brightness-110 shadow-sm hover:shadow-glow-gold font-semibold',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border',
      outline: 'border border-border bg-transparent hover:bg-muted',
      ghost: 'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground',
      destructive: 'bg-destructive text-white hover:brightness-110 shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3 text-base gap-2.5',
      xl: 'px-10 py-4 text-lg gap-3',
    };

    const Comp = asChild ? (children as ReactNode) : 'button';

    const buttonProps = {
      ref,
      className: cn(baseStyles, variants[variant], sizes[size], className),
      disabled: disabled || isLoading,
      ...props,
    };

    if (asChild && isValidElement(children)) {
      return cloneElement(children as React.ReactElement, {
        ...buttonProps,
        className: cn(buttonProps.className, (children as React.ReactElement).props.className),
      });
    }

    return (
      <button {...buttonProps}>
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
