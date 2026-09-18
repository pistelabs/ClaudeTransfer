import { Select as SelectPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markEscapeHandled } from './hooks';

/**
 * shadcn's Select. A listbox rather than a menu: it carries a value, shows it on
 * the trigger and lights the chosen row, which is what the calendar caption's
 * month and year need.
 *
 * It sits above the Popover it opens inside, and marks Escape as spent so the
 * first press closes the list alone and leaves the popover standing.
 */
function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'flex h-[26px] min-w-0 items-center justify-between gap-1 rounded-[var(--r-control)]',
        'border border-[var(--n-125)] bg-white px-2 text-[12.5px] font-semibold text-[var(--n-900)]',
        'hover:bg-[var(--n-25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30',
        'disabled:cursor-default disabled:opacity-60',
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown size={13} strokeWidth={2.2} className="shrink-0 text-[var(--n-400)]" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectScrollUpButton({ className, ...props }: ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn('flex cursor-default items-center justify-center py-1 text-[var(--n-450)]', className)}
      {...props}
    >
      <ChevronUp size={14} strokeWidth={2.2} />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({ className, ...props }: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn('flex cursor-default items-center justify-center py-1 text-[var(--n-450)]', className)}
      {...props}
    >
      <ChevronDown size={14} strokeWidth={2.2} />
    </SelectPrimitive.ScrollDownButton>
  );
}

function SelectContent({
  className,
  position = 'popper',
  onEscapeKeyDown,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        onEscapeKeyDown={(e) => {
          markEscapeHandled(e);
          onEscapeKeyDown?.(e);
        }}
        className={cn(
          // above the popover (90) it is opened from
          'relative z-[95] max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-hidden',
          'rounded-[var(--r-input)] border border-[var(--n-125)] bg-popover shadow-[var(--sh-dialog)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-[6px] py-1.5 pl-2 pr-7',
        'text-[12.5px] text-[var(--n-800)] outline-none',
        'data-[highlighted]:bg-[var(--n-25)] data-[state=checked]:font-semibold data-[state=checked]:text-[var(--n-950)]',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-2 flex items-center">
        <SelectPrimitive.ItemIndicator>
          <Check size={13} strokeWidth={2.6} className="text-[var(--primary)]" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
