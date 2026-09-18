import { CreditCard, MoreVertical, Printer, Trash2 } from "lucide-react";
import type { Job } from "../../types";
import { equipmentPrice, equipmentServiceTotal, jobBalance, jobDiscount, jobSubtotal } from "../../data/build";
import { useAppStore } from "../../store/useAppStore";
import { money } from "../../lib/format";
import { ServicePill, TypeBadge } from "../Pills";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * The job's bill, laid out exactly like the check-in sheet's summary column so the figures
 * staff agreed at drop-off are recognisable when the job comes back to be collected.
 */
export function JobSummaryColumn({ job }: { job: Job }) {
  const openPay = useAppStore((s) => s.openPay);
  const deleteJob = useAppStore((s) => s.deleteJob);

  const subtotal = jobSubtotal(job);
  const discount = jobDiscount(job);
  const paid = job.paid || 0;
  const balance = jobBalance(job);

  return (
    <div className="border-border flex w-[300px] flex-shrink-0 flex-col border-l bg-white">
      <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-[18px] py-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-[10.5px] font-bold tracking-wide uppercase">Equipment</span>
            <span className="bg-app-bg text-muted-foreground rounded-full px-2 py-px text-[11px] font-semibold">
              {job.equipment.length}
            </span>
          </div>
          <div className="flex flex-col gap-[7px]">
            {job.equipment.map((eq, i) => {
              const price = equipmentPrice(eq);
              const adjusted = Math.abs(price - equipmentServiceTotal(eq)) >= 0.005;
              // Work that is finished and waiting to be collected tints green, so a part-done
              // job shows at a glance which items are still on the bench.
              const ready = eq.stage === "awaiting" || eq.stage === "archive";
              return (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-[11px] border shadow-sm",
                    ready ? "border-emerald-200 bg-emerald-50/50" : "bg-white",
                  )}
                >
                  <div className="flex items-start gap-2.5 px-[11px] pt-[11px] pb-[9px]">
                    <TypeBadge type={eq.type} />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.3]">
                      <span className="overflow-hidden text-[13px] font-semibold text-ellipsis whitespace-nowrap">
                        {[eq.brand, eq.model].filter(Boolean).join(" ")}
                      </span>
                      <span className="text-muted-foreground overflow-hidden text-[11px] font-medium text-ellipsis whitespace-nowrap">
                        {[eq.size, eq.colour].filter(Boolean).join(" · ") || "—"}
                      </span>
                    </div>
                  </div>
                  {eq.services.length > 0 ? (
                    <div className="flex flex-wrap gap-1 px-[11px] pb-2.5">
                      {eq.services.map((s) => (
                        <ServicePill key={s} name={s} />
                      ))}
                    </div>
                  ) : (
                    <div className="px-[11px] pb-2.5">
                      <span className="text-muted-foreground text-[10.5px] italic">No services added</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "border-app-bg flex items-center justify-between gap-2 border-t px-[11px] py-2",
                      ready ? "bg-emerald-50" : "bg-surface-50",
                    )}
                  >
                    <span
                      className="bg-app-bg rounded-[6px] px-[7px] py-0.5 text-[10.5px] font-semibold whitespace-nowrap text-zinc-600"
                      style={{ fontFamily: "ui-monospace, SF Mono, Menlo, monospace" }}
                    >
                      {job.equipment.length > 1 ? `${job.id}-${i + 1}` : job.id}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-muted-foreground text-[10.5px] font-semibold tracking-wide uppercase">
                        {adjusted ? "Adjusted" : "Total"}
                      </span>
                      <span className="text-[13.5px] font-bold tracking-tight tabular-nums">{money(price)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-app-bg flex flex-shrink-0 flex-col gap-2 border-t px-[18px] py-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground text-[12.5px]">Subtotal</span>
          <span className="text-[12.5px] font-semibold tabular-nums">{money(subtotal)}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground text-[12.5px]">{discount < 0 ? "Adjustment" : "Discount"}</span>
          <span
            className={cn(
              "text-[12.5px] font-semibold tabular-nums",
              discount > 0 && "text-green-600",
              discount === 0 && "text-muted-foreground",
            )}
          >
            {discount > 0 ? `−${money(discount)}` : discount < 0 ? `+${money(-discount)}` : money(0)}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground text-[12.5px]">Paid</span>
          <span className={cn("text-[12.5px] font-semibold tabular-nums", paid > 0 && "text-green-600")}>
            {paid > 0 ? `−${money(paid)}` : money(0)}
          </span>
        </div>
        <div className="border-app-bg mt-0.5 flex items-baseline justify-between border-t pt-2 pb-0.5">
          <span className="text-[14px] font-semibold text-zinc-700">Total Due</span>
          <span className="text-ink text-[22px] font-extrabold tracking-tight tabular-nums">{money(balance)}</span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={openPay}
            size="lg"
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
            disabled={balance <= 0}
          >
            <CreditCard />
            {balance <= 0 ? "Paid in full" : "Pay Now"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="w-11 px-0">
                <MoreVertical />
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
      </div>
    </div>
  );
}
