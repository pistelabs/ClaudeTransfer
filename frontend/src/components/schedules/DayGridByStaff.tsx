import { cn } from "@/lib/utils";
import { StaffAvatar } from "@/components/common/StaffAvatar";
import { TimeBlockCard } from "./TimeBlockCard";
import { AddBlockButton, type CopyOption } from "./AddBlockButton";
import { DAYS } from "@/lib/types";
import type { Day, StaffMember, TimeBlock } from "@/lib/types";
import { blockMinutes, formatHours } from "@/lib/time";

interface DayGridByStaffProps {
  day: Day;
  staff: StaffMember[];
  blocksFor: (staffId: string, day: Day) => TimeBlock[];
  onAdd: (staffId: string) => void;
  onEdit: (block: TimeBlock) => void;
  onToggle: (block: TimeBlock, enabled: boolean) => void;
  onCopyFrom: (staffId: string, fromDay: Day) => void;
}

/** One day, every staff member as a column. */
export function DayGridByStaff({
  day,
  staff,
  blocksFor,
  onAdd,
  onEdit,
  onToggle,
  onCopyFrom,
}: DayGridByStaffProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid min-w-[1400px] gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.max(staff.length, 1)}, minmax(230px, 1fr))`,
        }}
      >
        {staff.map((member) => {
          const blocks = blocksFor(member.id, day);
          const isDayOff = member.daysOff.includes(day);
          const minutes = blocks
            .filter((b) => b.enabled)
            .reduce(
              (total, b) => total + blockMinutes(b.start, b.end, b.breaks),
              0,
            );

          const copyOptions: CopyOption[] = DAYS.filter(
            (d) => d !== day && blocksFor(member.id, d).length > 0,
          ).map((d) => ({
            value: d,
            label: `${d} (${blocksFor(member.id, d).length})`,
          }));

          return (
            <div key={member.id}>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2",
                  isDayOff
                    ? "bg-dayoff-bg border-dayoff-border"
                    : "bg-muted border-border",
                )}
              >
                <StaffAvatar staff={member} size={28} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-semibold">
                    {member.name}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {formatHours(minutes)} h
                  </span>
                </span>
                {isDayOff && (
                  <span className="text-dayoff-fg border-dayoff-border rounded-md border bg-white px-1.5 py-[2px] text-[10.5px] font-semibold">
                    Day off
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-2">
                {blocks.map((block) => (
                  <TimeBlockCard
                    key={block.id}
                    block={block}
                    compact
                    onEdit={() => onEdit(block)}
                    onToggle={(enabled) => onToggle(block, enabled)}
                  />
                ))}

                {blocks.length === 0 && (
                  <div className="border-border text-placeholder-foreground rounded-lg border border-dashed py-5 text-center text-[12px]">
                    No blocks
                  </div>
                )}

                <AddBlockButton
                  onAdd={() => onAdd(member.id)}
                  copyOptions={copyOptions}
                  onCopyFrom={(fromDay) =>
                    onCopyFrom(member.id, fromDay as Day)
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
