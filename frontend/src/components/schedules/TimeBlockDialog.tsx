import { useMemo, useState } from "react";
import { ChevronDownIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FieldLabel } from "@/components/common/FieldLabel";
import { CategoryDot } from "@/components/common/CategoryChip";
import { CATEGORIES, CATEGORY_LIST } from "@/lib/categories";
import {
  INTERVAL_OPTIONS,
  LEAD_UNITS,
  DAY_NAMES,
  blockMinutes,
  formatDuration,
  timeOptions,
  toMinutes,
  toTimeString,
} from "@/lib/time";
import { fieldErrorsFrom, timeBlockSchema } from "@/lib/validation";
import type {
  BookingInterval,
  Break,
  Day,
  LeadTime,
  LeadUnit,
  Service,
  ServiceCategory,
  TimeBlock,
} from "@/lib/types";
import type { TimeBlockInput } from "@/lib/api";

const TIME_OPTIONS = timeOptions(15);

const DEFAULT_LEAD: LeadTime = {
  custom: false,
  min: 2,
  minUnit: "h",
  max: 60,
  maxUnit: "d",
};

export interface TimeBlockDraft {
  /** null when creating. */
  id: string | null;
  staffId: string;
  day: Day;
  start: string;
  end: string;
  services: ServiceCategory[];
  appointments: string[];
  recurring: boolean;
  enabled: boolean;
  interval: BookingInterval;
  online: boolean;
  breaks: Break[];
  lead: Record<string, LeadTime>;
}

export function draftFromBlock(block: TimeBlock): TimeBlockDraft {
  return {
    id: block.id,
    staffId: block.staffId,
    day: block.day,
    start: block.start,
    end: block.end,
    services: [...block.services],
    appointments: [...block.appointments],
    recurring: block.recurring,
    enabled: block.enabled,
    interval: block.interval,
    online: block.online,
    breaks: block.breaks.map((b) => ({ ...b })),
    lead: structuredClone(block.lead),
  };
}

export function newDraft(staffId: string, day: Day): TimeBlockDraft {
  return {
    id: null,
    staffId,
    day,
    start: "09:00",
    end: "17:00",
    services: [],
    appointments: [],
    recurring: true,
    enabled: true,
    interval: 30,
    online: true,
    breaks: [],
    lead: {},
  };
}

interface TimeBlockDialogProps {
  /** Non-null: the parent mounts this only while a draft is open. */
  draft: TimeBlockDraft;
  services: Service[];
  onOpenChange: (open: boolean) => void;
  onSave: (draft: TimeBlockDraft, input: TimeBlockInput) => void;
  onRemove: (id: string) => void;
  saving?: boolean;
}

