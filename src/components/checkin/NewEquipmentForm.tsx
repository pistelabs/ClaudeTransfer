import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { EQUIPMENT_CATEGORIES } from "../../types";

export function NewEquipmentForm() {
  const nf = useAppStore((s) => s.nf);
  const patchNf = useAppStore((s) => s.patchNf);
  const nfSetCategory = useAppStore((s) => s.nfSetCategory);
  const [open, setOpen] = useState(false);

  return (
    <div className="order-1 flex min-w-0 flex-col gap-[9px]">
      <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Enter new equipment</span>
      <div className="flex gap-2">
        <div className="relative w-[128px] flex-shrink-0">
          {open && <div className="fixed inset-0 z-[5]" onClick={() => setOpen(false)} />}
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative z-[6] flex h-[34px] w-full items-center justify-between gap-1.5 rounded-lg border border-border bg-white px-2.5 text-[12.5px] font-semibold text-zinc-900 hover:border-border-hover"
          >
            <span className="truncate">{nf.category}</span>
            <ChevronDown size={14} color="#71717a" />
          </button>
          {open && (
            <div className="absolute left-0 top-[38px] z-[7] w-[180px] rounded-lg border border-border bg-white p-[5px] shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
              {EQUIPMENT_CATEGORIES.map((cat) => {
                const active = nf.category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      nfSetCategory(cat);
                      setOpen(false);
                    }}
                    className="flex h-9 w-full items-center justify-between rounded-[7px] px-2.5 text-left text-[13px]"
                    style={{ fontWeight: active ? 600 : 500, background: active ? "#f4f4f5" : "transparent", color: "#18181b" }}
                  >
                    <span>{cat}</span>
                    {active && <Check size={14} strokeWidth={2.4} color="#0284c7" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <input
          value={nf.brand}
          onChange={(e) => patchNf({ brand: e.target.value })}
          placeholder="Brand"
          className="h-[34px] min-w-0 flex-1 rounded-lg border border-border px-[11px] text-[12.5px] font-semibold outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
        />
        <input
          value={nf.model}
          onChange={(e) => patchNf({ model: e.target.value })}
          placeholder="Model"
          className="h-[34px] min-w-0 flex-[1.2] rounded-lg border border-border px-[11px] text-[12.5px] outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
        />
      </div>
      <div className="flex gap-2">
        <input
          value={nf.size}
          onChange={(e) => patchNf({ size: e.target.value })}
          placeholder="Size"
          className="h-[34px] min-w-0 flex-1 rounded-lg border border-border px-[11px] text-[12.5px] outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
        />
        <input
          value={nf.colour}
          onChange={(e) => patchNf({ colour: e.target.value })}
          placeholder="Colour"
          className="h-[34px] min-w-0 flex-1 rounded-lg border border-border px-[11px] text-[12.5px] outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
        />
      </div>
    </div>
  );
}
