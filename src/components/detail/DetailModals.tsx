import { AlertTriangle, CheckCircle2, CreditCard, Mail } from "lucide-react";
import type { Job } from "../../types";
import { jobBalance, jobFullyComplete, jobTotal } from "../../data/build";
import { useAppStore } from "../../store/useAppStore";
import { money } from "../../lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/** The coloured square that leads each of these prompts. Amber for attention, green for done —
 * status colour, not chrome, so it survives the move to shadcn's neutral palette. */
function PromptIcon({ tone, children }: { tone: "amber" | "green"; children: React.ReactNode }) {
  return (
    <div
      className={
        tone === "amber"
          ? "flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600"
          : "flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600"
      }
    >
      {children}
    </div>
  );
}

export function HoldPromptModal({ job }: { job: Job }) {
  const holdPrompt = useAppStore((s) => s.holdPrompt);
  const holdReason = useAppStore((s) => s.holdReason);
  const holdMoveStage = useAppStore((s) => s.holdMoveStage);
  const holdEqIdx = useAppStore((s) => s.holdEqIdx);
  const setHoldReason = (v: string) => useAppStore.setState({ holdReason: v });
  const cancel = () =>
    useAppStore.setState({ holdPrompt: false, holdReason: "", holdMoveStage: null, holdEqIdx: null });

  const eqIdx = holdEqIdx ?? 0;
  const eq = job.equipment[eqIdx];
  const rowLabel = job.equipment.length > 1 ? `${job.id}-${eqIdx + 1}` : null;
  const canConfirm = holdReason.trim().length > 0;

  const doConfirm = () => {
    const r = holdReason.trim();
    if (!r) return;
    const stamp =
      new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }) +
      " " +
      new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    // Notes are shared/job-level, so prefix the equipment id whenever the job has more than one
    // item — keeps a shared feed traceable back to which item the hold is actually about.
    const noteText = (rowLabel ? `${rowLabel}: ` : "") + "Set to Pending: " + r;
    useAppStore.setState((st) => ({
      jobs: st.jobs.map((j) =>
        j.id === job.id
          ? {
              ...j,
              equipment: j.equipment.map((e, i) =>
                i === eqIdx ? { ...e, workStatus: "Pending", stage: holdMoveStage ?? e.stage } : e,
              ),
              updates: [
                { text: noteText, hold: true, reason: r, eqIdx, at: j.tech + " · " + stamp },
                ...j.updates,
              ],
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
    <Dialog open={!!holdPrompt && !!eq} onOpenChange={(open) => !open && cancel()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <PromptIcon tone="amber">
              <AlertTriangle className="size-5" />
            </PromptIcon>
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Set {rowLabel || "equipment"} to Pending</DialogTitle>
              <DialogDescription>Add a reason before moving this equipment.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Textarea
          value={holdReason}
          onChange={(e) => setHoldReason(e.target.value)}
          placeholder="Reason for hold (e.g. waiting on parts)..."
          className="min-h-20 resize-y"
        />
        <DialogFooter>
          <Button variant="outline" onClick={cancel}>
            Cancel
          </Button>
          <Button onClick={doConfirm} disabled={!canConfirm}>
            Set to Pending
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResolvePendingModal({ job }: { job: Job }) {
  const resolvePendingPrompt = useAppStore((s) => s.resolvePendingPrompt);
  const closeResolvePending = useAppStore((s) => s.closeResolvePending);
  const confirmResolvePending = useAppStore((s) => s.confirmResolvePending);

  const open = !!resolvePendingPrompt && resolvePendingPrompt.jobId === job.id;
  const eqIdx = resolvePendingPrompt?.eqIdx ?? 0;
  const rowLabel = job.equipment.length > 1 ? `${job.id}-${eqIdx + 1}` : "this equipment";
  const reason = job.updates.find((u) => u.hold && !u.resolved && u.eqIdx === eqIdx);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeResolvePending()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <PromptIcon tone="amber">
              <AlertTriangle className="size-5" />
            </PromptIcon>
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Resolve pending hold?</DialogTitle>
              <DialogDescription>{rowLabel} is on hold for the reason below.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {reason && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <div className="text-sm leading-relaxed text-zinc-800">{reason.text}</div>
            <div className="text-muted-foreground mt-0.5 text-xs">{reason.at}</div>
          </div>
        )}
        <p className="text-muted-foreground m-0 text-sm leading-relaxed">
          Resolve to move {rowLabel} to <strong className="text-foreground">{resolvePendingPrompt?.targetLabel}</strong>, or
          cancel to keep it in Pending.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={closeResolvePending}>
            Cancel
          </Button>
          <Button onClick={confirmResolvePending}>Resolve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReadyPromptModal() {
  const readyPrompt = useAppStore((s) => s.readyPrompt);
  const closeReady = useAppStore((s) => s.closeReady);
  const notifyCustomer = useAppStore((s) => s.notifyCustomer);

  const incomplete =
    readyPrompt === "incomplete" ||
    readyPrompt === "collect_incomplete" ||
    readyPrompt === "collect_balance" ||
    readyPrompt === "hold_blocked";
  const single = readyPrompt === "single";

  const title = incomplete
    ? readyPrompt === "collect_balance"
      ? "Balance outstanding"
      : readyPrompt === "hold_blocked"
        ? "Equipment on hold"
        : "Work not finished"
    : "Equipment ready";

  const message =
    readyPrompt === "incomplete"
      ? "Tick off every service on this item before marking it ready for collection."
      : readyPrompt === "hold_blocked"
        ? "This equipment is on hold. Set it back to Checked-in or In progress and finish its services before it can be marked ready or collected."
        : readyPrompt === "collect_incomplete"
          ? "Every service on this equipment item must be completed before it can be collected."
          : readyPrompt === "collect_balance"
            ? "The balance due must be $0.00 before this job can be marked collected. Take payment first."
            : readyPrompt === "multi"
              ? "This item is ready. Contact the customer to collect once all equipment on this job is ready."
              : "This job is ready for collection. Notify the customer that they can pick it up.";

  return (
    <Dialog open={!!readyPrompt} onOpenChange={(open) => !open && closeReady()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            {incomplete ? (
              <PromptIcon tone="amber">
                <AlertTriangle className="size-5" />
              </PromptIcon>
            ) : (
              <PromptIcon tone="green">
                <CheckCircle2 className="size-5" />
              </PromptIcon>
            )}
            <div className="flex flex-col gap-0.5">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{message}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          {single ? (
            <>
              <Button variant="outline" onClick={closeReady}>
                Later
              </Button>
              <Button onClick={notifyCustomer}>
                <Mail />
                Notify customer
              </Button>
            </>
          ) : (
            <Button onClick={closeReady}>Got it</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PayModals({ job }: { job: Job }) {
  const payPrompt = useAppStore((s) => s.payPrompt);
  const closePay = useAppStore((s) => s.closePay);
  const paymentDone = useAppStore((s) => s.paymentDone);
  const markCollected = useAppStore((s) => s.markCollected);
  const activeTab = useAppStore((s) => s.activeTab);

  const balance = money(jobTotal(job) - (job.paid || 0));

  // Completing the job is only offered when payment was taken from the Ready status —
  // from anywhere else this is just a receipt. Even then every service on every piece of
  // equipment has to be ticked off first.
  const fromReady = job.equipment[activeTab]?.workStatus === "Ready";
  const allComplete = jobFullyComplete(job);
  const canComplete = fromReady && allComplete;

  return (
    <Dialog open={!!payPrompt} onOpenChange={(open) => !open && closePay()}>
      <DialogContent className="sm:max-w-[420px]">
        {payPrompt === "pay" ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <PromptIcon tone="green">
                  <CreditCard className="size-5" />
                </PromptIcon>
                <div className="flex flex-col gap-0.5">
                  <DialogTitle>Take payment</DialogTitle>
                  <DialogDescription>Balance due {balance}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <p className="text-muted-foreground m-0 text-sm leading-relaxed">
              This is the link to the payment software. When payment is successfully taken it returns to the
              following popup.
            </p>
            <Button onClick={paymentDone} size="lg">
              Open payment software
            </Button>
            <Button variant="ghost" onClick={closePay} size="sm">
              Cancel
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <PromptIcon tone="green">
                  <CheckCircle2 className="size-5" />
                </PromptIcon>
                <div className="flex flex-col gap-0.5">
                  <DialogTitle>Payment successful</DialogTitle>
                  <DialogDescription>
                    {money(job.paid || 0)} received · {money(jobBalance(job))} due
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {canComplete && (
              <>
                <p className="text-muted-foreground m-0 text-sm leading-relaxed">
                  All services on this job are complete. Move it to complete to archive the equipment.
                </p>
                <Button onClick={markCollected} size="lg">
                  Move job to complete
                </Button>
              </>
            )}

            {fromReady && !allComplete && (
              <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 p-3">
                <AlertTriangle className="mt-px size-4 shrink-0 text-amber-600" />
                <p className="m-0 text-sm leading-relaxed text-amber-800">
                  Please mark all services complete before marking job as complete.
                </p>
              </div>
            )}

            <Button variant="ghost" onClick={closePay} size="sm">
              Close
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
