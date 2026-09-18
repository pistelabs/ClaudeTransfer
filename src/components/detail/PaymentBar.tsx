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
    <div className="flex min-w-[140px] items-baseline justify-between gap-4">
      <span className="text-muted-foreground text-[11.5px]">{label}</span>
      <span
        className={cn(
          "text-[11.5px] font-semibold tabular-nums",
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
    <div className="flex shrink-0 items-stretch border-t bg-white">
      <div className="flex min-w-0 flex-1 items-center gap-[18px] px-5 py-3">
        <div className="flex flex-col gap-px">
          <span className="text-muted-foreground text-[9.5px] font-bold tracking-[0.09em] uppercase">Total Due</span>
          <span className="text-[26px] leading-[1.05] font-extrabold tracking-tight tabular-nums">
            {money(balance)}
          </span>
        </div>
        <Separator orientation="vertical" className="self-stretch" />
        <div className="flex flex-col gap-0.5">
          <Line label="Subtotal" value={money(subtotal)} />
          <Line
            label={discount < 0 ? "Adjustment" : "Discount"}
            value={discount > 0 ? `−${money(discount)}` : discount < 0 ? `+${money(-discount)}` : money(0)}
            tone={discount > 0 ? "credit" : "muted"}
          />
          <Line label="Paid" value={paid > 0 ? `−${money(paid)}` : money(0)} tone={paid > 0 ? "credit" : "muted"} />
        </div>
      </div>

      {/* Green is the one deliberate exception to the neutral palette: this is the bar's whole
       * purpose, and it needs to read as the primary action from across a bench. */}
      {collected ? (
        <div className="flex min-w-[172px] flex-col items-center justify-center gap-0.5 border-l bg-zinc-50 px-6">
          <span className="text-muted-foreground text-[13px] font-semibold">Collected</span>
        </div>
      ) : settled ? (
        <Button
          onClick={markCollected}
          disabled={!allComplete}
          title={allComplete ? undefined : "Every service has to be ticked off before the job can be completed"}
          className="h-auto min-w-[172px] rounded-none bg-green-600 px-6 text-base font-bold tracking-tight text-white hover:bg-green-700"
        >
          <CheckCircle2 className="size-[18px]" />
          Complete
        </Button>
      ) : (
        <Button
          onClick={openPay}
          className="h-auto min-w-[172px] rounded-none bg-green-600 px-6 text-base font-bold tracking-tight text-white hover:bg-green-700"
        >
          <CreditCard className="size-[18px]" />
          Pay Now
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-auto w-[52px] rounded-none">
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
