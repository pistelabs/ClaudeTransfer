import { useState } from "react";
import { GlobeIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { SettingCard } from "@/components/common/SettingCard";
import { CopyField } from "@/components/common/CopyField";
import { QrCode } from "@/components/common/QrCode";
import { FieldLabel } from "@/components/common/FieldLabel";
import { WalkInServicesDialog } from "./WalkInServicesDialog";
import { LEAD_UNITS } from "@/lib/time";
import {
  useServices,
  useStoreSettings,
  useUpdateStoreSettings,
} from "@/lib/api/queries";
import type { LeadUnit } from "@/lib/types";

export function BookingPage() {
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: settings, isLoading } = useStoreSettings();
  const { data: services = [] } = useServices();
  const updateSettings = useUpdateStoreSettings();

  if (isLoading || !settings) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[52px] w-[320px]" />
        <Skeleton className="h-[220px] w-full rounded-xl" />
        <Skeleton className="h-[220px] w-full rounded-xl" />
      </div>
    );
  }

  const { booking, walkIn } = settings;

  return (
    <div>
      <PageHeader
        title="Booking"
        subtitle="Take bookings online and let walk-ins join the queue."
      />

      <div className="space-y-3">
        <SettingCard
          icon={<GlobeIcon className="size-5" />}
          title="Accept online bookings"
          description="When off, your booking page shows as fully booked."
          checked={booking.onlineEnabled}
          switchLabel="Accept online bookings"
          onCheckedChange={(onlineEnabled) => {
            updateSettings.mutate({ booking: { ...booking, onlineEnabled } });
            toast.success(
              onlineEnabled ? "Online bookings on" : "Online bookings off",
            );
          }}
        >
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "1.3fr 1fr" }}
          >
            <div>
              <FieldLabel>Online booking page</FieldLabel>
              <div className="mt-2 flex items-start gap-3">
                <QrCode value={booking.url} />
                <div className="min-w-0 flex-1">
                  <CopyField
                    url={booking.url}
                    toastTitle="Booking link copied"
                    showVisit
                  />
                </div>
              </div>
            </div>

            <div>
              <FieldLabel>Booking lead time</FieldLabel>
              <div className="mt-2 space-y-2.5">
                <LeadTimeRow
                  label="Minimum notice"
                  value={booking.minNotice.value}
                  unit={booking.minNotice.unit}
                  onChange={(value, unit) =>
                    updateSettings.mutate({
                      booking: { ...booking, minNotice: { value, unit } },
                    })
                  }
                />
                <LeadTimeRow
                  label="Maximum ahead"
                  value={booking.maxAhead.value}
                  unit={booking.maxAhead.unit}
                  onChange={(value, unit) =>
                    updateSettings.mutate({
                      booking: { ...booking, maxAhead: { value, unit } },
                    })
                  }
                />
                <p className="text-muted-foreground text-[12px]">
                  Applies to all online bookings.
                </p>
              </div>
            </div>
          </div>
        </SettingCard>

        <SettingCard
          icon={<UsersIcon className="size-5" />}
          tileClassName="bg-teal-50 text-teal-700"
          title="Walk-in check-ins"
          description="Let customers check in on arrival and join the queue."
          checked={walkIn.enabled}
          switchLabel="Accept walk-in check-ins"
          onCheckedChange={(enabled) => {
            updateSettings.mutate({ walkIn: { ...walkIn, enabled } });
            toast.success(enabled ? "Walk-ins on" : "Walk-ins off");
          }}
        >
          <div className="space-y-4">
            <div>
              <FieldLabel>Self check-in link</FieldLabel>
              <div className="mt-2 flex items-start gap-3">
                <QrCode value={walkIn.url} />
                <div className="min-w-0 flex-1 space-y-2">
                  <CopyField
                    url={walkIn.url}
                    toastTitle="Check-in link copied"
                  />
                  <p className="text-muted-foreground text-[12px]">
                    Print the QR code for the counter so customers can scan and
                    join the queue.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="max-queue">
                  Maximum queue length
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    id="max-queue"
                    type="number"
                    min={1}
                    value={walkIn.maxQueue}
                    onChange={(e) =>
                      updateSettings.mutate({
                        walkIn: { ...walkIn, maxQueue: Number(e.target.value) },
                      })
                    }
                    className="w-20"
                  />
                  <span className="text-muted-foreground text-[13px]">
                    people
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Bookable on walk-in</FieldLabel>
                <Button variant="outline" onClick={() => setPickerOpen(true)}>
                  Select services
                  <span className="bg-sky-50 text-primary-hover ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold">
                    {walkIn.serviceIds.length}
                  </span>
                </Button>
              </div>

              <div className="flex flex-col gap-2 pb-2">
                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <Checkbox
                    checked={walkIn.cutoffWhenFull}
                    onCheckedChange={(checked) =>
                      updateSettings.mutate({
                        walkIn: { ...walkIn, cutoffWhenFull: checked === true },
                      })
                    }
                    aria-label="Close check-ins when the queue is full"
                  />
                  Close check-ins when the queue is full
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <Checkbox
                    checked={walkIn.notifyWhenClose}
                    onCheckedChange={(checked) =>
                      updateSettings.mutate({
                        walkIn: {
                          ...walkIn,
                          notifyWhenClose: checked === true,
                        },
                      })
                    }
                    aria-label="Notify customers when their turn is close"
                  />
                  Notify customers when their turn is close
                </label>
              </div>
            </div>
          </div>
        </SettingCard>
      </div>

      {pickerOpen && (
        <WalkInServicesDialog
          services={services}
          selectedIds={walkIn.serviceIds}
          onOpenChange={setPickerOpen}
          onSave={(serviceIds) => {
            updateSettings.mutate({ walkIn: { ...walkIn, serviceIds } });
            toast.success("Walk-in services saved", {
              description: `${serviceIds.length} service${serviceIds.length === 1 ? "" : "s"} bookable`,
            });
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

function LeadTimeRow({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  unit: LeadUnit;
  onChange: (value: number, unit: LeadUnit) => void;
}) {
  const id = `lead-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-muted-foreground text-[13px]">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <Input
          id={id}
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Number(e.target.value), unit)}
          className="w-[72px]"
        />
        <Select
          value={unit}
          onValueChange={(next) => onChange(value, next as LeadUnit)}
        >
          <SelectTrigger className="w-[88px]" aria-label={`${label} unit`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEAD_UNITS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
