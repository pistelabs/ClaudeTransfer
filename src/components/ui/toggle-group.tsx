import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * shadcn's ToggleGroup. Radix gives a segmented control the keyboard behaviour a
 * row of buttons never had: one tab stop for the group, arrow keys between the
 * options, and `data-state` for the selected one.
 */
function ToggleGroup({ className, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return <ToggleGroupPrimitive.Root data-slot="toggle-group" className={cn(className)} {...props} />;
}

function ToggleGroupItem({ className, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return <ToggleGroupPrimitive.Item data-slot="toggle-group-item" className={cn(className)} {...props} />;
}

export { ToggleGroup, ToggleGroupItem };
