import { useState } from "react";
import { Camera, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { groupFields, groupOrder, isQuoted, PRICE_MAP, SERVICE_DEFS, serviceColor } from "../../lib/serviceCatalog";
import { DinCalculator } from "./DinCalculator";
import type { NewJobForm, ServiceData } from "../../types";

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
      <div className="flex gap-[22px] border-b border-border pb-0">
        {order.map((g, i) => {
          const count = SERVICE_DEFS.filter((s) => s.group === g && s.types.includes(nf.type) && nf.services.includes(s.name)).length;
          const on = i === active;
          return (
            <button
              key={g}
              onClick={() => setGroupIdx(i)}
              className="-mb-px flex items-center gap-1.5 whitespace-nowrap pb-2.5 text-[13px]"
              style={{ fontWeight: on ? 700 : 500, color: on ? "#18181b" : "#a1a1aa", borderBottom: on ? "2px solid #18181b" : "2px solid transparent" }}
            >
              <span>{g}</span>
              {count > 0 && (
                <span className="flex min-w-[16px] items-center justify-center rounded-full bg-sky px-1 text-[10px] font-bold leading-4 text-white">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-bold tracking-tight text-zinc-900">{group}</span>
        {namesInGroup.length === 0 ? (
          <span className="text-[12.5px] italic text-zinc-400">No services available for this equipment type in this group.</span>
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
                    className="flex cursor-pointer flex-col gap-1 rounded-[9px] border p-[10px_13px]"
                    style={{
                      background: on ? "#eff6ff" : "#ffffff",
                      borderColor: on ? "#0284c7" : "#e4e4e7",
                      borderTop: `3px solid ${accent}`,
                      boxShadow: on ? "0 0 0 1px #0284c7" : "none",
                    }}
                  >
                    <span className="text-[13px] font-semibold leading-tight text-zinc-900">{n}</span>
                    <span className="text-xs font-medium text-zinc-500">{isQuoted(n) ? "Quote" : `$${(price ?? 0).toFixed(2)}`}</span>
                  </div>
                );
              })}
            </div>

            {selectedInGroup.length > 0 && showDin && <DinCalculator />}

            {selectedInGroup.length > 0 && !showDin && (
              <div className="flex flex-col gap-2.5 rounded-[10px] border border-border bg-white p-[12px_13px]">
                {selectedInGroup.map((n) => {
                  const data = nf.serviceData[n] || {};
                  const fields = groupFields(group);
                  return (
                    <div key={n} className="flex flex-col gap-1.5">
                      <span className="text-[11.5px] font-bold tracking-tight text-zinc-900">{n}</span>
                      {isQuoted(n) && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10.5px] font-semibold text-violet-strong">Quoted price *</span>
                          <div className="flex h-[34px] items-center overflow-hidden rounded-lg border border-[#ddd6fe] bg-white">
                            <span className="flex h-full items-center border-r border-[#ddd6fe] bg-[#f5f3ff] px-2.5 text-[12.5px] font-semibold text-violet-strong">
                              $
                            </span>
                            <input
                              value={data.quote || ""}
                              onChange={(e) => patchServiceData(n, { quote: e.target.value })}
                              placeholder="Enter quote"
                              inputMode="decimal"
                              className="h-full min-w-0 flex-1 bg-transparent px-[11px] text-[13px] font-semibold outline-none"
                            />
                          </div>
                          <span className="text-[10.5px] text-zinc-400">
                            Repairs are priced on inspection — enter the quoted amount before adding to the job.
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {fields.map((f) => (
                          <label key={f.key} className="flex flex-1 flex-col gap-1">
                            <span className="text-[10.5px] font-semibold text-zinc-500">{f.label}</span>
                            <input
                              value={(data as Record<string, string | undefined>)[f.key] || ""}
                              onChange={(e) => patchServiceData(n, { [f.key]: e.target.value } as ServiceData)}
                              placeholder={f.placeholder}
                              className="h-8 w-full rounded-[7px] border border-border px-2.5 text-xs outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(2,132,199,0.14)]"
                            />
                          </label>
                        ))}
                      </div>
                      {n === "Roll Wax" && (
                        <div className="flex flex-col gap-1.5 pt-0.5">
                          <span className="text-[10.5px] font-semibold text-zinc-500">Damage photos</span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(data.photos || []).map((url, pi) => (
                              <div key={url + pi} className="relative h-[52px] w-[52px] flex-shrink-0">
                                <img
                                  src={url}
                                  onClick={() => setImgViewer({ url, title: "Damage photo", subtitle: `Check-in · ${n}` })}
                                  className="block h-full w-full cursor-zoom-in rounded-lg border border-border object-cover"
                                />
                                <button
                                  onClick={() => {
                                    const arr = (data.photos || []).filter((_, k) => k !== pi);
                                    patchServiceData(n, { photos: arr });
                                  }}
                                  className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-border bg-white text-red shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                                >
                                  <X size={10} strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                            <label className="flex h-[52px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#93c5fd] bg-white px-[13px] text-[11.5px] font-semibold text-sky-hover hover:bg-[#f0f9ff]">
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
