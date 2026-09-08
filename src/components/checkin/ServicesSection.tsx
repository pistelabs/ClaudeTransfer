import { useState } from "react";
import { Camera, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { groupFields, groupOrder, isQuoted, PRICE_MAP, SERVICE_DEFS, serviceColor } from "../../lib/serviceCatalog";
import { DinCalculator } from "./DinCalculator";
import type { NewJobForm, ServiceData } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function ServicesSection() {
  const nf = useAppStore((s) => s.nf);
  const toggleNfService = useAppStore((s) => s.toggleNfService);
  const patchServiceData = useAppStore((s) => s.patchServiceData);
  const setImgViewer = useAppStore((s) => s.setImgViewer);

  const order = groupOrder();

  return (
    <GroupedServices
      order={order}
      nf={nf}
      toggleNfService={toggleNfService}
      patchServiceData={patchServiceData}
      setImgViewer={setImgViewer}
    />
  );
}

function GroupedServices({
  order,
  nf,
  toggleNfService,
  patchServiceData,
  setImgViewer,
}: {
  order: ReturnType<typeof groupOrder>;
  nf: NewJobForm;
  toggleNfService: (n: string) => void;
  patchServiceData: (name: string, patch: ServiceData) => void;
  setImgViewer: (p: { url: string; title: string; subtitle: string }) => void;
}) {
  const [groupIdx, setGroupIdx] = useState(0);
  const active = Math.max(0, Math.min(groupIdx, order.length - 1));
  const group = order[active];

  const namesInGroup = SERVICE_DEFS.filter((s) => s.group === group && s.types.includes(nf.type)).map((s) => s.name);
  const selectedInGroup = namesInGroup.filter((n) => nf.services.includes(n));
  const showDin = group === "Bindings" && selectedInGroup.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={group} onValueChange={(v) => setGroupIdx(order.indexOf(v as (typeof order)[number]))}>
        <TabsList>
          {order.map((g) => {
            const count = SERVICE_DEFS.filter(
              (s) => s.group === g && s.types.includes(nf.type) && nf.services.includes(s.name),
            ).length;
            return (
              <TabsTrigger key={g} value={g}>
                {g}
                {count > 0 && (
                  <Badge className="bg-sky size-4 rounded-full p-0 text-[10px] text-white tabular-nums">{count}</Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-bold tracking-tight">{group}</span>
        {namesInGroup.length === 0 ? (
          <span className="text-muted-foreground text-[12.5px] italic">
            No services available for this equipment type in this group.
          </span>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {namesInGroup.map((n) => {
                const on = nf.services.includes(n);
                const accent = serviceColor(n)[1];
                const price = PRICE_MAP[n];
                return (
                  <div
                    key={n}
                    onClick={() => toggleNfService(n)}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2.5",
                      on ? "border-sky bg-sky-50 ring-sky ring-1" : "bg-white",
                    )}
                    // Only the top edge is themed by service colour; kept as longhand so it
                    // doesn't fight the border utilities above.
                    style={{ borderTopWidth: 3, borderTopColor: accent }}
                  >
                    <span className="text-[13px] leading-tight font-semibold">{n}</span>
                    <span className="text-muted-foreground text-xs font-medium">
                      {isQuoted(n) ? "Quote" : `$${(price ?? 0).toFixed(2)}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {selectedInGroup.length > 0 && showDin && <DinCalculator />}

            {selectedInGroup.length > 0 && !showDin && (
              <div className="flex flex-col gap-2.5 rounded-lg border bg-white p-3">
                {selectedInGroup.map((n) => {
                  const data = nf.serviceData[n] || {};
                  const fields = groupFields(group);
                  return (
                    <div key={n} className="flex flex-col gap-1.5">
                      <span className="text-[11.5px] font-bold tracking-tight">{n}</span>
                      {isQuoted(n) && (
                        <div className="flex flex-col gap-1">
                          <Label className="text-violet-strong text-[10.5px] font-semibold">Quoted price *</Label>
                          <div className="relative w-full">
                            <span className="text-violet-strong pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[12.5px] font-semibold">
                              $
                            </span>
                            <Input
                              value={data.quote || ""}
                              onChange={(e) => patchServiceData(n, { quote: e.target.value })}
                              placeholder="Enter quote"
                              inputMode="decimal"
                              className="h-8 border-violet-200 pl-6 font-semibold"
                            />
                          </div>
                          <span className="text-muted-foreground text-[10.5px]">
                            Repairs are priced on inspection — enter the quoted amount before adding to the job.
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {fields.map((f) => (
                          <div key={f.key} className="flex flex-1 flex-col gap-1">
                            <Label className="text-muted-foreground text-[10.5px] font-semibold">{f.label}</Label>
                            <Input
                              value={(data as Record<string, string | undefined>)[f.key] || ""}
                              onChange={(e) => patchServiceData(n, { [f.key]: e.target.value } as ServiceData)}
                              placeholder={f.placeholder}
                              className="h-8 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                      {n === "Roll Wax" && (
                        <div className="flex flex-col gap-1.5 pt-0.5">
                          <Label className="text-muted-foreground text-[10.5px] font-semibold">Damage photos</Label>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(data.photos || []).map((url, pi) => (
                              <div key={url + pi} className="relative size-[52px] shrink-0">
                                <img
                                  src={url}
                                  onClick={() => setImgViewer({ url, title: "Damage photo", subtitle: `Check-in · ${n}` })}
                                  className="block size-full cursor-zoom-in rounded-lg border object-cover"
                                />
                                <button
                                  onClick={() => {
                                    const arr = (data.photos || []).filter((_, k) => k !== pi);
                                    patchServiceData(n, { photos: arr });
                                  }}
                                  className="text-destructive absolute -top-1.5 -right-1.5 flex size-[18px] items-center justify-center rounded-full border bg-white shadow-sm"
                                >
                                  <X size={10} strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                            <label className="text-sky-hover hover:bg-accent flex h-[52px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed bg-white px-3 text-[11.5px] font-semibold">
                              <Camera size={15} />
                              Add photo
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  files.forEach((file) => {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const cur = data.photos || [];
                                      patchServiceData(n, { photos: [...cur, String(ev.target?.result || "")] });
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
