import { Ruler } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { computeDin, dinOptions } from "../../lib/serviceCatalog";

export function DinCalculator() {
  const nf = useAppStore((s) => s.nf);
  const patchDin = useAppStore((s) => s.patchDin);
  const din = nf.din;
  const opts = dinOptions();

  const result = din.mode === "custom" ? (din.custom ? din.custom : "—") : computeDin(din) || "—";
  const hasResult = din.mode === "custom" ? !!din.custom.trim() : !!computeDin(din);

  const selectClass =
    "h-9 w-full rounded-lg border border-[#bae6fd] bg-white px-2 text-[12.5px] text-ink outline-none cursor-pointer";

  return (
    <div className="flex flex-col gap-3.5 rounded-[11px] border border-[#bae6fd] bg-[#f0f9ff] p-3.5">
      <div className="flex items-center gap-2.5">
        <Ruler size={17} color="#0284c7" />
        <span className="text-[13.5px] font-bold tracking-tight text-[#0c4a6e]">DIN Setting</span>
        <div className="flex-1" />
        <div className="flex gap-0.5 rounded-lg bg-[#e0f2fe] p-[3px]">
          <button
            onClick={() => patchDin({ mode: "calculate" })}
            className="h-7 rounded-[7px] px-[13px] text-xs font-semibold"
            style={{ color: din.mode === "calculate" ? "#ffffff" : "#3f3f46", background: din.mode === "calculate" ? "#0284c7" : "transparent" }}
          >
            Calculate
          </button>
          <button
            onClick={() => patchDin({ mode: "custom" })}
            className="h-7 rounded-[7px] px-[13px] text-xs font-semibold"
            style={{ color: din.mode === "custom" ? "#ffffff" : "#3f3f46", background: din.mode === "custom" ? "#0284c7" : "transparent" }}
          >
            Custom
          </button>
        </div>
      </div>

      {din.mode === "calculate" ? (
        <div className="flex items-stretch gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-[11px]">
            <div className="grid grid-cols-3 gap-2.5">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#0c4a6e]">Weight *</span>
                <select value={din.weight} onChange={(e) => patchDin({ weight: e.target.value })} className={selectClass}>
                  <option value="">Select</option>
                  {opts.weight.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#0c4a6e]">Height *</span>
                <select value={din.height} onChange={(e) => patchDin({ height: e.target.value })} className={selectClass}>
                  <option value="">Select</option>
                  {opts.height.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#0c4a6e]">Age *</span>
                <select value={din.age} onChange={(e) => patchDin({ age: e.target.value })} className={selectClass}>
                  <option value="">Select</option>
                  {opts.age.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#0c4a6e]">Skier Type *</span>
                <select value={din.skier} onChange={(e) => patchDin({ skier: e.target.value })} className={selectClass}>
                  <option value="">Select</option>
                  {opts.skier.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#0c4a6e]">Boot Sole Length *</span>
                <select value={din.sole} onChange={(e) => patchDin({ sole: e.target.value })} className={selectClass}>
                  <option value="">Select</option>
                  {opts.sole.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="flex w-24 flex-shrink-0 flex-col items-center justify-center gap-[3px] rounded-[9px] border border-[#bae6fd] bg-white">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#0c4a6e]">DIN</span>
            <span className="text-[26px] font-extrabold tracking-tight" style={{ color: hasResult ? "#0284c7" : "#c4c4c8" }}>
              {result}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-[#0c4a6e]">Custom DIN value</span>
          <input
            value={din.custom}
            onChange={(e) => patchDin({ custom: e.target.value })}
            placeholder="e.g. 7.5"
            className="h-9 w-[140px] rounded-lg border border-[#bae6fd] px-[11px] text-[13px] font-semibold outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
          />
        </div>
      )}
    </div>
  );
}
