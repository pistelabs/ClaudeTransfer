import { CoffeeIcon, GlobeIcon, PencilIcon, RepeatIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { CategoryChip } from "@/components/common/CategoryChip";
import { blockMinutes, formatDuration, formatInterval } from "@/lib/time";
import type { TimeBlock } from "@/lib/types";

interface TimeBlockCardProps {
  block: TimeBlock;
  onEdit: () => void;
  onToggle: (enabled: boolean) => void;
  /** Compact variant used by the by-day columns. */
  compact?: boolean;
}

/**
 * Read-only summary of a block. Only the switch is interactive — clicking
 * anywhere else opens the edit dialog.
 */
export function TimeBlockCard({
  block,
  onEdit,
  onToggle,
  compact = false,
}: TimeBlockCardProps) {
  const worked = blockMinutes(block.start, block.end, block.breaks);
  const breakLabel = block.breaks.map((b) => `${b.start}–${b.end}`).join(", ");

  return (
    <div
      className={cn(
        "border-border rounded-lg border p-2.5 transition-opacity",
        block.enabled ? "bg-card shadow-card" : "bg-muted opacity-[.62]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="focus-ring group flex min-w-0 flex-1 items-center gap-1.5 rounded-sm text-left"
        >
          <span className="font-heading truncate text-[13px] font-semibold">
            {block.start} – {block.end}
          </span>
          <PencilIcon
            className="text-placeholder-foreground group-hover:text-primary size-[13px] shrink-0"
            strokeWidth={2}
          />
        </button>
        <Switch
          checked={block.enabled}
          onCheckedChange={onToggle}
          aria-label={`${block.enabled ? "Disable" : "Enable"} the ${block.start} to ${block.end} block`}
        />
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="focus-ring mt-1.5 block w-full rounded-sm text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-[11.5px]">
            {formatDuration(worked)} · {formatInterval(block.interval)}
          </span>
          <span
            className={cn(
              "text-[11.5px] font-semibold",
              block.enabled
                ? "text-primary-hover"
                : "text-placeholder-foreground",
            )}
          >
            {block.enabled ? "On" : "Off"}
          </span>
        </div>

        {block.services.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {block.services.map((category) => (
              <CategoryChip key={category} category={category} />
            ))}
          </div>
        )}

        {!compact && (
          <div className="border-divider mt-2 flex flex-wrap items-center gap-1 border-t pt-2">
            <span className="text-muted-foreground bg-muted border-border inline-flex items-center gap-1 rounded-md border px-1.5 py-[2px] text-[10.5px] font-medium">
              <RepeatIcon className="size-3" strokeWidth={2.2} />
              {block.recurring ? "Recurring" : "This week"}
            </span>
            {block.breaks.length > 0 && (
              <span className="bg-break-bg border-break-border text-break-fg inline-flex items-center gap-1 rounded-md border px-1.5 py-[2px] text-[10.5px] font-medium">
                <CoffeeIcon className="size-[11px]" strokeWidth={2.2} />
                {breakLabel}
              </span>
            )}
            {block.online && (
              <span className="bg-sky-50 border-sky-200 text-primary-hover inline-flex items-center gap-1 rounded-md border px-1.5 py-[2px] text-[10.5px] font-medium">
                <GlobeIcon className="size-[11px]" strokeWidth={2.2} />
                Online
              </span>
            )}
          </div>
        )}

        {compact && block.breaks.length > 0 && (
          <span className="bg-break-bg border-break-border text-break-fg mt-2 inline-flex items-center gap-1 rounded-md border px-1.5 py-[2px] text-[10.5px] font-medium">
            <CoffeeIcon className="size-[10px]" strokeWidth={2.4} />
            {breakLabel}
          </span>
        )}
      </button>
    </div>
  );
}
