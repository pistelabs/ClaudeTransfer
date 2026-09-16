import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StaffAvatar } from "@/components/common/StaffAvatar"
import { DAYS, type StaffMember } from "@/lib/types"

const NOTIFY_LABELS = {
  every: "Email on every booking",
  daily: "Daily recap at 5pm",
  none: "No notifications",
} as const

interface StaffDetailsDialogProps {
  staff: StaffMember | null
  onOpenChange: (open: boolean) => void
  onEdit: (staff: StaffMember) => void
}

export function StaffDetailsDialog({
  staff,
  onOpenChange,
  onEdit,
}: StaffDetailsDialogProps) {
  if (!staff) return null

  const daysOff = DAYS.filter((day) => staff.daysOff.includes(day))

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader className="flex-row items-center gap-3">
          <StaffAvatar staff={staff} size={52} />
          <div className="min-w-0">
            <DialogTitle className="truncate">{staff.name}</DialogTitle>
            <p className="text-muted-foreground mt-1 text-[12.5px]">
              {staff.role}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <DetailRow label="Email" value={staff.email} />
          <DetailRow label="Phone" value={staff.phone || "—"} />

          <div className="grid grid-cols-2 gap-2.5">
            <div className="border-border bg-muted rounded-lg border px-3 py-2.5">
              <div className="text-tertiary-foreground text-[11px] font-semibold tracking-[0.4px] uppercase">
                Weekly hours
              </div>
              <div className="font-heading text-primary-hover mt-1 text-[17px] font-bold">
                {staff.availableHours} h
              </div>
            </div>
            <div className="border-border bg-muted rounded-lg border px-3 py-2.5">
              <div className="text-tertiary-foreground text-[11px] font-semibold tracking-[0.4px] uppercase">
                Booking alerts
              </div>
              <div className="mt-1 text-[13px] font-medium">
                {NOTIFY_LABELS[staff.bookingNotify]}
              </div>
            </div>
          </div>

          <div className="border-border bg-muted rounded-lg border px-3 py-2.5">
            <div className="text-tertiary-foreground text-[11px] font-semibold tracking-[0.4px] uppercase">
              Standard days off
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {daysOff.length === 0 && (
                <span className="text-muted-foreground text-[13px]">
                  No standard days off
                </span>
              )}
              {daysOff.map((day) => (
                <span
                  key={day}
                  className="border-dayoff-border bg-dayoff-bg text-dayoff-fg rounded-md border px-2 py-[3px] text-[12px] font-semibold"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onEdit(staff)}>Edit details</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-divider-light flex items-center justify-between gap-3 border-b pb-2.5">
      <span className="text-tertiary-foreground text-[11px] font-semibold tracking-[0.4px] uppercase">
        {label}
      </span>
      <span className="truncate text-[13px]">{value}</span>
    </div>
  )
}
