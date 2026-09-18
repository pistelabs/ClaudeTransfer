import { CheckCircle2, CreditCard, MoreVertical, Printer, Trash2 } from "lucide-react";
import type { Job } from "../../types";
import { jobBalance, jobDiscount, jobFullyComplete, jobSubtotal } from "../../data/build";
import { useAppStore } from "../../store/useAppStore";
import { money } from "../../lib/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function Line({ label, value, tone }: { label: string; value: string; tone?: "credit" | "muted" }) {
  return (
    <div className="flex min-w-[126px] items-baseline justify-between gap-3 leading-[1.45]">
      <span className="text-muted-foreground text-[10px]">{label}</span>
      <span
        className={cn(
          "text-[10px] font-semibold tabular-nums",
          tone === "credit" && "text-green-600",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** The job's bill across the foot of the detail sheet: what is owed, what it is made of, and
 * the one action that moves it on — take the payment, then mark the job collected. */
export function PaymentBar({ job }: { job: Job }) {
  const openPay = useAppStore((s) => s.openPay);
  const markCollected = useAppStore((s) => s.markCollected);
  const deleteJob = useAppStore((s) => s.deleteJob);

  const subtotal = jobSubtotal(job);
  const discount = jobDiscount(job);
  const paid = job.paid || 0;
  const balance = jobBalance(job);

  const settled = balance <= 0;
  const allComplete = jobFullyComplete(job);
  const collected = job.equipment.every((eq) => eq.stage === "archive");

  return (
    <div className="flex shrink-0 items-center gap-3.5 border-t bg-white px-5 py-2.5">
      <div className="flex flex-col gap-px">
        <span className="text-muted-foreground text-[9px] font-bold tracking-[0.09em] uppercase">Total Due</span>
        <span className="text-[22px] leading-[1.05] font-extrabold tracking-tight tabular-nums">{money(balance)}</span>
      </div>
      <Separator orientation="vertical" className="h-9" />
      <div className="flex flex-col">
        <Line label="Subtotal" value={money(subtotal)} />
        <Line
          label={discount < 0 ? "Adjustment" : "Discount"}
          value={discount > 0 ? `−${money(discount)}` : discount < 0 ? `+${money(-discount)}` : money(0)}
          tone={discount > 0 ? "credit" : "muted"}
        />
        <Line label="Paid" value={paid > 0 ? `−${money(paid)}` : money(0)} tone={paid > 0 ? "credit" : "muted"} />
      </div>

      <div className="flex-1" />

      {/* Green is the one deliberate exception to the neutral palette: this is the bar's whole
       * purpose, and it needs to read as the primary action from across a bench. */}
      {collected ? (
        <span className="text-muted-foreground px-2 text-[13px] font-semibold">Collected</span>
      ) : settled ? (
        <Button
          onClick={markCollected}
          disabled={!allComplete}
          title={allComplete ? undefined : "Every service has to be ticked off before the job can be completed"}
          size="lg"
          className="min-w-[152px] bg-green-600 text-[15px] font-bold tracking-tight text-white hover:bg-green-700"
        >
          <CheckCircle2 className="size-[18px]" />
          Complete
        </Button>
      ) : (
        <Button
          onClick={openPay}
          size="lg"
          className="min-w-[152px] bg-green-600 text-[15px] font-bold tracking-tight text-white hover:bg-green-700"
        >
          <CreditCard className="size-[18px]" />
          Pay Now
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="lg" className="w-11 bg-white px-0">
            <MoreVertical className="size-[17px]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="min-w-[180px]">
          <DropdownMenuItem>
            <Printer />
            Print receipt
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => deleteJob(job.id)}>
            <Trash2 />
            Delete Job
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
