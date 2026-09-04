import { useState } from "react";
import { Check, MoreVertical, Pencil, Trash2, Wallet } from "lucide-react";
import { useAppStore, nextJobIdStr } from "../../store/useAppStore";
import { ServicePill, TypeBadge } from "../Pills";
import { svcPrice } from "../../lib/serviceCatalog";
import { money } from "../../lib/format";

function itemPrice(services: string[], serviceData: Record<string, { quote?: string }>, priceOverride?: number | string | null): number {
  const base = services.reduce((a, n) => a + svcPrice(n, serviceData), 0);
  return priceOverride != null && priceOverride !== "" ? Number(priceOverride) : base;
}

export function CheckoutColumn() {
  const nf = useAppStore((s) => s.nf);
  const jobs = useAppStore((s) => s.jobs);
  const editId = useAppStore((s) => s.editId);
  const itemMenuIdx = useAppStore((s) => s.itemMenuIdx);
  const setItemMenuIdx = useAppStore((s) => s.setItemMenuIdx);
  const priceEditIdx = useAppStore((s) => s.priceEditIdx);
  const setPriceEditIdx = useAppStore((s) => s.setPriceEditIdx);
  const setItemPriceOverride = useAppStore((s) => s.setItemPriceOverride);
  const swapToEditor = useAppStore((s) => s.swapToEditor);
  const removeItem = useAppStore((s) => s.removeItem);
  const createJob = useAppStore((s) => s.createJob);

  const [priceDraft, setPriceDraft] = useState("");

  const jobIdLabel = editId || nextJobIdStr(jobs);
  const hasCurrentEditing = !!(nf.brand && nf.brand.trim());
  const checkoutCount = nf.items.length + (hasCurrentEditing ? 1 : 0);

  let total = 0;
  nf.items.forEach((it) => {
    total += itemPrice(it.services, it.serviceData, it.priceOverride);
  });
  if (hasCurrentEditing) total += nf.services.reduce((a, n) => a + svcPrice(n, nf.serviceData), 0);

  const canSubmit = nf.customer.trim().length > 0 && (nf.items.length > 0 || nf.brand.trim().length > 0);

  return (
    <div className="flex w-[300px] flex-shrink-0 flex-col border-l border-border bg-white">
      <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-app-bg px-4 py-3.5">
        <span className="text-[13px] font-bold tracking-tight">Job {jobIdLabel}</span>
      </div>

      <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-[18px] py-4">
        <div className="flex flex-col gap-2">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Customer</span>
          {nf.customer.trim() ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-50 p-[9px_11px]">
              <div className="flex min-w-0 flex-col leading-[1.3]">
                <span className="whitespace-nowrap text-[13px] font-semibold text-zinc-900">{nf.customer}</span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-zinc-500">
                  {nf.email}
                  {nf.email && nf.phone ? " · " : ""}
                  {nf.phone}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex h-11 items-center justify-center rounded-lg border border-dashed border-border text-xs text-zinc-400">
              No customer selected
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Equipment</span>
            <span className="rounded-full bg-app-bg px-2 py-px text-[11px] font-semibold text-zinc-500">{checkoutCount}</span>
          </div>
          {checkoutCount === 0 ? (
            <div className="flex h-[60px] items-center justify-center rounded-lg border border-dashed border-border px-3 text-center text-[11.5px] text-zinc-400">
              Fill the form and click "Add Equipment to Job" to build the job
            </div>
          ) : (
            <div className="flex flex-col gap-[7px]">
              {nf.items.map((it, i) => {
                const price = itemPrice(it.services, it.serviceData, it.priceOverride);
                const title = [it.brand, it.model].filter(Boolean).join(" ") || "New equipment";
                const meta = [it.size, it.colour].filter(Boolean).join(" · ") || "—";
                const menuOpen = itemMenuIdx === i;
                const priceEditing = priceEditIdx === i;
                return (
                  <div key={i} className="flex flex-col overflow-hidden rounded-[11px] border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-start gap-2.5 px-[11px] pb-[9px] pt-[11px]">
                      <TypeBadge type={it.type} />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.3]">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-zinc-900">{title}</span>
                        </div>
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-medium text-zinc-400">{meta}</span>
                      </div>
                      <div className="relative -mt-px">
                        {menuOpen && <div className="fixed inset-0 z-[8]" onClick={() => setItemMenuIdx(null)} />}
                        <button
                          onClick={() => setItemMenuIdx(menuOpen ? null : i)}
                          className="relative z-[9] flex h-[26px] w-[26px] items-center justify-center rounded-[7px] text-zinc-400 hover:bg-app-bg hover:text-zinc-900"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {menuOpen && (
                          <div className="absolute right-0 top-[30px] z-10 min-w-[158px] rounded-[9px] border border-border bg-white p-[5px] shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
                            <button
                              onClick={() => swapToEditor(i)}
                              className="flex h-[34px] w-full items-center gap-[9px] rounded-[6px] px-2.5 text-left text-[12.5px] font-medium text-zinc-900 hover:bg-app-bg"
                            >
                              <Pencil size={14} />
                              Edit equipment
                            </button>
                            <button
                              onClick={() => {
                                setPriceDraft(String(price));
                                setPriceEditIdx(i);
                                setItemMenuIdx(null);
                              }}
                              className="flex h-[34px] w-full items-center gap-[9px] rounded-[7px] px-2.5 text-left text-[12.5px] font-medium text-zinc-900 hover:bg-app-bg"
                            >
                              <Wallet size={14} />
                              Adjust price
                            </button>
                            <button
                              onClick={() => {
                                setItemMenuIdx(null);
                                removeItem(i);
                              }}
                              className="flex h-[34px] w-full items-center gap-[9px] rounded-[7px] px-2.5 text-left text-[12.5px] font-medium text-red hover:bg-[#fef2f2]"
                            >
                              <Trash2 size={14} />
                              Remove equipment
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {it.services.length > 0 ? (
                      <div className="flex flex-wrap gap-1 px-[11px] pb-2.5">
                        {it.services.map((s) => (
                          <ServicePill key={s} name={s} />
                        ))}
                      </div>
                    ) : (
                      <div className="px-[11px] pb-2.5">
                        <span className="text-[10.5px] italic text-zinc-350">No services added</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 border-t border-app-bg bg-surface-50 px-[11px] py-2">
                      <span
                        className="whitespace-nowrap rounded-[6px] bg-app-bg px-[7px] py-0.5 text-[10.5px] font-semibold text-zinc-600"
                        style={{ fontFamily: "ui-monospace, SF Mono, Menlo, monospace" }}
                      >
                        {jobIdLabel}-{i + 1}
                      </span>
                      {priceEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-zinc-500">$</span>
                          <input
                            value={priceDraft}
                            onChange={(e) => setPriceDraft(e.target.value)}
                            onBlur={() => {
                              setItemPriceOverride(i, priceDraft);
                              setPriceEditIdx(null);
                            }}
                            autoFocus
                            placeholder="0.00"
                            className="h-[26px] w-16 rounded-[6px] border border-sky px-1.5 text-xs font-semibold outline-none"
                            style={{ boxShadow: "0 0 0 3px rgba(2,132,199,0.14)" }}
                          />
                          <button
                            onClick={() => {
                              setItemPriceOverride(i, priceDraft);
                              setPriceEditIdx(null);
                            }}
                            className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] bg-sky text-white"
                          >
                            <Check size={13} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400">Total</span>
                          <span className="text-[13.5px] font-bold tracking-tight text-zinc-900">{money(price)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {hasCurrentEditing && (
                <div
                  className="flex flex-col overflow-hidden rounded-[11px] border bg-[#fbfdff]"
                  style={{ borderColor: "#bfdbfe", boxShadow: "0 0 0 3px rgba(2,132,199,0.10)" }}
                >
                  <div className="flex items-start gap-2.5 px-[11px] pb-[9px] pt-[11px]">
                    <TypeBadge type={nf.type} />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.3]">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-zinc-900">
                          {[nf.brand, nf.model].filter(Boolean).join(" ") || "New equipment"}
                        </span>
                        <span className="flex-shrink-0 rounded-[5px] border border-[#bfdbfe] bg-[#eff6ff] px-1.5 py-px text-[9px] font-bold tracking-wide text-sky-hover">
                          EDITING
                        </span>
                      </div>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-medium text-zinc-400">
                        {[nf.size, nf.colour].filter(Boolean).join(" · ") || "—"}
                      </span>
                    </div>
                  </div>
                  {nf.services.length > 0 ? (
                    <div className="flex flex-wrap gap-1 px-[11px] pb-2.5">
                      {nf.services.map((s) => (
                        <ServicePill key={s} name={s} />
                      ))}
                    </div>
                  ) : (
                    <div className="px-[11px] pb-2.5">
                      <span className="text-[10.5px] italic text-zinc-350">No services added</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 border-t border-app-bg bg-surface-50 px-[11px] py-2">
                    <span
                      className="whitespace-nowrap rounded-[6px] bg-app-bg px-[7px] py-0.5 text-[10.5px] font-semibold text-zinc-600"
                      style={{ fontFamily: "ui-monospace, SF Mono, Menlo, monospace" }}
                    >
                      {jobIdLabel}-{checkoutCount}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400">Total</span>
                      <span className="text-[13.5px] font-bold tracking-tight text-zinc-900">
                        {money(nf.services.reduce((a, n) => a + svcPrice(n, nf.serviceData), 0))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col gap-2 border-t border-app-bg px-[18px] py-3.5">
        <div className="flex items-baseline justify-between pb-0.5">
          <span className="text-[13px] font-semibold text-zinc-700">Total</span>
          <span className="text-[19px] font-extrabold tracking-tight text-ink">{money(total)}</span>
        </div>
        {editId ? (
          <button
            onClick={createJob}
            disabled={!canSubmit}
            className="h-[42px] rounded-[9px] text-[13.5px] font-semibold"
            style={{
              color: canSubmit ? "#ffffff" : "#c4c4c8",
              background: canSubmit ? "#0284c7" : "#f4f4f5",
              border: canSubmit ? "1px solid #0284c7" : "1px solid #e4e4e7",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            Save Changes
          </button>
        ) : (
          <>
            <button
              onClick={createJob}
              disabled={!canSubmit}
              className="h-[42px] rounded-[9px] text-[13.5px] font-semibold"
              style={{
                color: canSubmit ? "#ffffff" : "#c4c4c8",
                background: canSubmit ? "#0284c7" : "#f4f4f5",
                border: canSubmit ? "1px solid #0284c7" : "1px solid #e4e4e7",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              Create and Pay Later
            </button>
            <button
              onClick={createJob}
              disabled={!canSubmit}
              className="h-[42px] rounded-[9px] text-[13.5px] font-semibold"
              style={{
                color: canSubmit ? "#0369a1" : "#c4c4c8",
                background: "#ffffff",
                border: canSubmit ? "1px solid #93c5fd" : "1px solid #e4e4e7",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              Create and Pay Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
