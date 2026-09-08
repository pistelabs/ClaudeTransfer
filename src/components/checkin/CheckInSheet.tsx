import { Check, ChevronDown, Landmark, Plus } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Avatar } from "../Pills";
import { CustomerSearch } from "./CustomerSearch";
import { EquipmentReAddPanel } from "./EquipmentReAddPanel";
import { NewEquipmentForm } from "./NewEquipmentForm";
import { ServicesSection } from "./ServicesSection";
import { DueDatePicker } from "./DueDatePicker";
import { CheckoutColumn } from "./CheckoutColumn";
import { StaffSelectorModal } from "./StaffSelectorModal";
import { WaiverModal } from "./WaiverModal";
import { pickupSlots } from "../../lib/serviceCatalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

export function CheckInSheet() {
  const newOpen = useAppStore((s) => s.newOpen);
  const editId = useAppStore((s) => s.editId);
  const closeNew = useAppStore((s) => s.closeNew);
  const activeStaff = useAppStore((s) => s.activeStaff);
  const staffList = useAppStore((s) => s.staffList);
  const setStaff = useAppStore((s) => s.setStaff);
  const nf = useAppStore((s) => s.nf);
  const patchNf = useAppStore((s) => s.patchNf);
  const addAnotherItem = useAppStore((s) => s.addAnotherItem);

  const title = editId ? `Edit ${editId}` : "Check in New Equipment";
  const slots = pickupSlots();

  return (
    <Sheet open={newOpen} onOpenChange={(open) => !open && closeNew()}>
      <SheetContent
        side="right"
        // The sheet is a form: focusing a field on open would put barcode scans into it.
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[1060px] gap-0 p-0 sm:max-w-[97vw]"
      >
        <StaffSelectorModal />
        <WaiverModal />

        {/* Header */}
        <div className="border-app-bg flex shrink-0 items-center gap-3 border-b px-5 py-4">
          <SheetTitle className="text-base tracking-tight">{title}</SheetTitle>
          <SheetDescription className="sr-only">
            Build a job by adding a customer, equipment and services.
          </SheetDescription>
          <Badge variant="outline" className="gap-1.5 rounded-full border-sky-200 bg-sky-50 text-sky-700">
            <Landmark className="size-3" />
            City Skis
          </Badge>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                title="Change staff member"
                className="h-9 gap-2 rounded-full py-0.5 pr-2.5 pl-0.5"
              >
                <Avatar name={activeStaff || "?"} size={28} />
                <span className="text-sm font-semibold">{activeStaff}</span>
                <ChevronDown className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[212px]">
              <DropdownMenuLabel className="text-muted-foreground text-xs tracking-wide uppercase">
                Serving as
              </DropdownMenuLabel>
              {staffList.map((name) => (
                <DropdownMenuItem key={name} onSelect={() => setStaff(name)} className="gap-2.5">
                  <Avatar name={name} size={28} />
                  <span className="flex-1 text-sm font-medium">{name}</span>
                  {name === activeStaff && <Check className="text-sky size-4" strokeWidth={2.6} />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* SheetContent supplies its own close button, positioned top-right. */}
          <div className="w-6 shrink-0" />
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="bg-surface-50 flex flex-1 flex-col gap-[22px] overflow-y-auto p-5">
              <div className="flex flex-col gap-[11px]">
                <span className="text-muted-foreground text-[10.5px] font-bold tracking-wide uppercase">
                  Customer Details
                </span>
                <CustomerSearch />
              </div>

              <div className="grid min-w-0 grid-cols-2 items-start gap-[22px]">
                <NewEquipmentForm />
                <EquipmentReAddPanel />
              </div>

              <ServicesSection />

              <div className="flex flex-col gap-[11px]">
                <span className="text-muted-foreground text-[10.5px] font-bold tracking-wide uppercase">
                  Collection
                </span>
                <div className="flex gap-2.5">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <span className="text-muted-foreground text-[11px]">Due date</span>
                    <DueDatePicker />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <span className="text-muted-foreground text-[11px]">Pickup</span>
                    <Select value={nf.pickup || undefined} onValueChange={(v) => patchNf({ pickup: v })}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {slots.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-[10.5px] font-bold tracking-wide uppercase">Notes</span>
                <Textarea
                  value={nf.notes}
                  onChange={(e) => patchNf({ notes: e.target.value })}
                  placeholder="Any notes for this job..."
                  className="min-h-[72px] resize-y bg-white"
                />
              </div>
            </div>

            <div className="shrink-0 border-t bg-white p-4">
              <Button onClick={addAnotherItem} disabled={!nf.brand.trim()} size="lg" className="w-full">
                <Plus strokeWidth={2.4} />
                Add Equipment to Job
              </Button>
            </div>
          </div>

          <CheckoutColumn />
        </div>
      </SheetContent>
    </Sheet>
  );
}
