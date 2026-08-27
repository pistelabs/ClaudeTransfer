"use client"

import * as React from "react"
import { CheckIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { NumberStepper } from "@/components/workshop/number-stepper"
import { RequiredFieldsEditor } from "@/components/workshop/required-fields-editor"
import { SectionLabel } from "@/components/workshop/section-label"
import { SelectableTile } from "@/components/workshop/selectable-tile"
import {
  FIELD_TYPE_LABELS,
  SERVICE_COLORS,
  emptyAppointmentInput,
  makeRequiredField,
} from "@/lib/workshop/data"
import { useWorkshop } from "@/lib/workshop/store"
import type {
  Appointment,
  AppointmentInput,
  AppointmentMode,
  BufferPosition,
  DurationUnit,
  Id,
  Questionnaire,
  RequiredField,
} from "@/lib/workshop/types"
import { cn } from "@/lib/utils"

/** Draft copy of the appointment being edited — Save commits it, Cancel discards. */
interface Draft extends Omit<AppointmentInput, "price" | "duration" | "bufferAmount"> {
  price: string
  duration: string
  bufferAmount: string
}

function toDraft(appointment: AppointmentInput): Draft {
  return {
    ...structuredClone(appointment),
    price: appointment.price ? String(appointment.price) : "",
    duration: appointment.duration ? String(appointment.duration) : "",
    bufferAmount: appointment.bufferAmount ? String(appointment.bufferAmount) : "",
  }
}

export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Existing appointment to edit, or null to add a new one. */
  appointment: Appointment | null
  /** Persists the appointment; the dialog stays open and shows the error if it rejects. */
  onSave: (input: AppointmentInput) => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid max-h-[calc(100vh-48px)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 p-0 sm:max-w-[680px]"
      >
        {/* Mounted only while open, so every open starts from a fresh draft. */}
        <AppointmentForm
          appointment={appointment}
          onCancel={() => onOpenChange(false)}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  )
}

