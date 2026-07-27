import { AlertTriangle, CheckCircle2, CreditCard, Mail } from "lucide-react";
import type { Job } from "../../types";
import { jobTotal } from "../../data/build";
import { useAppStore } from "../../store/useAppStore";
import { money } from "../../lib/format";

export function HoldPromptModal({ job }: { job: Job }) {
  const holdPrompt = useAppStore((s) => s.holdPrompt);
  const holdReason = useAppStore((s) => s.holdReason);
  const holdMoveStage = useAppStore((s) => s.holdMoveStage);
  const holdEqIdx = useAppStore((s) => s.holdEqIdx);
  const setHoldReason = (v: string) => useAppStore.setState({ holdReason: v });
  const cancel = () => useAppStore.setState({ holdPrompt: false, holdReason: "", holdMoveStage: null, holdEqIdx: null });

  if (!holdPrompt) return null;
  const eqIdx = holdEqIdx ?? 0;
  const eq = job.equipment[eqIdx];
  if (!eq) return null;
  const rowLabel = job.equipment.length > 1 ? `${job.id}-${eqIdx + 1}` : null;
  const canConfirm = holdReason.trim().length > 0;

  const doConfirm = () => {
    const r = holdReason.trim();
    if (!r) return;
    const stamp = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }) + " " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    // Notes are shared/job-level, so prefix the equipment id whenever the job has more than one
    // item — keeps a shared feed traceable back to which item the hold is actually about.
    const noteText = (rowLabel ? `${rowLabel}: ` : "") + "Set to Pending: " + r;
    useAppStore.setState((st) => ({
      jobs: st.jobs.map((j) =>
        j.id === job.id
          ? {
              ...j,
              equipment: j.equipment.map((e, i) => (i === eqIdx ? { ...e, workStatus: "Pending", stage: holdMoveStage ?? e.stage } : e)),
              updates: [{ text: noteText, hold: true, eqIdx, at: j.tech + " · " + stamp }, ...j.updates],
            }
          : j,
      ),
      holdPrompt: false,
      holdReason: "",
      holdMoveStage: null,
      holdEqIdx: null,
    }));
  };

  return (
    <div className="animate-sheet-fade absolute inset-0 z-10 flex items-center justify-center p-7" style={{ background: "rgba(9,9,11,0.35)" }}>
      <div className="animate-sheet-pop flex w-full max-w-[400px] flex-col gap-3.5 rounded-[13px] border border-border bg-white p-5" style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#d97706" }}>
            <AlertTriangle size={19} />
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-[15px] font-bold tracking-tight">Set {rowLabel || "equipment"} to Pending</span>
            <span className="text-xs text-zinc-500">Add a reason before moving this equipment.</span>
          </div>
        </div>
        <textarea
          value={holdReason}
          onChange={(e) => setHoldReason(e.target.value)}
          placeholder="Reason for hold (e.g. waiting on parts)..."
          className="min-h-[78px] w-full resize-y rounded-[9px] border border-border px-3 py-2.5 text-[13px] leading-relaxed outline-none focus:border-[#d97706] focus:shadow-[0_0_0_3px_rgba(217,119,6,0.14)]"
        />
        <div className="flex gap-2.5 pt-0.5">
          <button onClick={cancel} className="h-10 rounded-[9px] border border-border bg-white px-[18px] text-[13px] font-medium text-zinc-900 hover:bg-app-bg">
            Cancel
          </button>
          <button
            onClick={doConfirm}
            disabled={!canConfirm}
            className="h-10 flex-1 rounded-[9px] text-[13px] font-semibold"
            style={{
              color: canConfirm ? "#ffffff" : "#c4c4c8",
              background: canConfirm ? "#d97706" : "#f4f4f5",
              border: canConfirm ? "1px solid #d97706" : "1px solid #e4e4e7",
              cursor: canConfirm ? "pointer" : "not-allowed",
            }}
          >
            Set to Pending
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResolvePendingModal({ job }: { job: Job }) {
  const resolvePendingPrompt = useAppStore((s) => s.resolvePendingPrompt);
  const closeResolvePending = useAppStore((s) => s.closeResolvePending);
  const confirmResolvePending = useAppStore((s) => s.confirmResolvePending);

  if (!resolvePendingPrompt || resolvePendingPrompt.jobId !== job.id) return null;
  const eqIdx = resolvePendingPrompt.eqIdx;
  const rowLabel = job.equipment.length > 1 ? `${job.id}-${eqIdx + 1}` : "this equipment";
  const reason = job.updates.find((u) => u.hold && !u.resolved && u.eqIdx === eqIdx);

  return (
    <div className="animate-sheet-fade absolute inset-0 z-10 flex items-center justify-center p-7" style={{ background: "rgba(9,9,11,0.35)" }} onClick={closeResolvePending}>
      <div className="animate-sheet-pop flex w-full max-w-[400px] flex-col gap-3.5 rounded-[13px] border border-border bg-white p-5" style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#d97706" }}>
            <AlertTriangle size={19} />
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-[15px] font-bold tracking-tight">Resolve pending hold?</span>
            <span className="text-xs text-zinc-500">{rowLabel} is on hold for the reason below.</span>
          </div>
        </div>
        {reason && (
          <div className="rounded-[9px] border p-[9px_11px]" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
            <div className="text-[12.5px] leading-relaxed text-zinc-800">{reason.text}</div>
            <div className="mt-[3px] text-[10.5px] text-zinc-400">{reason.at}</div>
          </div>
        )}
        <p className="m-0 text-[13px] leading-relaxed text-zinc-700">
          Resolve to move {rowLabel} to <strong>{resolvePendingPrompt.targetLabel}</strong>, or cancel to keep it in Pending.
        </p>
        <div className="flex gap-2.5 pt-0.5">
          <button onClick={closeResolvePending} className="h-10 flex-1 rounded-[9px] border border-border bg-white text-[13px] font-medium text-zinc-900 hover:bg-app-bg">
            Cancel
          </button>
          <button onClick={confirmResolvePending} className="h-10 flex-1 rounded-[9px] text-[13px] font-semibold text-white" style={{ background: "#16a34a" }}>
            Resolve
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReadyPromptModal() {
  const readyPrompt = useAppStore((s) => s.readyPrompt);
  const closeReady = useAppStore((s) => s.closeReady);
  const notifyCustomer = useAppStore((s) => s.notifyCustomer);

  if (!readyPrompt) return null;

  const incomplete = readyPrompt === "incomplete" || readyPrompt === "collect_incomplete" || readyPrompt === "collect_balance";
  const single = readyPrompt === "single";

  const title = incomplete
    ? readyPrompt === "collect_balance"
      ? "Balance outstanding"
      : "Work not finished"
    : "Equipment ready";

  const message =
    readyPrompt === "incomplete"
      ? "Tick off every service on this item before marking it ready for collection."
      : readyPrompt === "collect_incomplete"
        ? "Every service on this equipment item must be completed before it can be collected."
        : readyPrompt === "collect_balance"
          ? "The balance due must be $0.00 before this job can be marked collected. Take payment first."
          : readyPrompt === "multi"
            ? "This item is ready. Contact the customer to collect once all equipment on this job is ready."
            : "This job is ready for collection. Notify the customer that they can pick it up.";

  return (
    <div className="animate-sheet-fade absolute inset-0 z-10 flex items-center justify-center p-7" style={{ background: "rgba(9,9,11,0.35)" }} onClick={closeReady}>
      <div className="animate-sheet-pop flex w-full max-w-[400px] flex-col gap-4 rounded-[13px] border border-border bg-white p-5" style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5">
          {incomplete ? (
            <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#d97706" }}>
              <AlertTriangle size={19} />
            </div>
          ) : (
            <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#059669" }}>
              <CheckCircle2 size={19} />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-bold tracking-tight">{title}</span>
            <span className="text-[12.5px] leading-relaxed text-zinc-500">{message}</span>
          </div>
        </div>
        <div className="flex justify-end gap-2.5 pt-0.5">
          {single && (
            <>
              <button onClick={closeReady} className="h-10 rounded-[9px] border border-border bg-white px-4 text-[13px] font-medium text-zinc-900 hover:bg-app-bg">
                Later
              </button>
              <button
                onClick={notifyCustomer}
                className="flex h-10 items-center gap-[7px] rounded-[9px] border px-[18px] text-[13px] font-semibold text-white"
                style={{ background: "#059669", borderColor: "#059669" }}
              >
                <Mail size={15} />
                Notify customer
              </button>
            </>
          )}
          {!single && (
            <button onClick={closeReady} className="h-10 rounded-[9px] bg-zinc-900 px-[18px] text-[13px] font-semibold text-white hover:bg-[#2a2a2e]">
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PayModals({ job }: { job: Job }) {
  const payPrompt = useAppStore((s) => s.payPrompt);
  const closePay = useAppStore((s) => s.closePay);
  const paymentDone = useAppStore((s) => s.paymentDone);
  const markCollected = useAppStore((s) => s.markCollected);

  if (!payPrompt) return null;
  const balance = money(jobTotal(job));

  if (payPrompt === "pay") {
    return (
      <div className="animate-sheet-fade absolute inset-0 z-10 flex items-center justify-center p-7" style={{ background: "rgba(9,9,11,0.35)" }} onClick={closePay}>
        <div className="animate-sheet-pop flex w-full max-w-[400px] flex-col gap-3.5 rounded-[13px] border border-border bg-white p-5" style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }}>
              <CreditCard size={19} />
            </div>
            <div className="flex flex-col gap-px">
              <span className="text-[15px] font-bold tracking-tight">Take payment</span>
              <span className="text-xs text-zinc-500">Balance due {balance}</span>
            </div>
          </div>
          <p className="m-0 text-[13px] leading-relaxed text-zinc-700">
            This is the link to the payment software. When payment is successfully taken it returns to the following popup.
          </p>
          <button
            onClick={paymentDone}
            className="flex h-11 items-center justify-center gap-2 rounded-[10px] text-[13.5px] font-semibold text-white"
            style={{ background: "#16a34a" }}
          >
            Open payment software
          </button>
          <button onClick={closePay} className="h-[34px] text-[13px] font-medium text-zinc-500">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-sheet-fade absolute inset-0 z-10 flex items-center justify-center p-7" style={{ background: "rgba(9,9,11,0.35)" }} onClick={closePay}>
      <div className="animate-sheet-pop flex w-full max-w-[400px] flex-col gap-3.5 rounded-[13px] border border-border bg-white p-5" style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }}>
            <CheckCircle2 size={20} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-[15px] font-bold tracking-tight">Payment successful</span>
            <span className="text-xs text-zinc-500">{balance} received</span>
          </div>
        </div>
        <p className="m-0 text-[13px] leading-relaxed text-zinc-700">Payment has been taken. Mark this equipment as collected to complete the job.</p>
        <button
          onClick={markCollected}
          className="flex h-11 items-center justify-center gap-2 rounded-[10px] text-[13.5px] font-semibold text-white"
          style={{ background: "#16a34a" }}
        >
          Mark equipment as collected
        </button>
        <button onClick={closePay} className="h-[34px] text-[13px] font-medium text-zinc-500">
          Close
        </button>
      </div>
    </div>
  );
}
