"use client"

import { GripVerticalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * Grip for a reorderable row. Dragging it moves the row; when focused, the
 * arrow keys do the same thing from the keyboard.
 */
export function DragHandle({
  label,
  disabled = false,
  onPointerDown,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          disabled={disabled}
          onPointerDown={onPointerDown}
          className={cn(
            "size-7 shrink-0 cursor-grab text-muted-foreground/60 hover:text-foreground active:cursor-grabbing",
            props.className,
          )}
          {...props}
        >
          <GripVerticalIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Drag to reorder, or use ↑ ↓</TooltipContent>
    </Tooltip>
  )
}
