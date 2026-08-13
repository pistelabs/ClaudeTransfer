import { useMemo, useState } from "react";
import { ArrowLeft, Check, FileText, Lock, PenLine } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { WAIVER_TERMS } from "../../lib/waivers";
import { computeDin as computeDinFn, groupFields, SERVICE_DEFS, svcPrice } from "../../lib/serviceCatalog";
import { money } from "../../lib/format";
import { Avatar, ServicePill, TypeBadge } from "../Pills";
import { SignaturePad } from "./SignaturePad";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-[86px] flex-shrink-0 text-[11px] text-zinc-400">{label}</span>
      <span className="min-w-0 flex-1 text-[11.5px] font-medium text-zinc-800">{value}</span>
    </div>
  );
}

/** Check-in waiver. Step 1 reviews what is being signed for and captures agreement to the
 * terms; step 2 takes the staff signature that completes the check-in. */
export function WaiverModal() {
  const waiverOpen = useAppStore((s) => s.waiverOpen);
  const step = useAppStore((s) => s.waiverStep);
  const agreed = useAppStore((s) => s.waiverAgreed);
  const setAgreed = useAppStore((s) => s.setWaiverAgreed);
  const next = useAppStore((s) => s.waiverNext);
  const back = useAppStore((s) => s.waiverBack);
  const close = useAppStore((s) => s.closeWaiver);
  const sign = useAppStore((s) => s.signWaiver);
  const nf = useAppStore((s) => s.nf);
  const jobs = useAppStore((s) => s.jobs);
  const activeStaff = useAppStore((s) => s.activeStaff);

  const [custSignature, setCustSignature] = useState<string | null>(null);
  const [custClear, setCustClear] = useState(0);
  const [staffSignature, setStaffSignature] = useState<string | null>(null);
  const [staffClear, setStaffClear] = useState(0);

  // Everything entered in the sheet so far — parked items plus whatever is still in the editor.
  // DIN as it stands in the editor right now, so the summary reflects unparked equipment too.
  const editorDin = useMemo(() => {
    const needsDin = nf.services.some((n) => SERVICE_DEFS.find((d) => d.name === n)?.group === "Bindings");
    if (!needsDin) return undefined;
    const result = nf.din.mode === "custom" ? nf.din.custom.trim() : computeDinFn(nf.din) || "";
    return result ? { ...nf.din, result } : undefined;
  }, [nf]);

  const items = useMemo(() => {
    const list = nf.items.slice();
    if (nf.brand.trim())
      list.push({
        type: nf.type,
        category: nf.category,
        brand: nf.brand.trim(),
        model: nf.model.trim(),
        size: nf.size.trim() || "—",
        colour: nf.colour.trim(),
        services: nf.services.slice(),
        serviceData: { ...nf.serviceData },
        din: editorDin,
      });
    return list;
  }, [nf]);

  const total = items.reduce((sum, it) => sum + it.services.reduce((a, n) => a + svcPrice(n, it.serviceData), 0), 0);
  const jobId = useMemo(() => {
    const nums = jobs.map((j) => parseInt((j.id || "").replace(/[^0-9]/g, ""), 10)).filter((n) => !isNaN(n));
    return "PLCS" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0");
  }, [jobs]);

  const canContinue = agreed && !!custSignature;

  if (!waiverOpen) return null;

  return (
    <div className="animate-sheet-fade absolute inset-0 z-[60] flex items-center justify-center p-6" style={{ background: "rgba(9,9,11,0.45)" }}>
      <div
        className="animate-sheet-pop flex max-h-full w-full max-w-[560px] flex-col overflow-hidden rounded-[14px] border border-border bg-white"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.28)" }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-app-bg px-5 py-4">
          <div
            className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px]"
            style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
          >
            {step === 1 ? <FileText size={17} /> : <PenLine size={17} />}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-[15px] font-bold tracking-tight">{step === 1 ? "Check-in waiver" : "Staff signature"}</span>
            <span className="text-xs text-zinc-500">
              {step === 1 ? `Customer to review and sign for ${jobId}` : `Staff to countersign ${jobId}`}
            </span>
          </div>
          <div className="flex-1" />
          <span className="flex-shrink-0 rounded-full bg-app-bg px-2.5 py-1 text-[11px] font-semibold text-zinc-500">Step {step} of 2</span>
        </div>

        <div className="flex-1 overflow-y-auto bg-surface-50 p-5">
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              {/* Job summary */}
              <section className="flex flex-col gap-2.5 rounded-[11px] border border-border bg-white p-4">
                <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Job summary</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-bold text-zinc-900">{jobId}</span>
                  <span className="text-[13px] font-bold text-zinc-900">{money(total)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((it, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-[9px] border border-border bg-surface-50 p-3">
                      {/* identity */}
                      <div className="flex flex-wrap items-center gap-2">
                        <TypeBadge type={it.type} />
                        <span className="text-[13px] font-semibold text-zinc-900">{it.brand}</span>
                        <span className="text-[12.5px] text-zinc-500">{it.model}</span>
                        <div className="flex-1" />
                        <span className="text-[10.5px] font-semibold text-zinc-400">
                          {items.length > 1 ? `${jobId}-${i + 1}` : jobId}
                        </span>
                      </div>
                      <Row label="Type" value={it.category} />
                      <Row label="Size" value={it.size || "—"} />
                      {it.colour && <Row label="Colour" value={it.colour} />}

                      {/* services, each with whatever was entered against it */}
                      <div className="flex flex-col gap-1.5 border-t border-app-bg pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">Services</span>
                        {it.services.length === 0 ? (
                          <span className="text-[11.5px] italic text-zinc-400">No services</span>
                        ) : (
                          it.services.map((sv) => {
                            const def = SERVICE_DEFS.find((d) => d.name === sv);
                            const sd = it.serviceData[sv] || {};
                            const entered = def
                              ? groupFields(def.group)
                                  .map((f) => ({ label: f.label, value: (sd as Record<string, string | undefined>)[f.key] }))
                                  .filter((f) => f.value && f.value.trim())
                              : [];
                            return (
                              <div key={sv} className="flex flex-col gap-1 rounded-[7px] border border-border bg-white p-2">
                                <div className="flex items-center gap-2">
                                  <ServicePill name={sv} />
                                  <div className="flex-1" />
                                  <span className="text-[11.5px] font-semibold text-zinc-700">
                                    {sd.quote ? money(Number(sd.quote) || 0) : money(svcPrice(sv, it.serviceData))}
                                  </span>
                                </div>
                                {entered.map((f) => (
                                  <Row key={f.label} label={f.label} value={f.value as string} />
                                ))}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* DIN — the values it was worked out from, and the setting itself */}
                      {it.din && (
                        <div className="flex flex-col gap-1.5 rounded-[8px] border border-[#bae6fd] bg-[#f0f9ff] p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#0c4a6e" }}>
                              DIN · {it.din.mode === "custom" ? "Custom" : "Calculated"}
                            </span>
                            <div className="flex-1" />
                            <span className="text-[15px] font-extrabold tracking-tight" style={{ color: "#0c4a6e" }}>
                              {it.din.result}
                            </span>
                          </div>
                          {it.din.mode === "calculate" && (
                            <div className="flex flex-col gap-1 border-t border-[#bae6fd] pt-1.5">
                              <Row label="Weight" value={it.din.weight || "—"} />
                              <Row label="Height" value={it.din.height || "—"} />
                              <Row label="Age" value={it.din.age || "—"} />
                              <Row label="Skier type" value={it.din.skier || "—"} />
                              <Row label="Boot sole" value={it.din.sole || "—"} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5 border-t border-app-bg pt-2.5">
                  <Row label="Due date" value={nf.due || "—"} />
                  <Row label="Pickup time" value={nf.pickup || "—"} />
                  <Row label="Checked in by" value={activeStaff || "Staff"} />
                </div>
                {nf.notes.trim() && <p className="m-0 text-xs leading-relaxed text-zinc-600">{nf.notes}</p>}
              </section>

              {/* Terms */}
              <section className="flex flex-col gap-2.5 rounded-[11px] border border-border bg-white p-4">
                <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Terms</span>
                <ol className="m-0 flex list-decimal flex-col gap-2 pl-4">
                  {WAIVER_TERMS.map((t, i) => (
                    <li key={i} className="text-[12.5px] leading-relaxed text-zinc-700">
                      {t}
                    </li>
                  ))}
                </ol>
                <label className="mt-1 flex cursor-pointer items-start gap-2.5 rounded-[9px] border border-border bg-surface-50 p-3">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-px h-4 w-4 flex-shrink-0 accent-[#0284c7]"
                  />
                  <span className="text-[12.5px] font-medium leading-relaxed text-zinc-900">
                    The customer has read and agreed to the terms above.
                  </span>
                </label>
              </section>

              {/* Customer details */}
              <section className="flex flex-col gap-2.5 rounded-[11px] border border-border bg-white p-4">
                <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Customer details</span>
                <div className="flex items-center gap-3">
                  <Avatar name={nf.customer || "?"} size={38} />
                  <div className="flex min-w-0 flex-col leading-tight">
                    <span className="text-[13.5px] font-semibold text-zinc-900">{nf.customer || "—"}</span>
                    <span className="truncate text-[11.5px] text-zinc-500">
                      {[nf.email, nf.phone].filter(Boolean).join(" · ") || "No contact details on file"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-app-bg pt-2.5">
                  <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Customer signature</span>
                  <button onClick={() => setCustClear((n) => n + 1)} className="text-[11.5px] font-semibold text-sky-hover hover:underline">
                    Clear
                  </button>
                </div>
                <SignaturePad onChange={setCustSignature} clearSignal={custClear} />
                <span className="text-[11px] text-zinc-400">Signed by {nf.customer || "the customer"}</span>
              </section>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5 rounded-[11px] border p-3.5" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                <Lock size={17} className="mt-px flex-shrink-0" color="#d97706" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold" style={{ color: "#92400e" }}>
                    Staff only — not for the customer
                  </span>
                  <span className="text-[12.5px] leading-relaxed" style={{ color: "#b45309" }}>
                    The customer's signature has been captured. Please hand the device back to a member of staff to
                    countersign and complete the check-in.
                  </span>
                </div>
              </div>

              <section className="flex flex-col gap-2.5 rounded-[11px] border border-border bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Staff signature</span>
                  <button onClick={() => setStaffClear((n) => n + 1)} className="text-[11.5px] font-semibold text-sky-hover hover:underline">
                    Clear
                  </button>
                </div>
                <SignaturePad onChange={setStaffSignature} clearSignal={staffClear} />
                <div className="flex items-center gap-2 border-t border-app-bg pt-2.5">
                  <Avatar name={activeStaff || "?"} size={28} />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[12.5px] font-semibold text-zinc-900">{activeStaff || "Staff"}</span>
                    <span className="text-[10.5px] text-zinc-400">Signing on behalf of City Skis</span>
                  </div>
                </div>
              </section>
              <p className="m-0 px-1 text-[12px] leading-relaxed text-zinc-500">
                Signing records the waiver against {jobId} and completes the check-in.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-2.5 border-t border-border bg-white px-5 py-3.5">
          {step === 2 && (
            <button
              onClick={back}
              className="flex h-10 items-center gap-1.5 rounded-[9px] border border-border bg-white px-3.5 text-[13px] font-medium text-zinc-900 hover:bg-app-bg"
            >
              <ArrowLeft size={15} />
              Back
            </button>
          )}
          <button onClick={close} className="h-10 rounded-[9px] px-3.5 text-[13px] font-medium text-zinc-500 hover:text-ink">
            Cancel
          </button>
          <div className="flex-1" />
          {step === 1 ? (
            <button
              onClick={next}
              disabled={!canContinue}
              title={!agreed ? "Confirm the terms have been read" : !custSignature ? "The customer needs to sign" : undefined}
              className="h-10 rounded-[9px] px-5 text-[13px] font-semibold"
              style={{
                color: canContinue ? "#ffffff" : "#c4c4c8",
                background: canContinue ? "#0284c7" : "#f4f4f5",
                border: canContinue ? "1px solid #0284c7" : "1px solid #e4e4e7",
                cursor: canContinue ? "pointer" : "not-allowed",
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={() => staffSignature && custSignature && sign(staffSignature, custSignature)}
              disabled={!staffSignature}
              className="flex h-10 items-center gap-2 rounded-[9px] px-5 text-[13px] font-semibold"
              style={{
                color: staffSignature ? "#ffffff" : "#c4c4c8",
                background: staffSignature ? "#16a34a" : "#f4f4f5",
                border: staffSignature ? "1px solid #16a34a" : "1px solid #e4e4e7",
                cursor: staffSignature ? "pointer" : "not-allowed",
              }}
            >
              <Check size={15} strokeWidth={3} />
              Sign and check in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
