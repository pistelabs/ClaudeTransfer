"use client"

import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Highlight-on-select tile used for equipment types and standardized entries.
 * Built from the shadcn Button so focus/disabled states come from the library.
 */
export function SelectableTile({
  label,
  hint,
  selected,
  onSelect,
  className,
}: {
  label: string
  hint?: string
  selected: boolean
  onSelect: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      role="checkbox"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "h-auto w-full justify-between gap-2 px-3.5 py-3 text-left whitespace-normal transition-all duration-[120ms]",
        selected && "border-[1.5px] border-primary bg-primary/[0.07] hover:bg-primary/10",
        className,
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={cn("text-sm", selected ? "font-semibold" : "font-medium")}>{label}</span>
        {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
      </span>
      {selected ? <CheckIcon className="size-4 shrink-0 text-primary" /> : null}
    </Button>
  )
}
