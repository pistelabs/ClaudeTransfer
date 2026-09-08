import { Ruler } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { computeDin, dinOptions } from "../../lib/serviceCatalog";
import type { DinState } from "../../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** One labelled dropdown in the DIN grid — they all behave identically. */
function DinField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Label className="text-[11px] font-semibold text-sky-900">{label}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger size="sm" className="w-full border-sky-200 bg-white">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function DinCalculator() {
  const nf = useAppStore((s) => s.nf);
  const patchDin = useAppStore((s) => s.patchDin);
  const din = nf.din;
  const opts = dinOptions();

  const result = din.mode === "custom" ? (din.custom ? din.custom : "—") : computeDin(din) || "—";
  const hasResult = din.mode === "custom" ? !!din.custom.trim() : !!computeDin(din);

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-sky-200 bg-sky-50 p-3.5">
      <div className="flex items-center gap-2.5">
        <Ruler className="size-4 text-sky-600" />
        <span className="text-[13.5px] font-bold tracking-tight text-sky-900">DIN Setting</span>
        <div className="flex-1" />
        <Tabs value={din.mode} onValueChange={(v) => patchDin({ mode: v as DinState["mode"] })}>
          <TabsList className="h-8 bg-sky-100">
            <TabsTrigger value="calculate" className="text-xs">
              Calculate
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs">
              Custom
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {din.mode === "calculate" ? (
        <div className="flex items-stretch gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-[11px]">
            <div className="grid grid-cols-3 gap-2.5">
              <DinField label="Weight *" value={din.weight} options={opts.weight} onChange={(v) => patchDin({ weight: v })} />
              <DinField label="Height *" value={din.height} options={opts.height} onChange={(v) => patchDin({ height: v })} />
              <DinField label="Age *" value={din.age} options={opts.age} onChange={(v) => patchDin({ age: v })} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <DinField label="Skier Type *" value={din.skier} options={opts.skier} onChange={(v) => patchDin({ skier: v })} />
              <DinField
                label="Boot Sole Length *"
                value={din.sole}
                options={opts.sole}
                onChange={(v) => patchDin({ sole: v })}
              />
            </div>
          </div>
          <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-[3px] rounded-lg border border-sky-200 bg-white">
            <span className="text-[10px] font-bold tracking-wide text-sky-900 uppercase">DIN</span>
            <span
              className={
                hasResult
                  ? "text-[26px] font-extrabold tracking-tight text-sky-600"
                  : "text-[26px] font-extrabold tracking-tight text-zinc-350"
              }
            >
              {result}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-semibold text-sky-900">Custom DIN value</Label>
          <Input
            value={din.custom}
            onChange={(e) => patchDin({ custom: e.target.value })}
            placeholder="e.g. 7.5"
            className="w-[140px] border-sky-200 bg-white font-semibold"
          />
        </div>
      )}
    </div>
  );
}
