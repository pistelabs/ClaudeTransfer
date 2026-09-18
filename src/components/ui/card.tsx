import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * shadcn's Card. CardAction spans both header rows in the trailing column, as
 * shadcn's does; `card--divided` (kept as a plain class, set by callers) rules
 * off the header from the content.
 */
function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-3.5 rounded-[var(--r-input)] border border-[var(--n-150)] bg-card p-4 text-[var(--n-800)] shadow-[0_1px_2px_rgb(10_10_10/4%)]',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('col-start-1 text-[13.5px]/[1.3] font-semibold text-[var(--n-950)]', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('col-start-1 text-[12px]/[1.4] text-[var(--n-450)]', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 self-center justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('flex flex-col gap-3', className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent };
