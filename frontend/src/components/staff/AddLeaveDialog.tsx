import { useState } from "react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldLabel } from "@/components/common/FieldLabel"
import { StaffAvatar } from "@/components/common/StaffAvatar"
import { LEAVE_TYPE_STYLES } from "@/lib/categories"
import { fieldErrorsFrom, leaveSchema } from "@/lib/validation"
import type { LeaveType, StaffMember } from "@/lib/types"
import type { LeaveInput } from "@/lib/api"

const LEAVE_TYPES: LeaveType[] = ["Vacation", "Sick", "Personal"]

interface AddLeaveDialogProps {
  staff: StaffMember[]
  onOpenChange: (open: boolean) => void
  onSave: (input: LeaveInput) => void
  saving?: boolean
}

export function AddLeaveDialog({
  staff,
  onOpenChange,
  onSave,
  saving = false,
}: AddLeaveDialogProps) {
  const [staffId, setStaffId] = useState(staff[0]?.id ?? "")
  const [type, setType] = useState<LeaveType>("Vacation")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSave() {
    const parsed = leaveSchema.safeParse({ staffId, type, startDate, endDate })
    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error))
      return
    }
    setErrors({})
    onSave(parsed.data)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Add annual leave</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <FieldLabel>Staff member</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {staff.map((member) => {
                const isSelected = member.id === staffId
                return (
                  <button
                    key={member.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setStaffId(member.id)}
                    className={cn(
                      "focus-ring flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[12.5px] transition-colors duration-[120ms]",
                      isSelected
                        ? "border-sky-300 bg-sky-50 text-primary-strong font-semibold"
                        : "border-border bg-card text-muted-foreground hover:bg-background",
                    )}
                  >
                    <StaffAvatar staff={member} size={22} />
                    {member.name}
                  </button>
                )
              })}
            </div>
            {errors.staffId && (
              <p className="text-destructive text-[12px]">{errors.staffId}</p>
            )}
          </div>

          <div className="space-y-2">
            <FieldLabel>Leave type</FieldLabel>
            <div className="flex gap-2">
              {LEAVE_TYPES.map((leaveType) => {
                const isSelected = leaveType === type
                const style = LEAVE_TYPE_STYLES[leaveType]
                return (
                  <button
                    key={leaveType}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setType(leaveType)}
                    className={cn(
                      "focus-ring h-9 flex-1 rounded-md border text-[13px] font-medium transition-colors duration-[120ms]",
                      !isSelected &&
                        "border-border bg-card text-muted-foreground hover:bg-background",
                    )}
                    style={
                      isSelected
                        ? {
                            backgroundColor: style.bg,
                            color: style.fg,
                            borderColor: style.border,
                            fontWeight: 600,
                          }
                        : undefined
                    }
                  >
                    {leaveType}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="leave-start">Start date</FieldLabel>
              <Input
                id="leave-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-invalid={Boolean(errors.startDate)}
              />
              {errors.startDate && (
                <p className="text-destructive text-[12px]">
                  {errors.startDate}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="leave-end">End date</FieldLabel>
              <Input
                id="leave-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-invalid={Boolean(errors.endDate)}
              />
              {errors.endDate && (
                <p className="text-destructive text-[12px]">{errors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Add leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
