import type { Job } from "../../types";
import { TypeBadge } from "../Pills";

interface Props {
  job: Job;
  activeTab: number;
  onSelect: (i: number) => void;
}

export function EquipmentTabs({ job, activeTab, onSelect }: Props) {
  const multi = job.equipment.length > 1;
  const many = job.equipment.length > 3;

  return (
    <div className="flex flex-nowrap items-end gap-1 overflow-hidden">
      {job.equipment.map((eq, i) => {
        const on = i === activeTab;
        const showId = !many || on;
        return (
          <div
            key={i}
            onClick={() => onSelect(i)}
            className="relative z-[1] flex min-w-0 cursor-pointer items-center rounded-t-[10px] border-solid transition-colors"
            style={{
              gap: many ? 6 : 8,
              flex: many ? "1 1 0" : "0 1 auto",
              padding: many ? "9px 10px" : "9px 15px",
              borderColor: "#e4e4e7",
              borderWidth: on ? "1px 1px 0 1px" : "1px",
              marginBottom: on ? -1 : 0,
              background: on ? "#ffffff" : "#f8f8f9",
              zIndex: on ? 3 : 1,
            }}
          >
            <TypeBadge type={eq.type} />
            <span
              className="ml-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold tracking-tight"
              style={{ color: on ? "#18181b" : "#71717a" }}
            >
              {eq.brand} {eq.model}
            </span>
            {showId && (
              <span className="ml-1.5 whitespace-nowrap text-[10px] font-semibold text-zinc-400">
                {multi ? `${job.id}-${i + 1}` : job.id}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
