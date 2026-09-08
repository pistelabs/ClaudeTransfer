import { useMemo, useState } from "react";
import { ArrowLeft, Check, FileText, Lock, PenLine } from "lucide-react";
import type { FormItem } from "../../types";
import { useAppStore } from "../../store/useAppStore";
import { WAIVER_TERMS } from "../../lib/waivers";
import { computeDin as computeDinFn, groupFields, SERVICE_DEFS, svcPrice } from "../../lib/serviceCatalog";
import { money } from "../../lib/format";
import { Avatar, ServicePill, TypeBadge } from "../Pills";
import { SignaturePad } from "./SignaturePad";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-[86px] flex-shrink-0 text-[11px] text-zinc-400">{label}</span>
      <span className="min-w-0 flex-1 text-[11.5px] font-medium text-zinc-800">{value}</span>
    </div>
  );
}


interface SummaryItem {
  type: FormItem["type"];
  category: FormItem["category"];
  brand: string;
  model: string;
  size: string;
  colour: string;
  services: string[];
  serviceData: FormItem["serviceData"];
  din?: FormItem["din"];
}

/** The job exactly as entered — shown to the customer before they sign, and again to staff
 * before they countersign, so both parties sign against the same thing. */
function JobSummary({
  items,
  jobId,
  total,
  due,
  pickup,
  staff,
  notes,
}: {
  items: SummaryItem[];
  jobId: string;
  total: number;
  due: string;
  pickup: string;
  staff: string;
  notes: string;
}) {
  return (
            <section className="flex flex-col gap-2.5 rounded-[11px] border border-border bg-white p-4">
        <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Job summary</span>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-bold text-zinc-900">{jobId}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400">Total</span>
            <span className="text-[13px] font-bold text-zinc-900">{money(total)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((it, i) => {
            const itemTotal = it.services.reduce((a, n) => a + svcPrice(n, it.serviceData), 0);
            return (
            <div key={i} className="flex flex-col gap-2 rounded-[9px] border border-border bg-surface-50 p-3">
              {/* identity */}
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={it.type} />
                <span className="text-[13px] font-semibold text-zinc-900">{it.brand}</span>
                <span className="text-[12.5px] text-zinc-500">{it.model}</span>
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

              {/* this item's own reference, opposite what it costs */}
              <div className="flex items-baseline justify-between gap-2 border-t border-app-bg pt-2">
                <span className="text-[10.5px] font-semibold text-zinc-400">
                  {items.length > 1 ? `${jobId}-${i + 1}` : jobId}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400">Total</span>
                  <span className="text-[13px] font-bold tracking-tight text-zinc-900">{money(itemTotal)}</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-1.5 border-t border-app-bg pt-2.5">
          <Row label="Due date" value={due || "—"} />
          <Row label="Pickup time" value={pickup || "—"} />
          <Row label="Checked in by" value={staff || "Staff"} />
        </div>
        {notes.trim() && <p className="m-0 text-xs leading-relaxed text-zinc-600">{notes}</p>}
      </section>
  );
}

function CustomerBlock({
  name,
  email,
  phone,
  signature,
}: {
  name: string;
  email: string;
  phone: string;
  signature?: string | null;
}) {
  return (
    <section className="flex flex-col gap-2.5 rounded-[11px] border border-border bg-white p-4">
      <span className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">Customer details</span>
      <div className="flex items-center gap-3">
        <Avatar name={name || "?"} size={38} />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-[13.5px] font-semibold text-zinc-900">{name || "—"}</span>
          <span className="truncate text-[11.5px] text-zinc-500">
            {[email, phone].filter(Boolean).join(" · ") || "No contact details on file"}
          </span>
        </div>
      </div>
      {signature && (
        <div className="flex flex-col gap-1.5 border-t border-app-bg pt-2.5">
          <div className="flex items-center gap-1.5">
            <Check size={12} strokeWidth={3} color="#16a34a" />
            <span className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "#15803d" }}>
              Signed by the customer
            </span>
          </div>
          <img src={signature} alt="Customer signature" className="h-[74px] w-full rounded-[8px] border border-border bg-white object-contain" />
        </div>
      )}
    </section>
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
  }, [nf, editorDin]);

  const total = items.reduce((sum, it) => sum + it.services.reduce((a, n) => a + svcPrice(n, it.serviceData), 0), 0);
  const jobId = useMemo(() => {
    const nums = jobs.map((j) => parseInt((j.id || "").replace(/[^0-9]/g, ""), 10)).filter((n) => !isNaN(n));
    return "PLCS" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0");
  }, [jobs]);

  const canContinue = agreed && !!custSignature;

  return (
    <Dialog open={waiverOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100vh-3rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]"
      >
        {/* Header */}
        <DialogHeader className="border-app-bg flex-row shrink-0 items-center gap-2.5 space-y-0 border-b px-5 py-4 text-left">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600">
            {step === 1 ? <FileText size={17} /> : <PenLine size={17} />}
          </div>
          <div className="flex min-w-0 flex-col">
            <DialogTitle className="text-[15px] tracking-tight">
              {step === 1 ? "Check-in waiver" : "Staff signature"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {step === 1 ? `Customer to review and sign for ${jobId}` : `Staff to countersign ${jobId}`}
            </DialogDescription>
          </div>
          <div className="flex-1" />
          <Badge variant="secondary" className="shrink-0 rounded-full">
            Step {step} of 2
          </Badge>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-surface-50 p-5">
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              <JobSummary items={items} jobId={jobId} total={total} due={nf.due} pickup={nf.pickup} staff={activeStaff} notes={nf.notes} />

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
                <Label
                  htmlFor="waiver-agree"
                  className="bg-surface-50 mt-1 items-start gap-2.5 rounded-md border p-3 text-[12.5px] leading-relaxed font-medium"
                >
                  <Checkbox
                    id="waiver-agree"
                    checked={agreed}
                    onCheckedChange={(v) => setAgreed(v === true)}
                    className="mt-px"
                  />
                  The customer has read and agreed to the terms above.
                </Label>
              </section>

              <CustomerBlock name={nf.customer} email={nf.email} phone={nf.phone} />

              {/* Customer signature */}
              <section className="flex flex-col gap-2.5 rounded-[11px] border border-border bg-white p-4">
                <div className="flex items-center justify-between">
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

              {/* Staff countersign against exactly what the customer just signed for. */}
              <JobSummary items={items} jobId={jobId} total={total} due={nf.due} pickup={nf.pickup} staff={activeStaff} notes={nf.notes} />

              <CustomerBlock name={nf.customer} email={nf.email} phone={nf.phone} signature={custSignature} />

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
        <DialogFooter className="flex-row shrink-0 items-center gap-2.5 border-t bg-white px-5 py-3.5 sm:justify-start">
          {step === 2 && (
            <Button variant="outline" onClick={back}>
              <ArrowLeft />
              Back
            </Button>
          )}
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <div className="flex-1" />
          {step === 1 ? (
            <Button
              onClick={next}
              disabled={!canContinue}
              title={!agreed ? "Confirm the terms have been read" : !custSignature ? "The customer needs to sign" : undefined}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={() => staffSignature && custSignature && sign(staffSignature, custSignature)}
              disabled={!staffSignature}
            >
              <Check strokeWidth={3} />
              Sign and check in
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
