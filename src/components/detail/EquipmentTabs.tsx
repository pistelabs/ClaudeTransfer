import type { Job } from "../../types";
import { TypeBadge } from "../Pills";
import { STAGE_DEFS } from "../../store/useAppStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  job: Job;
  activeTab: number;
  onSelect: (i: number) => void;
}

export function EquipmentTabs({ job, activeTab, onSelect }: Props) {
  const multi = job.equipment.length > 1;
  const many = job.equipment.length > 3;

  return (
    <Tabs value={String(activeTab)} onValueChange={(v) => onSelect(Number(v))} className="mb-2">
      <TabsList className="h-auto w-full justify-start p-1">
        {job.equipment.map((eq, i) => {
          const on = i === activeTab;
          const showId = !many || on;
          return (
            <TabsTrigger key={i} value={String(i)} className="min-w-0 gap-1.5 px-2.5 py-1.5">
              <TypeBadge type={eq.type} />
              <span
                title={eq.workStatus}
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: STAGE_DEFS.find((d) => d.key === eq.stage)?.dot || "#a1a1aa" }}
              />
              <span className="overflow-hidden text-[12.5px] font-semibold tracking-tight text-ellipsis whitespace-nowrap">
                {eq.brand} {eq.model}
              </span>
              {showId && (
                <span className={on ? "text-muted-foreground text-[10px] font-semibold" : "sr-only"}>
                  {multi ? `${job.id}-${i + 1}` : job.id}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
