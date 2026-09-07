import { Popover as PopoverPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { markEscapeHandled } from './hooks';

/**
 * shadcn's Popover. Same Radix machinery as the DropdownMenu, but a dialog
 * rather than a menu: the content holds ordinary interactive controls instead
 * of menu items, so it does not take arrow-key navigation or typeahead.
 */
function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/** Positions the content against something other than a trigger, for a popover opened in code. */
function PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 8,
  onEscapeKeyDown,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        onEscapeKeyDown={(e) => {
          markEscapeHandled(e);
          onEscapeKeyDown?.(e);
        }}
        className={cn(
          'z-[90] rounded-[var(--r-input)] border border-[var(--n-125)] bg-popover shadow-[var(--sh-dialog)] outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
