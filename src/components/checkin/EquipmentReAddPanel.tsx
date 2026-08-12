import { Check } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { TypeBadge } from "../Pills";

export function EquipmentReAddPanel() {
  const nf = useAppStore((s) => s.nf);
  const customers = useAppStore((s) => s.customers);
  const toggleCustEquip = useAppStore((s) => s.toggleCustEquip);

  const custSelected = !!nf.customerId || !!(nf.customer && nf.customer.trim());
  const cust = customers.find((c) => c.id === nf.customerId);

  return (
    <div className="@container order-2 flex min-w-0 flex-col gap-[11px]">
      <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Equipment to re-add</span>
      {!custSelected && (
        <div className="flex h-11 items-center justify-center rounded-[10px] border border-dashed border-border px-3 text-center text-xs text-zinc-400">
          Select a customer to see their equipment
        </div>
      )}
      {custSelected && (!cust || cust.equipment.length === 0) && (
        <div className="flex h-11 items-center justify-center rounded-[10px] border border-dashed border-border text-xs text-zinc-400">
          No equipment on file
        </div>
      )}
      {custSelected && cust && cust.equipment.length > 0 && (
        <div className="flex flex-col gap-[7px]">
          {cust.equipment.map((eq, i) => {
            const on = nf.brand === eq.brand && nf.model === eq.model && nf.size === eq.size && nf.type === eq.type;
            return (
              <div
                key={i}
                onClick={() => toggleCustEquip(eq)}
                className="flex cursor-pointer items-center gap-[9px] rounded-[9px] border p-[9px_11px]"
                style={{ background: on ? "#f0fdf4" : "#ffffff", borderColor: on ? "#86efac" : "#e4e4e7", boxShadow: on ? "0 0 0 1px #86efac" : "none" }}
              >
                <TypeBadge type={eq.type} />
                {/* Long names truncate rather than shoving the "Added" tag past the border. */}
                <div className="flex min-w-0 flex-1 items-center gap-[9px]">
                  <span className="truncate text-[13px] font-semibold text-zinc-900">{eq.brand}</span>
                  <span className="truncate text-xs text-zinc-500">{eq.model}</span>
                  <span className="flex-shrink-0 text-xs font-medium text-zinc-400">{eq.size}</span>
                </div>
                {/* Below this width there is no room for the tag at all, so the green
                    highlight alone carries the "added" state. */}
                {on && (
                  <span className="hidden items-center gap-1 whitespace-nowrap rounded-full border border-[#86efac] bg-[#dcfce7] px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-[#15803d] @min-[290px]:inline-flex">
                    <Check size={11} strokeWidth={3} />
                    Added
                  </span>
                )}
                {/* Tracking code, pinned to the right edge as plain text. Dropped once the
                    panel is too narrow to carry it. */}
                {eq.code && (
                  <span className="hidden flex-shrink-0 text-[10px] font-semibold tracking-wide text-zinc-400 @min-[240px]:inline">
                    {eq.code}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
