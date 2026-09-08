import { Slot } from 'radix-ui';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * shadcn's Button. The variant map is tuned to this design rather than shadcn's
 * defaults — 34px/13px controls instead of 36px/14px, and the studio's own
 * `success`, `pay` and `dark` alongside shadcn's set. Colours come from the
 * shared tokens, so a Button and the schedule grid stay in step.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[7px] whitespace-nowrap rounded-[var(--r-control)] border border-transparent font-medium outline-none transition-[background-color,border-color,color] duration-[120ms] ease-linear cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:shadow-[var(--ring-shadow)] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]',
        secondary: 'bg-[var(--n-60)] text-[var(--n-800)] hover:bg-[var(--n-100)]',
        outline: 'border-[var(--n-150)] bg-white text-[var(--n-800)] hover:bg-[var(--n-30)]',
        ghost: 'bg-transparent text-[var(--n-600)] hover:bg-[var(--n-50)] hover:text-[var(--n-950)]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-[#be123c]',
        success: 'border-[var(--success-border)] bg-[var(--success-tint)] text-[var(--success-text)]',
        pay: 'bg-pay text-white hover:bg-[var(--pay-hover)]',
        dark: 'bg-[var(--n-950)] text-white hover:bg-[var(--dark-action)]',
      },
      size: {
        sm: 'h-8 px-3 text-[12.5px]',
        default: 'h-9 px-3.5 text-[13px]',
        lg: 'h-10 px-[18px] text-[13px]',
        icon: 'size-8 p-0 text-[13px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  type = 'button',
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// shadcn exports the variant map beside its component so callers can reuse it
// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
