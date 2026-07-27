import { useState } from "react";
import { Check, ChevronDown, Landmark, Plus, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Avatar } from "../Pills";
import { CustomerSearch } from "./CustomerSearch";
import { EquipmentReAddPanel } from "./EquipmentReAddPanel";
import { NewEquipmentForm } from "./NewEquipmentForm";
import { ServicesSection } from "./ServicesSection";
import { DueDatePicker } from "./DueDatePicker";
import { CheckoutColumn } from "./CheckoutColumn";
import { StaffSelectorModal } from "./StaffSelectorModal";
import { pickupSlots } from "../../lib/serviceCatalog";

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

  const [staffMenuOpen, setStaffMenuOpen] = useState(false);

  if (!newOpen) return null;

  const title = editId ? `Edit ${editId}` : "Check in New Equipment";
  const slots = pickupSlots();

  return (
    <div className="animate-sheet-fade fixed inset-0 z-40" style={{ background: "rgba(9,9,11,0.45)" }} onClick={closeNew}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-slide absolute bottom-0 right-0 top-0 flex w-[1060px] max-w-[97vw] flex-col overflow-hidden border-l border-border bg-white"
        style={{ boxShadow: "-12px 0 40px rgba(0,0,0,0.18)" }}
      >
        <StaffSelectorModal />

        {/* Header */}
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-app-bg px-5 py-[18px]">
          <span className="text-base font-bold tracking-tight">{title}</span>
          <div className="flex items-center gap-1.5 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-[11px] py-1">
            <Landmark size={12} color="#0284c7" />
            <span className="whitespace-nowrap text-xs font-semibold text-sky-hover">City Skis</span>
          </div>
          <div className="flex-1" />
          <div className="relative">
            {staffMenuOpen && <div className="fixed inset-0 z-[44]" onClick={() => setStaffMenuOpen(false)} />}
            <button
              onClick={() => setStaffMenuOpen((v) => !v)}
              title="Change staff member"
              className="relative z-[45] flex h-[34px] items-center gap-2 rounded-full border border-border bg-white py-[3px] pl-[3px] pr-2.5 hover:bg-app-bg"
            >
              <Avatar name={activeStaff || "?"} size={28} />
              <span className="whitespace-nowrap text-[12.5px] font-semibold text-zinc-900">{activeStaff}</span>
              <ChevronDown size={13} color="#a1a1aa" />
            </button>
            {staffMenuOpen && (
              <div className="absolute right-0 top-10 z-[46] min-w-[212px] rounded-[11px] border border-border bg-white p-[5px] shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
                <div className="px-[9px] pb-1 pt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Serving as</div>
                {staffList.map((name) => (
                  <div
                    key={name}
                    onClick={() => {
                      setStaff(name);
                      setStaffMenuOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg p-[7px_9px] hover:bg-app-bg"
                  >
                    <Avatar name={name} size={28} />
                    <span className="flex-1 text-[13px] font-medium text-zinc-900">{name}</span>
                    {name === activeStaff && <Check size={15} strokeWidth={2.6} color="#0284c7" />}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={closeNew} className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-app-bg hover:text-ink">
            <X size={17} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex flex-1 flex-col gap-[22px] overflow-y-auto bg-surface-50 p-5">
            <div className="flex flex-col gap-[11px]">
              <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Customer Details</span>
              <CustomerSearch />
            </div>

            <div className="grid min-w-0 grid-cols-2 items-start gap-[22px]">
              <NewEquipmentForm />
              <EquipmentReAddPanel />
            </div>

            <ServicesSection />

            <div className="flex flex-col gap-[11px]">
              <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Collection</span>
              <div className="flex gap-2.5">
                <div className="flex flex-1 flex-col gap-1.5">
                  <span className="text-[11px] text-zinc-500">Due date</span>
                  <DueDatePicker />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <span className="text-[11px] text-zinc-500">Pickup</span>
                  <select
                    value={nf.pickup}
                    onChange={(e) => patchNf({ pickup: e.target.value })}
                    className="h-[38px] w-full cursor-pointer rounded-[9px] border border-border px-2.5 text-[13px] outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
                  >
                    <option value="">Select time</option>
                    {slots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Notes</span>
              <textarea
                value={nf.notes}
                onChange={(e) => patchNf({ notes: e.target.value })}
                placeholder="Any notes for this job..."
                className="min-h-[72px] w-full resize-y rounded-[9px] border border-border px-3 py-2.5 text-[13px] leading-relaxed outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
              />
            </div>

            <button
              onClick={addAnotherItem}
              disabled={!nf.brand.trim()}
              className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-[15px] text-[13px] font-semibold text-white"
              style={{
                background: nf.brand.trim() ? "#0284c7" : "#bae6fd",
                cursor: nf.brand.trim() ? "pointer" : "not-allowed",
                boxShadow: nf.brand.trim() ? "0 1px 2px rgba(2,132,199,0.35)" : "none",
              }}
            >
              <Plus size={14} strokeWidth={2.4} />
              Add Equipment to Job
            </button>
          </div>

          <CheckoutColumn />
        </div>
      </div>
    </div>
  );
}
