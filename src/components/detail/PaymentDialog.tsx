import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { deriveLineItems, jobBalance, jobDiscount, jobSubtotal, jobTotal } from "../../data/build";
import { money } from "../../lib/format";
import { PAYMENT_METHODS, type PaymentMethod } from "../../lib/integrations";
import { Avatar } from "../Pills";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

function Line({ label, value, tone }: { label: string; value: string; tone?: "muted" | "credit" | "total" }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className={tone === "total" ? "text-[13px] font-semibold" : "text-muted-foreground text-[12.5px]"}>
        {label}
      </span>
      <span
        className={
          tone === "total"
            ? "text-[17px] font-extrabold tracking-tight tabular-nums"
            : tone === "credit"
              ? "text-[12.5px] font-semibold tabular-nums text-green-600"
              : "text-[12.5px] font-semibold tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Stands in for the payment software when none is connected: what is owed, what it is made up
 * of, and somewhere to record what was taken and how.
 */
export function PaymentDialog() {
  const payDialogJobId = useAppStore((s) => s.payDialogJobId);
  const jobs = useAppStore((s) => s.jobs);
  const closePayDialog = useAppStore((s) => s.closePayDialog);
  const recordPayment = useAppStore((s) => s.recordPayment);

  const job = jobs.find((j) => j.id === payDialogJobId);
  const balance = job ? jobBalance(job) : 0;

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Card");

  // Prefill with the full balance each time the dialog opens for a job.
  useEffect(() => {
    if (payDialogJobId) setAmount(balance > 0 ? balance.toFixed(2) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payDialogJobId]);

  if (!job) return null;

  const subtotal = jobSubtotal(job);
  const discount = jobDiscount(job);
  const total = jobTotal(job);
  const entered = Number(amount);
  const valid = Number.isFinite(entered) && entered > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && closePayDialog()}>
      <DialogContent className="flex max-h-[calc(100vh-3rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[460px]">
        <DialogHeader className="border-app-bg flex-row shrink-0 items-center gap-2.5 space-y-0 border-b px-5 py-4 text-left">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
            <CreditCard className="size-5" />
          </div>
          <div className="flex min-w-0 flex-col">
            <DialogTitle className="text-[15px] tracking-tight">Take payment</DialogTitle>
            <DialogDescription className="text-xs">
              {job.id} · no payment software connected
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="bg-surface-50 flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <section className="flex items-center gap-3 rounded-xl border bg-white p-4">
            <Avatar name={job.customer || "?"} size={38} />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-[13.5px] font-semibold">{job.customer}</span>
              <span className="text-muted-foreground truncate text-[11.5px]">
                {[job.email, job.phone].filter(Boolean).join(" · ") || "No contact details on file"}
              </span>
            </div>
          </section>

          <section className="flex flex-col gap-2.5 rounded-xl border bg-white p-4">
            <span className="text-muted-foreground text-[10.5px] font-bold tracking-wide uppercase">Services</span>
            <div className="flex flex-col gap-3">
              {job.equipment.map((eq, i) => {
                const lines = deriveLineItems(eq);
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-[11.5px] font-semibold">
                      {eq.brand} {eq.model}
                      <span className="text-muted-foreground font-normal">
                        {" · "}
                        {job.equipment.length > 1 ? `${job.id}-${i + 1}` : job.id}
                      </span>
                    </span>
                    {lines.length === 0 ? (
                      <span className="text-muted-foreground text-[12px] italic">No services</span>
                    ) : (
                      lines.map((li, k) => (
                        <div key={li.name + k} className="flex items-baseline justify-between gap-4">
                          <span className="text-[12.5px]">{li.name}</span>
                          <span className="text-[12.5px] font-medium tabular-nums">{money(li.price)}</span>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>

            <Separator className="my-1" />

            <Line label="Subtotal" value={money(subtotal)} />
            <Line
              label={discount >= 0 ? "Discount" : "Adjustment"}
              value={discount >= 0 ? `−${money(discount)}` : `+${money(-discount)}`}
              tone={discount > 0 ? "credit" : "muted"}
            />
            {(job.paid || 0) > 0 && <Line label="Already paid" value={`−${money(job.paid || 0)}`} tone="credit" />}
            <Separator className="my-1" />
            <Line label="Total Due" value={money(balance > 0 ? balance : total)} tone="total" />
          </section>

          <section className="flex flex-col gap-3 rounded-xl border bg-white p-4">
            <span className="text-muted-foreground text-[10.5px] font-bold tracking-wide uppercase">Payment</span>
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="pay-amount">Amount</Label>
                <div className="relative">
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13px]">
                    $
                  </span>
                  <Input
                    id="pay-amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="decimal"
                    placeholder="0.00"
                    className="pl-6 font-semibold"
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="pay-method">Method</Label>
                <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                  <SelectTrigger id="pay-method" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {valid && entered < balance && (
              <span className="text-[11.5px] text-amber-700">
                Part payment — {money(balance - entered)} will remain outstanding.
              </span>
            )}
          </section>
        </div>

        <DialogFooter className="flex-row shrink-0 items-center gap-2.5 border-t bg-white px-5 py-3.5 sm:justify-start">
          <Button variant="ghost" onClick={closePayDialog}>
            Pay on collection
          </Button>
          <div className="flex-1" />
          <Button disabled={!valid} onClick={() => recordPayment(job.id, entered, method)}>
            Record {valid ? money(entered) : "payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
