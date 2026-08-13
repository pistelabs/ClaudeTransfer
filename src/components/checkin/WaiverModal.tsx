import { useMemo, useState } from "react";
import { ArrowLeft, Check, FileText, PenLine } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { WAIVER_TERMS } from "../../lib/waivers";
import { svcPrice } from "../../lib/serviceCatalog";
import { money } from "../../lib/format";
import { Avatar, ServicePill, TypeBadge } from "../Pills";
import { SignaturePad } from "./SignaturePad";

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

  const [signature, setSignature] = useState<string | null>(null);
  const [clearSignal, setClearSignal] = useState(0);

  // Everything entered in the sheet so far — parked items plus whatever is still in the editor.
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
      });
    return list;
  }, [nf]);

  const total = items.reduce((sum, it) => sum + it.services.reduce((a, n) => a + svcPrice(n, it.serviceData), 0), 0);
  const jobId = useMemo(() => {
    const nums = jobs.map((j) => parseInt((j.id || "").replace(/[^0-9]/g, ""), 10)).filter((n) => !isNaN(n));
    return "PLCS" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0");
  }, [jobs]);

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
              {step === 1 ? `Review and confirm before checking in ${jobId}` : `Sign to complete check-in of ${jobId}`}
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
                    <div key={i} className="flex flex-col gap-1.5 rounded-[9px] border border-border bg-surface-50 p-2.5">
                      <div className="flex items-center gap-2">
                        <TypeBadge type={it.type} />
                        <span className="text-[12.5px] font-semibold text-zinc-900">{it.brand}</span>
                        <span className="text-xs text-zinc-500">{it.model}</span>
                        <span className="text-xs text-zinc-400">{it.size}</span>
                        {it.colour && <span className="text-xs text-zinc-400">· {it.colour}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {it.services.length === 0 ? (
                          <span className="text-[11px] italic text-zinc-400">No services</span>
                        ) : (
                          it.services.map((sv) => <ServicePill key={sv} name={sv} />)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-5 border-t border-app-bg pt-2.5 text-xs">
                  <span className="text-zinc-500">
                    Due <span className="font-semibold text-zinc-900">{nf.due || "—"}</span>
                  </span>
                  <span className="text-zinc-500">
                    Pickup <span className="font-semibold text-zinc-900">{nf.pickup || "—"}</span>
                  </span>
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
              </section>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <section className="flex flex-col gap-2.5 rounded-[11px] border border-border bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Sign below</span>
                  <button onClick={() => setClearSignal((n) => n + 1)} className="text-[11.5px] font-semibold text-sky-hover hover:underline">
                    Clear
                  </button>
                </div>
                <SignaturePad onChange={setSignature} clearSignal={clearSignal} />
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
              disabled={!agreed}
              className="h-10 rounded-[9px] px-5 text-[13px] font-semibold"
              style={{
                color: agreed ? "#ffffff" : "#c4c4c8",
                background: agreed ? "#0284c7" : "#f4f4f5",
                border: agreed ? "1px solid #0284c7" : "1px solid #e4e4e7",
                cursor: agreed ? "pointer" : "not-allowed",
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={() => signature && sign(signature)}
              disabled={!signature}
              className="flex h-10 items-center gap-2 rounded-[9px] px-5 text-[13px] font-semibold"
              style={{
                color: signature ? "#ffffff" : "#c4c4c8",
                background: signature ? "#16a34a" : "#f4f4f5",
                border: signature ? "1px solid #16a34a" : "1px solid #e4e4e7",
                cursor: signature ? "pointer" : "not-allowed",
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