function AppointmentForm({
  appointment,
  onCancel,
  onSave,
}: {
  appointment: Appointment | null
  onCancel: () => void
  onSave: (input: AppointmentInput) => Promise<void>
}) {
  const { enabledEquipmentTypes, serviceGroups, currencySymbol } = useWorkshop()
  const [draft, setDraft] = React.useState<Draft>(() =>
    toDraft(appointment ?? emptyAppointmentInput()),
  )
  const [saving, setSaving] = React.useState(false)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const setQuestionnaire = (
    key: "customerQuestionnaire" | "staffQuestionnaire",
    patch: Partial<Questionnaire>,
  ) => setDraft((current) => ({ ...current, [key]: { ...current[key], ...patch } }))

  const toggleId = (key: "equipmentTypeIds" | "bookableServiceIds", id: Id) =>
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((value) => value !== id)
        : [...current[key], id],
    }))

  const isWork = draft.mode === "work"
  const canSave = draft.name.trim().length > 0 && !saving
  /** Booking fields flagged "copy to customer" show up on the Customer information tab. */
  const mirroredFields = draft.bookingFields.filter((field) => field.copyToCustomer)
  const bookableServices = serviceGroups.filter((group) => group.services.length > 0)

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      await onSave({
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim(),
        price: parseFloat(draft.price) || 0,
        duration: parseInt(draft.duration, 10) || 0,
        bufferAmount: parseInt(draft.bufferAmount, 10) || 0,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader className="border-b px-6 py-5">
        <DialogTitle className="text-lg font-semibold tracking-[-0.01em]">
          {appointment ? "Edit appointment" : "Add appointment"}
        </DialogTitle>
        <DialogDescription>
          Configure booking, capacity, services and the info gathered from customers and staff.
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-y-auto px-6">
        {/* Appointment purpose */}
        <section className="flex flex-col gap-4 py-6">
          <SectionLabel>Appointment purpose</SectionLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            value={draft.mode}
            onValueChange={(value) => value && set("mode", value as AppointmentMode)}
            className="w-full"
          >
            <ToggleGroupItem
              value="work"
              className="h-auto flex-1 flex-col items-start gap-0.5 px-3.5 py-3 text-left transition-all duration-[120ms] data-[state=on]:border-[1.5px] data-[state=on]:border-primary data-[state=on]:bg-primary/[0.07]"
            >
              <span className="text-sm font-semibold">Carry out work</span>
              <span className="text-xs font-normal text-muted-foreground">
                Full booking with services &amp; questions
              </span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="checkin"
              className="h-auto flex-1 flex-col items-start gap-0.5 px-3.5 py-3 text-left transition-all duration-[120ms] data-[state=on]:border-[1.5px] data-[state=on]:border-primary data-[state=on]:bg-primary/[0.07]"
            >
              <span className="text-sm font-semibold">Workshop check-in</span>
              <span className="text-xs font-normal text-muted-foreground">
                Quick drop-off — name, description &amp; duration
              </span>
            </ToggleGroupItem>
          </ToggleGroup>
        </section>

        <Separator />

        {/* Basics */}
        <section className="flex flex-col gap-4 py-6">
          <SectionLabel>Basics</SectionLabel>
          <div className="grid gap-2">
            <Label htmlFor="appointment-name">Name</Label>
            <Input
              id="appointment-name"
              autoFocus
              value={draft.name}
              placeholder="e.g. Boot Fitting"
              onChange={(event) => set("name", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="appointment-description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="appointment-description"
              rows={2}
              value={draft.description}
              placeholder="Details shown under the appointment"
              onChange={(event) => set("description", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>
              Colour{" "}
              <span className="font-normal text-muted-foreground">— calendar &amp; board</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_COLORS.map((color) => (
                <Button
                  key={color}
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={"Colour " + color}
                  aria-pressed={draft.color === color}
                  style={{ backgroundColor: color }}
                  onClick={() => set("color", color)}
                  className={cn(
                    "size-8 rounded-md text-white hover:opacity-90",
                    draft.color === color && "ring-2 ring-foreground ring-offset-2",
                  )}
                >
                  {draft.color === color ? <CheckIcon className="size-4" /> : null}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Duration & price */}
        <section className="flex flex-col gap-4 py-6">
          <SectionLabel>Duration {isWork ? "& price" : ""}</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="appointment-duration">Standard duration</Label>
              <div className="flex gap-2">
                <Input
                  id="appointment-duration"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  value={draft.duration}
                  onChange={(event) => set("duration", event.target.value)}
                  className="tabular-nums"
                />
                <Select
                  value={draft.durationUnit}
                  onValueChange={(value) => set("durationUnit", value as DurationUnit)}
                >
                  <SelectTrigger className="w-[110px]" aria-label="Duration unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="min">min</SelectItem>
                    <SelectItem value="hr">hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isWork ? (
              <div className="grid gap-2">
                <Label htmlFor="appointment-price">Price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[13px] text-muted-foreground">
                    {currencySymbol.trim()}
                  </span>
                  <Input
                    id="appointment-price"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={draft.price}
                    onChange={(event) => set("price", event.target.value)}
                    className="pl-10 tabular-nums"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {isWork ? (
            <div className="grid gap-2">
              <Label htmlFor="appointment-buffer">
                Buffer time{" "}
                <span className="font-normal text-muted-foreground">
                  — blocks the calendar around the appointment
                </span>
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="appointment-buffer"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  value={draft.bufferAmount}
                  onChange={(event) => set("bufferAmount", event.target.value)}
                  className="w-24 tabular-nums"
                />
                <Select
                  value={draft.bufferUnit}
                  onValueChange={(value) => set("bufferUnit", value as DurationUnit)}
                >
                  <SelectTrigger className="w-[110px]" aria-label="Buffer unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="min">min</SelectItem>
                    <SelectItem value="hr">hours</SelectItem>
                  </SelectContent>
                </Select>
                <Tabs
                  value={draft.bufferPosition}
                  onValueChange={(value) => set("bufferPosition", value as BufferPosition)}
                >
                  <TabsList>
                    <TabsTrigger value="before">Before</TabsTrigger>
                    <TabsTrigger value="after">After</TabsTrigger>
                    <TabsTrigger value="both">Both</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          ) : null}
        </section>

        <Separator />

        {isWork ? (
          <>
            {/* Information required on booking */}
            <section className="flex flex-col gap-4 py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <SectionLabel>Information required on booking</SectionLabel>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    Fields the customer must provide to book.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    set("bookingFields", [...draft.bookingFields, makeRequiredField()])
                  }
                >
                  <PlusIcon />
                  Add field
                </Button>
              </div>

              <div className="flex flex-wrap gap-5 rounded-md bg-muted/60 p-3.5">
                <CheckboxRow
                  id="booking-name"
                  label="Name"
                  checked={draft.bookingAskName}
                  onCheckedChange={(checked) => set("bookingAskName", checked)}
                />
                <CheckboxRow
                  id="booking-email"
                  label="Email"
                  checked={draft.bookingAskEmail}
                  onCheckedChange={(checked) => set("bookingAskEmail", checked)}
                />
                <CheckboxRow
                  id="booking-phone"
                  label="Phone number"
                  checked={draft.bookingAskPhone}
                  onCheckedChange={(checked) => set("bookingAskPhone", checked)}
                />
              </div>

              <RequiredFieldsEditor
                fields={draft.bookingFields}
                onChange={(fields) => set("bookingFields", fields)}
                showCopyToCustomer
                labelPlaceholder="Field label"
                emptyMessage="No extra booking fields. Add one to ask the customer something else at booking."
              />
            </section>

            <Separator />

            {/* Capacity */}
            <section className="flex flex-col gap-4 py-6">
              <SectionLabel>Capacity</SectionLabel>
              <StepperRow
                title="Maximum customers per appointment"
                description="How many customers can share one slot"
                value={draft.maxCustomers}
                min={1}
                onChange={(value) => set("maxCustomers", value)}
              />
              <StepperRow
                title="Staff required per appointment"
                description="How many staff the slot takes up"
                value={draft.staffRequired}
                min={1}
                onChange={(value) => set("staffRequired", value)}
              />
            </section>

            <Separator />

            {/* Questionnaires + equipment */}
            <section className="flex flex-col gap-4 py-6">
              <Tabs defaultValue="customer">
                <TabsList>
                  <TabsTrigger value="customer">Customer information</TabsTrigger>
                  <TabsTrigger value="staff">Staff information</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                </TabsList>

                <TabsContent value="customer" className="flex flex-col gap-4 pt-4">
                  <QuestionnaireEditor
                    idPrefix="customer"
                    description="Data collected from the customer for this appointment."
                    questionnaire={draft.customerQuestionnaire}
                    mirroredFields={mirroredFields}
                    onChange={(patch) => setQuestionnaire("customerQuestionnaire", patch)}
                  />
                </TabsContent>

                <TabsContent value="staff" className="flex flex-col gap-4 pt-4">
                  <QuestionnaireEditor
                    idPrefix="staff"
                    description="What staff must capture during the appointment."
                    questionnaire={draft.staffQuestionnaire}
                    onChange={(patch) => setQuestionnaire("staffQuestionnaire", patch)}
                  />
                </TabsContent>

                <TabsContent value="equipment" className="flex flex-col gap-4 pt-4">
                  <p className="text-[12.5px] text-muted-foreground">
                    Equipment types this appointment applies to.
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {enabledEquipmentTypes.map((equipmentType) => (
                      <SelectableTile
                        key={equipmentType.id}
                        label={equipmentType.name}
                        selected={draft.equipmentTypeIds.includes(equipmentType.id)}
                        onSelect={() => toggleId("equipmentTypeIds", equipmentType.id)}
                      />
                    ))}
                  </div>
                  {enabledEquipmentTypes.length === 0 ? (
                    <p className="rounded-md border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
                      No equipment types are enabled yet. Enable them under Equipment Types to
                      assign them here.
                    </p>
                  ) : null}
                </TabsContent>
              </Tabs>
            </section>
          </>
        ) : (
          <>
            {/* Check-in: information required at booking */}
            <section className="flex flex-col gap-4 py-6">
              <div>
                <SectionLabel>Information required at booking</SectionLabel>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Details captured when a customer checks in.
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Customer information</Label>
                <div className="flex flex-wrap gap-5 rounded-md bg-muted/60 p-3.5">
                  <CheckboxRow
                    id="checkin-name"
                    label="Name"
                    checked={draft.checkinAskName}
                    onCheckedChange={(checked) => set("checkinAskName", checked)}
                  />
                  <CheckboxRow
                    id="checkin-email"
                    label="Email"
                    checked={draft.checkinAskEmail}
                    onCheckedChange={(checked) => set("checkinAskEmail", checked)}
                  />
                  <CheckboxRow
                    id="checkin-phone"
                    label="Phone number"
                    checked={draft.checkinAskPhone}
                    onCheckedChange={(checked) => set("checkinAskPhone", checked)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Equipment information</Label>
                <div className="flex flex-wrap gap-5 rounded-md bg-muted/60 p-3.5">
                  <CheckboxRow
                    id="checkin-brand"
                    label="Brand"
                    checked={draft.checkinAskBrand}
                    onCheckedChange={(checked) => set("checkinAskBrand", checked)}
                  />
                  <CheckboxRow
                    id="checkin-model"
                    label="Model"
                    checked={draft.checkinAskModel}
                    onCheckedChange={(checked) => set("checkinAskModel", checked)}
                  />
                  <CheckboxRow
                    id="checkin-size"
                    label="Size"
                    checked={draft.checkinAskSize}
                    onCheckedChange={(checked) => set("checkinAskSize", checked)}
                  />
                  <CheckboxRow
                    id="checkin-colour"
                    label="Colour"
                    checked={draft.checkinAskColour}
                    onCheckedChange={(checked) => set("checkinAskColour", checked)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Equipment types</Label>
                <p className="text-xs text-muted-foreground">
                  What the customer can drop off on this appointment. Leave all unselected to accept
                  any type.
                </p>
                {enabledEquipmentTypes.length === 0 ? (
                  <p className="rounded-md border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
                    No equipment types are enabled yet. Enable them under Equipment Types to offer
                    them here.
                  </p>
                ) : (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {enabledEquipmentTypes.map((equipmentType) => (
                      <SelectableTile
                        key={equipmentType.id}
                        label={equipmentType.name}
                        selected={draft.equipmentTypeIds.includes(equipmentType.id)}
                        onSelect={() => toggleId("equipmentTypeIds", equipmentType.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-md bg-muted/60 p-3.5">
                <CheckboxRow
                  id="checkin-notes"
                  label="Notes — details of the work required"
                  checked={draft.checkinAskNotes}
                  onCheckedChange={(checked) => set("checkinAskNotes", checked)}
                />
              </div>
            </section>

            <Separator />

            {/* Check-in: bookable services */}
            <section className="flex flex-col gap-4 py-6">
              <SectionLabel>Services</SectionLabel>
              <div className="flex items-center justify-between gap-4 rounded-md border p-3.5">
                <div className="min-w-0">
                  <Label htmlFor="allow-service-booking" className="text-[13px] font-medium">
                    Let customers book specific services at check-in
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Off = general drop-off only. On = the customer picks from the services below.
                  </p>
                </div>
                <Switch
                  id="allow-service-booking"
                  checked={draft.allowServiceBooking}
                  onCheckedChange={(checked) => set("allowServiceBooking", checked)}
                />
              </div>

              {draft.allowServiceBooking ? (
                bookableServices.length === 0 ? (
                  <p className="rounded-md border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
                    No services yet. Create services under the Services tab first.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {bookableServices.map((group) => (
                      <div key={group.id} className="grid gap-2">
                        <Label className="text-muted-foreground">{group.name}</Label>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {group.services.map((service) => (
                            <SelectableTile
                              key={service.id}
                              label={service.name}
                              selected={draft.bookableServiceIds.includes(service.id)}
                              onSelect={() => toggleId("bookableServiceIds", service.id)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : null}
            </section>
          </>
        )}
      </div>

      <DialogFooter className="border-t px-6 py-4">
        <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" disabled={!canSave} onClick={handleSave}>
          {saving ? "Saving…" : appointment ? "Save changes" : "Add appointment"}
        </Button>
      </DialogFooter>
    </>
  )
}

function CheckboxRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

function StepperRow({
  title,
  description,
  value,
  min,
  onChange,
}: {
  title: string
  description: string
  value: number
  min?: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border p-3.5">
      <div>
        <div className="text-[13px] font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <NumberStepper label={title} value={value} min={min} onChange={onChange} />
    </div>
  )
}

function QuestionnaireEditor({
  idPrefix,
  description,
  questionnaire,
  mirroredFields = [],
  onChange,
}: {
  idPrefix: string
  description: string
  questionnaire: Questionnaire
  /** Booking fields mirrored in here via "Copy to Customer information". */
  mirroredFields?: RequiredField[]
  onChange: (patch: Partial<Questionnaire>) => void
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <p className="text-[12.5px] text-muted-foreground">{description}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ fields: [...questionnaire.fields, makeRequiredField()] })}
        >
          <PlusIcon />
          Add question
        </Button>
      </div>

      {mirroredFields.length ? (
        <div className="rounded-md bg-muted/60 p-3.5">
          <div className="text-[13px] font-medium">Copied from booking</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            These fields are collected at booking and reused here automatically — no need to re-add
            them.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {mirroredFields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
              >
                <span className="truncate text-[13px]">{field.label || "Untitled field"}</span>
                <span className="text-xs text-muted-foreground">
                  {FIELD_TYPE_LABELS[field.type]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <RequiredFieldsEditor
        fields={questionnaire.fields}
        onChange={(fields) => onChange({ fields })}
        labelPlaceholder="Question label"
        emptyMessage="No questions yet. Add free text, predefined options or a file upload."
      />

      <div className="flex items-center justify-between gap-4 rounded-md border p-3.5">
        <div className="min-w-0">
          <Label htmlFor={idPrefix + "-signature"} className="text-[13px] font-medium">
            Require terms &amp; conditions signature
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Asks for a signature once the questions are answered
          </p>
        </div>
        <Switch
          id={idPrefix + "-signature"}
          checked={questionnaire.signatureRequired}
          onCheckedChange={(checked) => onChange({ signatureRequired: checked })}
        />
      </div>

      {questionnaire.signatureRequired ? (
        <div className="grid gap-2">
          <Label htmlFor={idPrefix + "-terms"}>Terms &amp; conditions</Label>
          <Textarea
            id={idPrefix + "-terms"}
            rows={3}
            value={questionnaire.terms}
            placeholder="Terms &amp; conditions text the customer signs"
            onChange={(event) => onChange({ terms: event.target.value })}
          />
        </div>
      ) : null}
    </>
  )
}
