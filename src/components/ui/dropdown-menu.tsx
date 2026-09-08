import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { markEscapeHandled } from './hooks';

/**
 * shadcn's DropdownMenu. Radix brings what the hand-rolled panel never had:
 * the content is portalled out of the sheet so nothing clips it, it flips and
 * shifts to stay on screen, focus moves into the menu and back on close, and
 * arrow keys and typeahead work.
 */
function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  className,
  sideOffset = 8,
  onEscapeKeyDown,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        onEscapeKeyDown={(e) => {
          markEscapeHandled(e);
          onEscapeKeyDown?.(e);
        }}
        className={cn(
          'z-[90] min-w-[206px] overflow-hidden rounded-[var(--r-control)] border border-[var(--n-150)] bg-popover p-1 shadow-[var(--sh-dialog)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  variant = 'default',
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & { variant?: 'default' | 'destructive' }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 rounded-[5px] border-none bg-none px-2.5 py-[9px] text-left text-[13px] text-[var(--n-800)] outline-none select-none',
        'focus:bg-[var(--n-50)] data-[highlighted]:bg-[var(--n-50)]',
        'data-[variant=destructive]:text-[var(--danger)] data-[variant=destructive]:focus:bg-[var(--danger-tint)] data-[variant=destructive]:data-[highlighted]:bg-[var(--danger-tint)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn(
        'px-[7px] pt-1.5 pb-[5px] text-[9.5px] font-bold tracking-[0.06em] text-[var(--n-400)] uppercase',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-[var(--n-100)]', className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
