import { Label as LabelPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** shadcn's Label, on Radix so clicking one focuses its control. */
function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex select-none items-center gap-1 text-[12px]/none font-medium text-[var(--n-700)] group-data-[disabled=true]:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
