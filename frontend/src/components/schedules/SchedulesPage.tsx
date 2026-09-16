import { useMemo, useState } from "react"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/common/PageHeader"
import { StaffAvatar } from "@/components/common/StaffAvatar"
import { CategoryLegend } from "@/components/common/CategoryChip"
import { WeekGridByStaff } from "./WeekGridByStaff"
import { DayGridByStaff } from "./DayGridByStaff"
import {
  TimeBlockDialog,
  draftFromBlock,
  newDraft,
  type TimeBlockDraft,
} from "./TimeBlockDialog"
import { RecurringOffDialog } from "./RecurringOffDialog"
import {
  useCopyDay,
  useCreateTimeBlock,
  useDeleteTimeBlock,
  useServices,
  useStaff,
  useTimeBlocks,
  useUpdateTimeBlock,
} from "@/lib/api/queries"
import {
  addDays,
  blockMinutes,
  formatHours,
  formatWeekLabel,
  startOfWeek,
  toIsoDate,
  weekDates,
} from "@/lib/time"
import { DAYS, type Day, type TimeBlock } from "@/lib/types"

type ViewMode = "staff" | "day"

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

export function SchedulesPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [viewMode, setViewMode] = useState<ViewMode>("day")
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [dayViewDay, setDayViewDay] = useState<Day>("Mon")
  const [draft, setDraft] = useState<TimeBlockDraft | null>(null)
  const [offConfirm, setOffConfirm] = useState<TimeBlock | null>(null)

  const weekStartIso = toIsoDate(weekStart)
  const dates = useMemo(() => weekDates(weekStart), [weekStart])

  const { data: staff = [], isLoading: staffLoading } = useStaff()
  const { data: services = [] } = useServices()
  const { data: blocks = [], isLoading: blocksLoading } =
    useTimeBlocks(weekStartIso)

  const createBlock = useCreateTimeBlock(weekStartIso)
  const updateBlock = useUpdateTimeBlock(weekStartIso)
  const deleteBlock = useDeleteTimeBlock(weekStartIso)
  const copyDay = useCopyDay(weekStartIso)

  const activeStaffId = selectedStaffId ?? staff[0]?.id ?? null
  const activeStaff = staff.find((s) => s.id === activeStaffId) ?? null

  const blocksFor = useMemo(
    () => (staffId: string, day: Day) =>
      blocks
        .filter((b) => b.staffId === staffId && b.day === day)
        .sort((a, b) => a.start.localeCompare(b.start)),
    [blocks],
  )

  const blocksByDay = useMemo(() => {
    const grouped = {} as Record<Day, TimeBlock[]>
    for (const day of DAYS) {
      grouped[day] = activeStaffId ? blocksFor(activeStaffId, day) : []
    }
    return grouped
  }, [activeStaffId, blocksFor])

  const summary = useMemo(() => {
    const active = Object.values(blocksByDay)
      .flat()
      .filter((b) => b.enabled)
    const minutes = active.reduce(
      (total, b) => total + blockMinutes(b.start, b.end, b.breaks),
      0,
    )
    const scheduledDays = DAYS.filter((day) =>
      (blocksByDay[day] ?? []).some((b) => b.enabled),
    ).length
    return {
      hours: formatHours(minutes),
      blocks: active.length,
      scheduledDays,
    }
  }, [blocksByDay])

  function handleSave(
    value: TimeBlockDraft,
    input: Parameters<typeof createBlock.mutate>[0],
  ) {
    if (value.id) {
      updateBlock.mutate(
        { id: value.id, input },
        {
          onSuccess: () => {
            toast.success("Time block updated", {
              description: `${value.start} – ${value.end}`,
            })
            setDraft(null)
          },
        },
      )
      return
    }
    createBlock.mutate(input, {
      onSuccess: () => {
        toast.success("Time block added", {
          description: `${value.start} – ${value.end}`,
        })
        setDraft(null)
      },
    })
  }

  function handleRemove(id: string) {
    deleteBlock.mutate(id, {
      onSuccess: () => {
        toast.success("Time block deleted")
        setDraft(null)
      },
    })
  }

  /** Recurring blocks ask before switching off; one-off blocks just toggle. */
  function handleToggle(block: TimeBlock, enabled: boolean) {
    if (!enabled && block.recurring) {
      setOffConfirm(block)
      return
    }
    updateBlock.mutate({ id: block.id, input: { enabled } })
  }

  function handleCopy(staffId: string, fromDay: Day, toDay: Day) {
    copyDay.mutate(
      { staffId, fromDay, toDay },
      {
        onSuccess: (copied) =>
          toast.success(
            `Copied ${copied.length} block${copied.length === 1 ? "" : "s"}`,
            {
              description: `${fromDay} → ${toDay}`,
            },
          ),
      },
    )
  }

  const isLoading = staffLoading || blocksLoading

  return (
    <div>
      <PageHeader title="Schedules & Availability" />

      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
        className="mb-3"
      >
        <TabsList>
          <TabsTrigger value="day">
            <CalendarIcon /> By day — all staff
          </TabsTrigger>
          <TabsTrigger value="staff">
            <UsersIcon /> By staff member
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-9 w-[420px]" />
          <Skeleton className="h-[86px] w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
      )}

      {!isLoading && viewMode === "staff" && activeStaff && (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-tertiary-foreground mr-1 text-[11px] font-semibold tracking-[0.4px] uppercase">
              Staff
            </span>
            {staff.map((member) => {
              const isActive = member.id === activeStaffId
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedStaffId(member.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "focus-ring flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[13px] transition-colors duration-[120ms]",
                    isActive
                      ? "border-sky-300 bg-sky-50 text-primary-strong font-semibold"
                      : "border-border bg-card text-muted-foreground hover:bg-background",
                  )}
                >
                  <StaffAvatar staff={member} size={26} />
                  {member.name}
                </button>
              )
            })}
          </div>

          <div className="mb-3 grid grid-cols-3 gap-3">
            <SummaryCard label="Weekly Available Hours">
              <span className="text-primary-hover">{summary.hours}</span>
              <span className="text-tertiary-foreground text-[14px] font-medium">
                {" "}
                / {activeStaff.availableHours} h
              </span>
            </SummaryCard>
            <SummaryCard label="Active time blocks">
              <span className="text-teal-700">{summary.blocks}</span>
            </SummaryCard>
            <SummaryCard label="Days scheduled">
              <span>{summary.scheduledDays}</span>
              <span className="text-tertiary-foreground text-[14px] font-medium">
                {" "}
                / 7
              </span>
            </SummaryCard>
          </div>

          <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <CategoryLegend />
            <WeekStepper
              weekStart={weekStart}
              onStep={(days) =>
                setWeekStart((current) => addDays(current, days))
              }
            />
            <span />
          </div>

          <WeekGridByStaff
            staff={activeStaff}
            blocksByDay={blocksByDay}
            dates={dates}
            onAdd={(day) => setDraft(newDraft(activeStaff.id, day))}
            onEdit={(block) => setDraft(draftFromBlock(block))}
            onToggle={handleToggle}
            onCopyFrom={(toDay, fromDay) =>
              handleCopy(activeStaff.id, fromDay, toDay)
            }
          />
        </>
      )}

      {!isLoading && viewMode === "day" && (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-tertiary-foreground mr-1 text-[11px] font-semibold tracking-[0.4px] uppercase">
              Day
            </span>
            {DAYS.map((day) => {
              const isActive = day === dayViewDay
              const date = dates[day]
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setDayViewDay(day)}
                  aria-pressed={isActive}
                  className={cn(
                    "focus-ring flex flex-col items-center rounded-lg border px-3 py-1.5 transition-colors duration-[120ms]",
                    isActive
                      ? "border-sky-300 bg-sky-50 text-primary-strong"
                      : "border-border bg-card text-muted-foreground hover:bg-background",
                  )}
                >
                  <span className="text-[13px] font-semibold">{day}</span>
                  <span className="text-[11px]">
                    {MONTHS[date.getMonth()]} {date.getDate()}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <CategoryLegend />
            <WeekStepper
              weekStart={weekStart}
              onStep={(days) =>
                setWeekStart((current) => addDays(current, days))
              }
            />
            <span />
          </div>

          <DayGridByStaff
            day={dayViewDay}
            staff={staff}
            blocksFor={blocksFor}
            onAdd={(staffId) => setDraft(newDraft(staffId, dayViewDay))}
            onEdit={(block) => setDraft(draftFromBlock(block))}
            onToggle={handleToggle}
            onCopyFrom={(staffId, fromDay) =>
              handleCopy(staffId, fromDay, dayViewDay)
            }
          />
        </>
      )}

      {draft && (
        <TimeBlockDialog
          // Remount per opened block so the draft state starts fresh.
          key={`${draft.id ?? "new"}-${draft.staffId}-${draft.day}`}
          draft={draft}
          services={services}
          onOpenChange={(open) => !open && setDraft(null)}
          onSave={handleSave}
          onRemove={handleRemove}
          saving={createBlock.isPending || updateBlock.isPending}
        />
      )}

      <RecurringOffDialog
        open={offConfirm !== null}
        onOpenChange={(open) => !open && setOffConfirm(null)}
        onSkipWeek={() => {
          if (!offConfirm) return
          updateBlock.mutate({
            id: offConfirm.id,
            input: { enabled: false, recurring: false },
          })
          toast.success("Skipped this week", {
            description: "The series stays in place.",
          })
          setOffConfirm(null)
        }}
        onTurnOffRecurring={() => {
          if (!offConfirm) return
          updateBlock.mutate({
            id: offConfirm.id,
            input: { enabled: false },
          })
          toast.success("Recurring block turned off", {
            description: "It is off every week until you switch it back on.",
          })
          setOffConfirm(null)
        }}
      />
    </div>
  )
}

/** Week navigator, centred above the grid it drives. */
function WeekStepper({
  weekStart,
  onStep,
}: {
  weekStart: Date
  onStep: (days: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        className="size-[34px]"
        onClick={() => onStep(-7)}
        aria-label="Previous week"
      >
        <ChevronLeftIcon />
      </Button>
      <div className="w-[132px] text-center text-[13px] font-semibold">
        {formatWeekLabel(weekStart)}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="size-[34px]"
        onClick={() => onStep(7)}
        aria-label="Next week"
      >
        <ChevronRightIcon />
      </Button>
    </div>
  )
}

function SummaryCard({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Card className="gap-1 rounded-xl px-4 py-3.5 shadow-card">
      <div className="text-tertiary-foreground text-[11px] font-semibold tracking-[0.4px] uppercase">
        {label}
      </div>
      <div className="font-heading text-[24px] leading-none font-bold">
        {children}
      </div>
    </Card>
  )
}
