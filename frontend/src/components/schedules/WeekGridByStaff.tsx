import { PalmtreeIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { TimeBlockCard } from "./TimeBlockCard"
import { AddBlockButton, type CopyOption } from "./AddBlockButton"
import { DAYS, type Day, type StaffMember, type TimeBlock } from "@/lib/types"

interface WeekGridByStaffProps {
  staff: StaffMember
  blocksByDay: Record<Day, TimeBlock[]>
  dates: Record<Day, Date>
  highlightWeekend?: boolean
  onAdd: (day: Day) => void
  onEdit: (block: TimeBlock) => void
  onToggle: (block: TimeBlock, enabled: boolean) => void
  onCopyFrom: (toDay: Day, fromDay: Day) => void
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/** One person, all seven days. */
export function WeekGridByStaff({
  staff,
  blocksByDay,
  dates,
  highlightWeekend = true,
  onAdd,
  onEdit,
  onToggle,
  onCopyFrom,
}: WeekGridByStaffProps) {
  const copyOptions: CopyOption[] = DAYS.filter(
    (day) => (blocksByDay[day]?.length ?? 0) > 0,
  ).map((day) => ({
    value: day,
    label: `${day} (${blocksByDay[day].length})`,
  }))

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid min-w-[1180px] gap-3"
        style={{ gridTemplateColumns: "repeat(7, minmax(196px, 1fr))" }}
      >
        {DAYS.map((day) => {
          const blocks = blocksByDay[day] ?? []
          const isDayOff = staff.daysOff.includes(day)
          const isWeekend = day === "Sat" || day === "Sun"
          const date = dates[day]

          return (
            <div key={day}>
              <div
                className={cn(
                  "flex items-baseline justify-between rounded-lg border px-2.5 py-2",
                  highlightWeekend && isWeekend
                    ? "bg-weekend-bg border-weekend-border"
                    : "bg-muted border-border",
                )}
              >
                <span className="font-heading text-[13px] font-bold">
                  {day}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {MONTHS[date.getMonth()]} {date.getDate()}
                </span>
              </div>

              {isDayOff && (
                <div className="bg-dayoff-bg border-dayoff-border text-dayoff-fg mt-2 flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-semibold">
                  <PalmtreeIcon className="size-[11px]" strokeWidth={2.4} />
                  Standard day off
                </div>
              )}

              <div className="mt-2 space-y-2">
                {blocks.map((block) => (
                  <TimeBlockCard
                    key={block.id}
                    block={block}
                    onEdit={() => onEdit(block)}
                    onToggle={(enabled) => onToggle(block, enabled)}
                  />
                ))}

                {blocks.length === 0 && (
                  <div className="border-border text-placeholder-foreground rounded-lg border border-dashed py-5 text-center text-[12px]">
                    Day off
                  </div>
                )}

                <AddBlockButton
                  onAdd={() => onAdd(day)}
                  copyOptions={copyOptions.filter((o) => o.value !== day)}
                  onCopyFrom={(fromDay) => onCopyFrom(day, fromDay as Day)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
