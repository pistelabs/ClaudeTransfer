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
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { NumberStepper } from "@/components/workshop/number-stepper"
import { RequiredFieldsEditor } from "@/components/workshop/required-fields-editor"
import { SectionLabel } from "@/components/workshop/section-label"
import { SelectableTile } from "@/components/workshop/selectable-tile"
import {
  SERVICE_COLORS,
  STANDARD_ENTRIES,
  emptyServiceInput,
  makeRequiredField,
} from "@/lib/workshop/data"
import { useWorkshop } from "@/lib/workshop/store"
import type {
  DurationUnit,
  Id,
  PricingType,
  Service,
  ServiceInput,
  StandardEntryCode,
} from "@/lib/workshop/types"
import { cn } from "@/lib/utils"

/** Draft copy of the service being edited — Save commits it, Cancel discards. */
interface Draft extends Omit<ServiceInput, "price" | "duration"> {
  price: string
  duration: string
}

function toDraft(service: ServiceInput): Draft {
  return {
    ...structuredClone(service),
    price: service.price ? String(service.price) : "",
    duration: service.duration ? String(service.duration) : "",
  }
}

export function ServiceDialog({
  open,
  onOpenChange,
  service,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Existing service to edit, or null to add a new one. */
  service: Service | null
  /** Persists the service; the dialog stays open and shows the error if it rejects. */
  onSave: (input: ServiceInput) => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid max-h-[calc(100vh-48px)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 p-0 sm:max-w-[660px]"
      >
        {/* Mounted only while open, so every open starts from a fresh draft. */}
        <ServiceForm service={service} onCancel={() => onOpenChange(false)} onSave={onSave} />
      </DialogContent>
    </Dialog>
  )
}

function ServiceForm({
  service,
  onCancel,
  onSave,
}: {
  service: Service | null
  onCancel: () => void
  onSave: (input: ServiceInput) => Promise<void>
}) {
  const { enabledEquipmentTypes, currencySymbol } = useWorkshop()
  const [draft, setDraft] = React.useState<Draft>(() => toDraft(service ?? emptyServiceInput()))
  const [saving, setSaving] = React.useState(false)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const toggleEquipmentType = (id: Id) =>
    setDraft((current) => ({
      ...current,
      equipmentTypeIds: current.equipmentTypeIds.includes(id)
        ? current.equipmentTypeIds.filter((current) => current !== id)
        : [...current.equipmentTypeIds, id],
    }))

  const toggleStandardEntry = (code: StandardEntryCode) =>
    setDraft((current) => ({
      ...current,
      standardEntries: current.standardEntries.includes(code)
        ? current.standardEntries.filter((entry) => entry !== code)
        : [...current.standardEntries, code],
    }))

  const canSave = draft.name.trim().length > 0 && !saving

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
        terms: draft.terms.trim(),
        releaseTerms: draft.releaseTerms.trim(),
        completionTerms: draft.completionTerms.trim(),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader className="border-b px-6 py-5">
        <DialogTitle className="text-lg font-semibold tracking-[-0.01em]">
          {service ? "Edit service" : "Add service"}
        </DialogTitle>
        <DialogDescription>
          Define pricing, equipment, the information staff capture and the paperwork for this
          service.
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-y-auto px-6">
        {/* Basics */}
        <section className="flex flex-col gap-4 py-6">
          <SectionLabel>Basics</SectionLabel>
          <div className="grid gap-2">
            <Label htmlFor="service-name">Name</Label>
            <Input
              id="service-name"
              autoFocus
              value={draft.name}
              placeholder="e.g. Full Tune"
              onChange={(event) => set("name", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="service-description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="service-description"
              rows={2}
              value={draft.description}
              placeholder="Details shown under the service"
              onChange={(event) => set("description", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>
              Colour{" "}
              <span className="font-normal text-muted-foreground">
                — Kanban column &amp; calendar job
              </span>
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

        {/* Pricing */}
        <section className="flex flex-col gap-4 py-6">
          <SectionLabel>Pricing &amp; duration</SectionLabel>
          <div className="grid gap-2">
            <Label>Pricing model</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={draft.pricingType}
              onValueChange={(value) => value && set("pricingType", value as PricingType)}
              className="w-full"
            >
              <ToggleGroupItem
                value="fixed"
                className="h-auto flex-1 flex-col items-start gap-0.5 px-3.5 py-3 text-left data-[state=on]:border-primary"
              >
                <span className="text-sm font-semibold">Fixed price</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Same price every time
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="quoted"
                className="h-auto flex-1 flex-col items-start gap-0.5 px-3.5 py-3 text-left data-[state=on]:border-primary"
              >
                <span className="text-sm font-semibold">Quoted per job</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Priced after inspection
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="service-price">
                {draft.pricingType === "quoted" ? "Minimum price" : "Price"}
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[13px] text-muted-foreground">
                  {currencySymbol.trim()}
                </span>
                <Input
                  id="service-price"
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
            <div className="grid gap-2">
              <Label htmlFor="service-duration">Standard duration</Label>
              <div className="flex gap-2">
                <Input
                  id="service-duration"
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
          </div>
        </section>

        <Separator />

        {/* Options */}
        <section className="flex flex-col gap-4 py-6">
          <SectionLabel>Options</SectionLabel>
          <SwitchRow
            id="allow-multiples"
            title="Allow multiples per equipment item"
            description="e.g. book this service twice on one pair of skis"
            checked={draft.allowMultiples}
            onCheckedChange={(checked) => set("allowMultiples", checked)}
          />
        </section>

        <Separator />

        {/* Equipment types */}
        <section className="flex flex-col gap-4 py-6">
          <SectionLabel>Equipment types</SectionLabel>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {enabledEquipmentTypes.map((equipmentType) => (
              <SelectableTile
                key={equipmentType.id}
                label={equipmentType.name}
                selected={draft.equipmentTypeIds.includes(equipmentType.id)}
                onSelect={() => toggleEquipmentType(equipmentType.id)}
              />
            ))}
          </div>
          {enabledEquipmentTypes.length === 0 ? (
            <p className="rounded-md border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
              No equipment types are enabled yet. Enable them under Equipment Types to assign them
              here.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Only equipment types enabled under Equipment Types can be assigned here.
            </p>
          )}
        </section>

        <Separator />

        {/* Required information */}
        <section className="flex flex-col gap-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SectionLabel>Required information</SectionLabel>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Fields staff must capture when booking this service.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set("requiredInfo", [...draft.requiredInfo, makeRequiredField()])}
            >
              <PlusIcon />
              Add field
            </Button>
          </div>

          <div className="rounded-md bg-muted/60 p-3.5">
            <div className="mb-3">
              <div className="text-[13px] font-medium">Standardized entries</div>
              <div className="text-xs text-muted-foreground">
                Built-in, pre-formatted capture forms
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {STANDARD_ENTRIES.map((entry) => (
                <SelectableTile
                  key={entry.code}
                  label={entry.name}
                  hint={entry.hint}
                  selected={draft.standardEntries.includes(entry.code)}
                  onSelect={() => toggleStandardEntry(entry.code)}
                  className="bg-background"
                />
              ))}
            </div>
          </div>

          <RequiredFieldsEditor
            fields={draft.requiredInfo}
            onChange={(fields) => set("requiredInfo", fields)}
          />
        </section>

        <Separator />

        {/* Waivers */}
        <section className="flex flex-col gap-4 py-6">
          <SectionLabel>Waivers</SectionLabel>

          <SwitchRow
            id="checkin-waiver"
            title="Require check-in waiver"
            description="Customer signs when dropping equipment off, before work starts"
            checked={draft.signatureRequired}
            onCheckedChange={(checked) => set("signatureRequired", checked)}
          />
          {draft.signatureRequired ? (
            <WaiverDetails
              idPrefix="checkin"
              termsLabel="Check-in terms & conditions"
              termsPlaceholder="Liability waiver or workshop terms the customer signs at check-in"
              terms={draft.terms}
              onTermsChange={(value) => set("terms", value)}
              customerSig={draft.checkinCustomerSig}
              onCustomerSigChange={(checked) => set("checkinCustomerSig", checked)}
              staffSig={draft.checkinStaffSig}
              onStaffSigChange={(checked) => set("checkinStaffSig", checked)}
            />
          ) : null}

          <SwitchRow
            id="release-waiver"
            title="Require release waiver"
            description="Customer signs on collection to confirm the work and release the equipment"
            checked={draft.releaseWaiverRequired}
            onCheckedChange={(checked) => set("releaseWaiverRequired", checked)}
          />
          {draft.releaseWaiverRequired ? (
            <WaiverDetails
              idPrefix="release"
              termsLabel="Release terms & conditions"
              termsPlaceholder="Terms the customer signs when collecting the equipment"
              terms={draft.releaseTerms}
              onTermsChange={(value) => set("releaseTerms", value)}
              customerSig={draft.releaseCustomerSig}
              onCustomerSigChange={(checked) => set("releaseCustomerSig", checked)}
              staffSig={draft.releaseStaffSig}
              onStaffSigChange={(checked) => set("releaseStaffSig", checked)}
            />
          ) : null}
        </section>

        <Separator />

        {/* Staff confirmation on completion */}
        <section className="flex flex-col gap-4 py-6">
          <SectionLabel>Staff confirmation on completion</SectionLabel>
          <SwitchRow
            id="completion-confirmation"
            title="Require staff confirmation on completion"
            description="Staff sign the work off before the job can be marked complete"
            checked={draft.completionConfirmationRequired}
            onCheckedChange={(checked) => set("completionConfirmationRequired", checked)}
          />
          {draft.completionConfirmationRequired ? (
            <div className="grid gap-3 rounded-md bg-muted/60 p-3.5">
              <div className="grid gap-2">
                <Label htmlFor="completion-terms">Completion declaration</Label>
                <Textarea
                  id="completion-terms"
                  rows={3}
                  value={draft.completionTerms}
                  placeholder="What the technician confirms — e.g. work carried out as specified and equipment checked"
                  onChange={(event) => set("completionTerms", event.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <div className="mb-2 text-[13px] font-medium">Signatures required</div>
                <div className="flex flex-wrap gap-5">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="completion-staff-sig"
                      checked={draft.completionStaffSig}
                      onCheckedChange={(checked) => set("completionStaffSig", checked === true)}
                    />
                    <Label htmlFor="completion-staff-sig">Technician signature</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="completion-second-staff-sig"
                      checked={draft.completionSecondStaffSig}
                      onCheckedChange={(checked) =>
                        set("completionSecondStaffSig", checked === true)
                      }
                    />
                    <Label htmlFor="completion-second-staff-sig">Second staff check</Label>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <Separator />

        {/* Dockets */}
        <section className="flex flex-col gap-4 py-6">
          <SectionLabel>Dockets</SectionLabel>
          <div className="flex items-center justify-between gap-4 rounded-md border p-3.5">
            <div>
              <div className="text-[13px] font-medium">Dockets printed per job</div>
              <div className="text-xs text-muted-foreground">
                Number of paper dockets produced when the job is created
              </div>
            </div>
            <NumberStepper
              label="Dockets printed per job"
              value={draft.docketCount}
              onChange={(value) => set("docketCount", value)}
            />
          </div>
        </section>
      </div>

      <DialogFooter className="border-t px-6 py-4">
        <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" disabled={!canSave} onClick={handleSave}>
          {saving ? "Saving…" : service ? "Save changes" : "Add service"}
        </Button>
      </DialogFooter>
    </>
  )
}

function SwitchRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border p-3.5">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-[13px] font-medium">
          {title}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function WaiverDetails({
  idPrefix,
  termsLabel,
  termsPlaceholder,
  terms,
  onTermsChange,
  customerSig,
  onCustomerSigChange,
  staffSig,
  onStaffSigChange,
}: {
  idPrefix: string
  termsLabel: string
  termsPlaceholder: string
  terms: string
  onTermsChange: (value: string) => void
  customerSig: boolean
  onCustomerSigChange: (checked: boolean) => void
  staffSig: boolean
  onStaffSigChange: (checked: boolean) => void
}) {
  return (
    <div className="grid gap-3 rounded-md bg-muted/60 p-3.5">
      <div className="grid gap-2">
        <Label htmlFor={idPrefix + "-terms"}>{termsLabel}</Label>
        <Textarea
          id={idPrefix + "-terms"}
          rows={3}
          value={terms}
          placeholder={termsPlaceholder}
          onChange={(event) => onTermsChange(event.target.value)}
          className="bg-background"
        />
      </div>
      <div>
        <div className="mb-2 text-[13px] font-medium">Signatures required</div>
        <div className="flex flex-wrap gap-5">
          <div className="flex items-center gap-2">
            <Checkbox
              id={idPrefix + "-customer-sig"}
              checked={customerSig}
              onCheckedChange={(checked) => onCustomerSigChange(checked === true)}
            />
            <Label htmlFor={idPrefix + "-customer-sig"}>Customer signature</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={idPrefix + "-staff-sig"}
              checked={staffSig}
              onCheckedChange={(checked) => onStaffSigChange(checked === true)}
            />
            <Label htmlFor={idPrefix + "-staff-sig"}>Staff signature</Label>
          </div>
        </div>
      </div>
    </div>
  )
}
