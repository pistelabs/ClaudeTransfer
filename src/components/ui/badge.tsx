import { Slot } from 'radix-ui';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** shadcn's Badge, plus the `success` and `warning` this shop's states need. */
const badgeVariants = cva(
  'inline-flex items-center gap-[5px] whitespace-nowrap rounded-[var(--r-control)] border border-transparent px-2 py-0.5 text-[11.5px]/[1.45] font-semibold [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-[var(--n-60)] text-[var(--n-600)]',
        outline: 'border-[var(--n-150)] bg-white text-[var(--n-600)]',
        success: 'border-[var(--success-border)] bg-[var(--success-tint)] text-[var(--success-text)]',
        warning: 'border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]',
        destructive: 'border-[var(--danger-border)] bg-[var(--danger-tint)] text-[var(--danger-text)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;
// shadcn exports the variant map beside its component so callers can reuse it
// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
