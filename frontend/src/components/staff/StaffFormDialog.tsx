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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FieldLabel } from "@/components/common/FieldLabel"
import { fieldErrorsFrom, staffSchema } from "@/lib/validation"
import {
  DAYS,
  type Day,
  type NotifyPreference,
  type StaffMember,
} from "@/lib/types"
import type { StaffInput } from "@/lib/api"

const NOTIFY_OPTIONS: {
  value: NotifyPreference
  label: string
  description: string
}[] = [
  {
    value: "every",
    label: "Email on every booking",
    description: "One email as each booking comes in",
  },
  {
    value: "daily",
    label: "Daily recap of bookings",
    description: "One email each morning listing the day",
  },
  {
    value: "none",
    label: "No notifications",
    description: "Nothing is sent",
  },
]

export interface StaffDraft {
  /** null when creating. */
  id: string | null
  name: string
  role: string
  email: string
  phone: string
  availableHours: number
  daysOff: Day[]
  bookingNotify: NotifyPreference
  canCheckEquipment: boolean
  canCompleteAppointments: boolean
}

export function draftFromStaff(staff: StaffMember): StaffDraft {
  return {
    id: staff.id,
    name: staff.name,
    role: staff.role,
    email: staff.email,
    phone: staff.phone,
    availableHours: staff.availableHours,
    daysOff: [...staff.daysOff],
    bookingNotify: staff.bookingNotify,
    canCheckEquipment: staff.canCheckEquipment,
    canCompleteAppointments: staff.canCompleteAppointments,
  }
}

export function newStaffDraft(): StaffDraft {
  return {
    id: null,
    name: "",
    role: "",
    email: "",
    phone: "",
    availableHours: 40,
    daysOff: [],
    bookingNotify: "every",
    canCheckEquipment: true,
    canCompleteAppointments: true,
  }
}

interface StaffFormDialogProps {
  /** Non-null: the parent mounts this only while a draft is open. */
  draft: StaffDraft
  onOpenChange: (open: boolean) => void
  onSave: (draft: StaffDraft, input: StaffInput) => void
  saving?: boolean
}

export function StaffFormDialog({
  draft,
  onOpenChange,
  onSave,
  saving = false,
}: StaffFormDialogProps) {
  const [value, setValue] = useState<StaffDraft>(draft)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = value.id !== null

  function patch(partial: Partial<StaffDraft>) {
    setValue((current) => ({ ...current, ...partial }))
  }

  function handleSave() {
    const parsed = staffSchema.safeParse({
      name: value.name,
      role: value.role,
      email: value.email,
      phone: value.phone,
      availableHours: value.availableHours,
      daysOff: value.daysOff,
      bookingNotify: value.bookingNotify,
      canCheckEquipment: value.canCheckEquipment,
      canCompleteAppointments: value.canCompleteAppointments,
    })
    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error))
      return
    }
    setErrors({})
    // Initials, avatar colour and status stay with the server.
    onSave(value, parsed.data)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-[440px] flex-col gap-0 p-0">
        <DialogHeader className="border-divider border-b px-5 py-4">
          <DialogTitle>
            {isEdit ? "Edit staff member" : "Add staff member"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <Field label="Full name" htmlFor="staff-name" error={errors.name}>
            <Input
              id="staff-name"
              value={value.name}
              onChange={(e) => patch({ name: e.target.value })}
              aria-invalid={Boolean(errors.name)}
              placeholder="Mara Lindqvist"
            />
          </Field>

          <Field label="Role" htmlFor="staff-role" error={errors.role}>
            <Input
              id="staff-role"
              value={value.role}
              onChange={(e) => patch({ role: e.target.value })}
              aria-invalid={Boolean(errors.role)}
              placeholder="Rental Technician"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" htmlFor="staff-email" error={errors.email}>
              <Input
                id="staff-email"
                type="email"
                value={value.email}
                onChange={(e) => patch({ email: e.target.value })}
                aria-invalid={Boolean(errors.email)}
              />
            </Field>
            <Field label="Phone" htmlFor="staff-phone" error={errors.phone}>
              <Input
                id="staff-phone"
                value={value.phone}
                onChange={(e) => patch({ phone: e.target.value })}
              />
            </Field>
          </div>

          <Field
            label="Available hours per week"
            htmlFor="staff-hours"
            error={errors.availableHours}
          >
            <div className="flex items-center gap-2">
              <Input
                id="staff-hours"
                type="number"
                min={0}
                max={168}
                value={value.availableHours}
                onChange={(e) =>
                  patch({ availableHours: Number(e.target.value) })
                }
                aria-invalid={Boolean(errors.availableHours)}
                className="w-24"
              />
              <span className="text-muted-foreground text-[13px]">
                hours / week
              </span>
            </div>
          </Field>

          <div className="space-y-2">
            <FieldLabel>Standard days off</FieldLabel>
            <div className="flex gap-1.5">
              {DAYS.map((day) => {
                const isOff = value.daysOff.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={isOff}
                    onClick={() =>
                      patch({
                        daysOff: isOff
                          ? value.daysOff.filter((d) => d !== day)
                          : [...value.daysOff, day],
                      })
                    }
                    className={cn(
                      "focus-ring h-9 flex-1 rounded-md border text-[12.5px] font-medium transition-colors duration-[120ms]",
                      isOff
                        ? "border-dayoff-border bg-dayoff-bg text-dayoff-fg font-semibold"
                        : "border-border bg-card text-muted-foreground hover:bg-background",
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Permissions</FieldLabel>
            <div className="border-border divide-divider-light divide-y rounded-lg border">
              <PermissionRow
                label="Can check workshop equipment in and out"
                checked={value.canCheckEquipment}
                onChange={(canCheckEquipment) => patch({ canCheckEquipment })}
              />
              <PermissionRow
                label="Can carry out bootfits"
                checked={value.canCompleteAppointments}
                onChange={(canCompleteAppointments) =>
                  patch({ canCompleteAppointments })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Notify when a booking is added</FieldLabel>
            <RadioGroup
              value={value.bookingNotify}
              onValueChange={(next) =>
                patch({ bookingNotify: next as NotifyPreference })
              }
              className="gap-1.5"
            >
              {NOTIFY_OPTIONS.map((option) => {
                const isSelected = value.bookingNotify === option.value
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors duration-[120ms]",
                      isSelected
                        ? "border-sky-300 bg-sky-50"
                        : "border-border bg-card hover:bg-background",
                    )}
                  >
                    <RadioGroupItem
                      value={option.value}
                      className="mt-0.5"
                      aria-label={option.label}
                    />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-[13px] font-semibold",
                          isSelected && "text-primary-strong",
                        )}
                      >
                        {option.label}
                      </span>
                      <span className="text-muted-foreground block text-[12px]">
                        {option.description}
                      </span>
                    </span>
                  </label>
                )
              })}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="border-divider border-t px-5 py-3.5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {isEdit ? "Save changes" : "Add member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
      {error && <p className="text-destructive text-[12px]">{error}</p>}
    </div>
  )
}

function PermissionRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-[13px]">
      <Checkbox
        checked={checked}
        onCheckedChange={(next) => onChange(next === true)}
        aria-label={label}
      />
      {label}
    </label>
  )
}
