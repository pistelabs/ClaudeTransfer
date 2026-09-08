import { Check } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { TypeBadge } from "../Pills";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
                className={cn(
                  "flex cursor-pointer items-center gap-[9px] rounded-lg border px-3 py-2.5",
                  on ? "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-300" : "bg-white",
                )}
              >
                <TypeBadge type={eq.type} />
                {/* Long names truncate rather than shoving the "Added" tag past the border. */}
                <div className="flex min-w-0 flex-1 items-center gap-[9px]">
                  <span className="truncate text-[13px] font-semibold">{eq.brand}</span>
                  <span className="text-muted-foreground truncate text-xs">{eq.model}</span>
                  <span className="text-muted-foreground shrink-0 text-xs font-medium">{eq.size}</span>
                </div>
                {/* Below this width there is no room for the tag at all, so the green
                    highlight alone carries the "added" state. */}
                {on && (
                  <Badge
                    variant="outline"
                    className="hidden gap-1 rounded-full border-emerald-300 bg-emerald-100 text-[10.5px] font-bold tracking-wide text-emerald-700 @min-[290px]:inline-flex"
                  >
                    <Check size={11} strokeWidth={3} />
                    Added
                  </Badge>
                )}
                {/* Tracking code, pinned to the right edge as plain text. Dropped once the
                    panel is too narrow to carry it. */}
                {eq.code && (
                  <span className="text-muted-foreground hidden shrink-0 text-[10px] font-semibold tracking-wide @min-[240px]:inline">
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
