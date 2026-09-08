import { CreditCard, MoreVertical, Printer, Trash2 } from "lucide-react";
import type { Job } from "../../types";
import { jobBalance, jobTotal } from "../../data/build";
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

export function PaymentBar({ job }: { job: Job }) {
  const openPay = useAppStore((s) => s.openPay);
  const deleteJob = useAppStore((s) => s.deleteJob);

  const total = jobTotal(job);
  const balance = jobBalance(job);

  return (
    <div className="flex shrink-0 items-stretch border-t bg-white">
      <div className="flex min-w-0 flex-1 items-center gap-[18px] px-5 py-3">
        <div className="flex flex-col gap-px">
          <span className="text-muted-foreground text-[9.5px] font-bold tracking-[0.09em] uppercase">Balance Due</span>
          <span className="text-[26px] leading-[1.05] font-extrabold tracking-tight tabular-nums">
            {money(balance)}
          </span>
        </div>
        <Separator orientation="vertical" className="self-stretch" />
        <div className="flex flex-col gap-1 tabular-nums">
          <div className="flex min-w-[132px] items-center justify-between gap-4">
            <span className="text-muted-foreground text-[11.5px]">Subtotal</span>
            <span className="text-[11.5px] font-semibold text-zinc-700">{money(total)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-[11.5px]">Paid</span>
            <span className="text-green text-[11.5px] font-semibold">{money(job.paid || 0)}</span>
          </div>
        </div>
      </div>

      {/* Green is the one deliberate exception to the neutral palette: taking payment is the
       * bar's whole purpose, and it needs to read as the primary action from across a bench. */}
      <Button
        onClick={openPay}
        className="h-auto min-w-[172px] rounded-none bg-green-600 px-6 text-base font-bold tracking-tight text-white hover:bg-green-700"
      >
        <CreditCard className="size-[18px]" />
        Pay Now
      </Button>

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
