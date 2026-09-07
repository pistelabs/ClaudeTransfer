import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Buttons joined into one control: inner corners flattened, no gap between. */
function ButtonGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="button-group"
      role="group"
      className={cn(
        'inline-flex items-stretch',
        '[&>[data-slot=button]:not(:first-child)]:rounded-l-none [&>[data-slot=button]:not(:last-child)]:rounded-r-none',
        className,
      )}
      {...props}
    />
  );
}

export { ButtonGroup };
