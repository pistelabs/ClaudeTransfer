import type { Job } from "../../types";
import { TypeBadge } from "../Pills";
import { STAGE_DEFS } from "../../store/useAppStore";
import { cn } from "@/lib/utils";

interface Props {
  job: Job;
  activeTab: number;
  onSelect: (i: number) => void;
}

/**
 * Browser-style tabs: the selected one drops its bottom border and overlaps the card below by
 * a pixel, so the two read as one sheet of paper rather than a control sitting above a panel.
 * Pair with LineItemsCard, which squares its top-left corner when the first tab is selected.
 */
export function EquipmentTabs({ job, activeTab, onSelect }: Props) {
  const multi = job.equipment.length > 1;
  const many = job.equipment.length > 3;

  return (
    <div role="tablist" className="flex flex-nowrap items-end gap-1 overflow-hidden">
      {job.equipment.map((eq, i) => {
        const on = i === activeTab;
        const showId = !many || on;
        return (
          <button
            key={i}
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(i)}
            className={cn(
              "relative flex min-w-0 cursor-pointer items-center rounded-t-[10px] border transition-colors",
              many ? "flex-1 gap-1.5 px-2.5 py-[9px]" : "flex-initial gap-2 px-[15px] py-[9px]",
              on
                ? "z-[3] -mb-px border-b-transparent bg-white"
                : "bg-surface-100 hover:bg-app-bg z-[1]",
            )}
          >
            <TypeBadge type={eq.type} />
            <span
              title={eq.workStatus}
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: STAGE_DEFS.find((d) => d.key === eq.stage)?.dot || "#a1a1aa" }}
            />
            <span
              className={cn(
                "overflow-hidden text-[12.5px] font-semibold tracking-tight text-ellipsis whitespace-nowrap",
                !on && "text-muted-foreground",
              )}
            >
              {eq.brand} {eq.model}
            </span>
            {showId && (
              <span className="text-muted-foreground ml-1.5 text-[10px] font-semibold whitespace-nowrap">
                {multi ? `${job.id}-${i + 1}` : job.id}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