export function TimeBlockDialog({
  draft,
  services,
  onOpenChange,
  onSave,
  onRemove,
  saving = false,
}: TimeBlockDialogProps) {
  const [value, setValue] = useState<TimeBlockDraft>(draft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<ServiceCategory[]>([]);

  const servicesByCategory = useMemo(() => {
    const grouped = {} as Record<ServiceCategory, Service[]>;
    for (const category of CATEGORY_LIST) {
      grouped[category.id] = services.filter((s) => s.category === category.id);
    }
    return grouped;
  }, [services]);

  const isEdit = value.id !== null;
  const duration = blockMinutes(value.start, value.end, value.breaks);

  function patch(partial: Partial<TimeBlockDraft>) {
    setValue((current) => ({ ...current, ...partial }));
  }

  function handleStartChange(start: string) {
    // Keep the end after the start, as the prototype does.
    if (toMinutes(start) >= toMinutes(value.end)) {
      patch({ start, end: toTimeString(toMinutes(start) + 60) });
      return;
    }
    patch({ start });
  }

  function addBreak() {
    const midpoint =
      toMinutes(value.start) +
      Math.floor((toMinutes(value.end) - toMinutes(value.start)) / 2);
    const start = toTimeString(Math.round(midpoint / 15) * 15);
    patch({
      breaks: [
        ...value.breaks,
        { start, end: toTimeString(toMinutes(start) + 30) },
      ],
    });
  }

  function updateBreak(index: number, partial: Partial<Break>) {
    patch({
      breaks: value.breaks.map((b, i) =>
        i === index ? { ...b, ...partial } : b,
      ),
    });
  }

  function removeBreak(index: number) {
    patch({ breaks: value.breaks.filter((_, i) => i !== index) });
  }

  /** Categories follow the service selection: a category shows once any of its services is bookable. */
  function categoriesFor(appointments: string[]): ServiceCategory[] {
    const selected = new Set(appointments);
    return CATEGORY_LIST.filter((category) =>
      servicesByCategory[category.id]?.some((s) => selected.has(s.id)),
    ).map((c) => c.id);
  }

  function toggleService(service: Service, checked: boolean) {
    const appointments = checked
      ? [...new Set([...value.appointments, service.id])]
      : value.appointments.filter((id) => id !== service.id);
    patch({ appointments, services: categoriesFor(appointments) });
  }

  function toggleCategory(category: ServiceCategory, checked: boolean) {
    const ids = (servicesByCategory[category] ?? []).map((s) => s.id);
    const appointments = checked
      ? [...new Set([...value.appointments, ...ids])]
      : value.appointments.filter((id) => !ids.includes(id));
    patch({ appointments, services: categoriesFor(appointments) });
  }

  function leadFor(serviceId: string): LeadTime {
    return value.lead[serviceId] ?? DEFAULT_LEAD;
  }

  function patchLead(serviceId: string, partial: Partial<LeadTime>) {
    patch({
      lead: {
        ...value.lead,
        [serviceId]: { ...leadFor(serviceId), ...partial },
      },
    });
  }

  function handleSave() {
    const parsed = timeBlockSchema.safeParse({
      start: value.start,
      end: value.end,
      breaks: value.breaks,
    });
    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error));
      return;
    }
    setErrors({});
    const { id: _id, ...input } = value;
    onSave(value, input);
  }

  const breakNote =
    value.breaks.length > 0
      ? "Blocks online bookings. Staff can still book manually."
      : null;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] max-w-[600px] flex-col gap-0 p-0"
        showCloseButton={false}
      >
        <DialogHeader className="border-divider flex-row items-center gap-3 border-b px-5 py-4">
          <div className="min-w-0 flex-1">
            <DialogTitle>
              {isEdit ? "Edit time block" : "Add time block"}
            </DialogTitle>
            <p className="text-muted-foreground mt-1 text-[12.5px]">
              {DAY_NAMES[value.day]}
            </p>
          </div>
          <div className="flex items-center gap-2 pr-8">
            <span
              className={cn(
                "text-[12px] font-semibold",
                value.enabled
                  ? "text-primary-hover"
                  : "text-placeholder-foreground",
              )}
            >
              {value.enabled ? "Active" : "Inactive"}
            </span>
            <Switch
              checked={value.enabled}
              onCheckedChange={(enabled) => patch({ enabled })}
              aria-label="Time block active"
            />
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-tertiary-foreground hover:bg-track hover:text-foreground focus-ring absolute top-4 right-4 flex size-7 items-center justify-center rounded-md transition-colors"
            aria-label="Close"
          >
            <span aria-hidden>×</span>
          </button>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* 1 — times and breaks */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1 basis-0 space-y-1.5">
              <FieldLabel htmlFor="block-start">Start</FieldLabel>
              <Select value={value.start} onValueChange={handleStartChange}>
                <SelectTrigger id="block-start" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 flex-1 basis-0 space-y-1.5">
              <FieldLabel htmlFor="block-end">End</FieldLabel>
              <Select value={value.end} onValueChange={(end) => patch({ end })}>
                <SelectTrigger
                  id="block-end"
                  className="w-full"
                  aria-invalid={Boolean(errors.end)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {value.breaks.map((brk, index) => (
              <div key={index} className="min-w-0 flex-1 basis-0 space-y-1.5">
                <FieldLabel>Break</FieldLabel>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={brk.start}
                    onValueChange={(start) => updateBreak(index, { start })}
                  >
                    <SelectTrigger className="min-w-0 flex-1 px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[260px]">
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={brk.end}
                    onValueChange={(end) => updateBreak(index, { end })}
                  >
                    <SelectTrigger className="min-w-0 flex-1 px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[260px]">
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => removeBreak(index)}
                    className="text-placeholder-foreground hover:bg-destructive-tint hover:text-destructive focus-ring flex size-7 shrink-0 items-center justify-center rounded-md transition-colors"
                    aria-label={`Remove break ${index + 1}`}
                  >
                    <Trash2Icon className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
              onClick={addBreak}
            >
              <PlusIcon /> Break
            </Button>
          </div>

          {(errors.end ||
            Object.keys(errors).some((k) => k.startsWith("breaks"))) && (
            <p className="text-destructive text-[12px]">
              {errors.end ??
                errors[
                  Object.keys(errors).find((k) => k.startsWith("breaks")) ?? ""
                ]}
            </p>
          )}

          {/* 2 — duration and online */}
          <div className="border-border bg-muted flex items-center justify-between gap-3 rounded-lg border px-[15px] py-3.5">
            <div className="text-[13px]">
              <span className="text-muted-foreground">Duration </span>
              <span className="font-heading font-semibold">
                {formatDuration(duration)}
              </span>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium">
              <Checkbox
                checked={value.online}
                onCheckedChange={(checked) =>
                  patch({ online: checked === true })
                }
                aria-label="Available online"
              />
              Available online
            </label>
          </div>

          {/* 3 — break note */}
          {breakNote && (
            <p className="text-muted-foreground text-[12px]">{breakNote}</p>
          )}

          {/* 4 — repeat */}
          <div className="space-y-2">
            <FieldLabel>Repeat</FieldLabel>
            <ToggleGroup
              type="single"
              value={value.recurring ? "recurring" : "once"}
              onValueChange={(next) => {
                if (next) patch({ recurring: next === "recurring" });
              }}
            >
              <ToggleGroupItem value="recurring">
                Recurring weekly
              </ToggleGroupItem>
              <ToggleGroupItem value="once">This week only</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* 5 — booking interval */}
          <div className="space-y-2">
            <FieldLabel>Booking interval</FieldLabel>
            <ToggleGroup
              type="single"
              value={String(value.interval)}
              onValueChange={(next) => {
                if (next) patch({ interval: Number(next) as BookingInterval });
              }}
            >
              {INTERVAL_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={String(option.value)}
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-muted-foreground text-[12px]">
              Bookings start at the slot beginning, then repeat at this spacing.
            </p>
          </div>

          {/* 6 — bookable services */}
          <div className="space-y-2">
            <FieldLabel>Bookable during this slot</FieldLabel>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORY_LIST.map((category) => {
                const categoryServices = servicesByCategory[category.id] ?? [];
                const selected = categoryServices.filter((s) =>
                  value.appointments.includes(s.id),
                );
                const allSelected =
                  categoryServices.length > 0 &&
                  selected.length === categoryServices.length;
                const isOpen = expanded.includes(category.id);

                return (
                  <div
                    key={category.id}
                    className="border-border overflow-hidden rounded-lg border"
                  >
                    <div className="bg-muted border-divider flex items-center gap-2 border-b px-2.5 py-2">
                      <Checkbox
                        checked={
                          allSelected
                            ? true
                            : selected.length > 0
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={(checked) =>
                          toggleCategory(category.id, checked !== false)
                        }
                        aria-label={`Select all ${CATEGORIES[category.id].label}`}
                      >
                        {!allSelected && selected.length > 0 ? (
                          <span
                            className="block h-[2.5px] w-2 rounded-full bg-current"
                            aria-hidden
                          />
                        ) : undefined}
                      </Checkbox>
                      <CategoryDot category={category.id} />
                      <span className="flex-1 truncate text-[12.5px] font-semibold">
                        {category.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((current) =>
                            current.includes(category.id)
                              ? current.filter((c) => c !== category.id)
                              : [...current, category.id],
                          )
                        }
                        className="text-tertiary-foreground hover:text-primary focus-ring flex items-center gap-1 rounded-sm text-[11px] font-medium"
                        aria-expanded={isOpen}
                      >
                        Select all · {categoryServices.length}
                        <ChevronDownIcon
                          className={cn(
                            "size-3 transition-transform",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>
                    </div>

                    {isOpen && (
                      <div className="divide-divider-light divide-y">
                        {categoryServices.map((service) => {
                          const isSelected = value.appointments.includes(
                            service.id,
                          );
                          const lead = leadFor(service.id);
                          return (
                            <div key={service.id} className="px-2.5 py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) =>
                                    toggleService(service, checked === true)
                                  }
                                  aria-label={service.name}
                                />
                                <span className="min-w-0 flex-1 truncate text-[12.5px]">
                                  {service.name}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  "mt-1.5 flex items-center justify-between gap-2 pl-6",
                                  !isSelected &&
                                    "pointer-events-none opacity-45",
                                )}
                              >
                                <span className="text-tertiary-foreground text-[11px]">
                                  Custom lead time
                                </span>
                                <Switch
                                  checked={lead.custom}
                                  disabled={!isSelected}
                                  onCheckedChange={(custom) =>
                                    patchLead(service.id, { custom })
                                  }
                                  aria-label={`Custom lead time for ${service.name}`}
                                />
                              </div>
                              {isSelected && lead.custom && (
                                <div className="mt-1.5 flex items-center gap-1.5 pl-6">
                                  <span className="text-tertiary-foreground text-[11px]">
                                    Max
                                  </span>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={lead.max}
                                    onChange={(e) =>
                                      patchLead(service.id, {
                                        max: Number(e.target.value),
                                      })
                                    }
                                    className="h-7 w-12 px-1.5 text-center text-[12px]"
                                    aria-label={`Maximum lead time for ${service.name}`}
                                  />
                                  <LeadUnitSelect
                                    value={lead.maxUnit}
                                    onChange={(maxUnit) =>
                                      patchLead(service.id, { maxUnit })
                                    }
                                    label={`Maximum lead time unit for ${service.name}`}
                                  />
                                  <span className="text-tertiary-foreground ml-1 text-[11px]">
                                    Min
                                  </span>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={lead.min}
                                    onChange={(e) =>
                                      patchLead(service.id, {
                                        min: Number(e.target.value),
                                      })
                                    }
                                    className="h-7 w-12 px-1.5 text-center text-[12px]"
                                    aria-label={`Minimum lead time for ${service.name}`}
                                  />
                                  <LeadUnitSelect
                                    value={lead.minUnit}
                                    onChange={(minUnit) =>
                                      patchLead(service.id, { minUnit })
                                    }
                                    label={`Minimum lead time unit for ${service.name}`}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="border-divider border-t px-5 py-3.5 sm:justify-between">
          {isEdit ? (
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive-tint hover:text-destructive-strong border-destructive-border"
              onClick={() => value.id && onRemove(value.id)}
            >
              Remove
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {isEdit ? "Save changes" : "Add block"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeadUnitSelect({
  value,
  onChange,
  label,
}: {
  value: LeadUnit;
  onChange: (unit: LeadUnit) => void;
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as LeadUnit)}>
      <SelectTrigger
        size="sm"
        className="h-7 w-[64px] px-1.5 text-[12px]"
        aria-label={label}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_UNITS.map((unit) => (
          <SelectItem key={unit.value} value={unit.value}>
            {unit.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
