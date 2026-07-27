import { CreditCard, MoreVertical, Printer, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Job } from "../../types";
import { jobBalance, jobTotal } from "../../data/build";
import { useAppStore } from "../../store/useAppStore";
import { money } from "../../lib/format";

export function PaymentBar({ job }: { job: Job }) {
  const openPay = useAppStore((s) => s.openPay);
  const deleteJob = useAppStore((s) => s.deleteJob);
  const [menuOpen, setMenuOpen] = useState(false);

  const total = jobTotal(job);
  const balance = jobBalance(job);

  return (
    <div className="flex flex-shrink-0 items-stretch border-t border-border bg-white">
      <div className="flex min-w-0 flex-1 items-center gap-[18px] px-5 py-3">
        <div className="flex flex-col gap-px">
          <span className="text-[9.5px] font-bold uppercase tracking-[0.09em] text-zinc-400">Balance Due</span>
          <span className="text-[26px] font-extrabold leading-[1.05] tracking-tight text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
            {money(balance)}
          </span>
        </div>
        <div className="w-px self-stretch bg-border" />
        <div className="flex flex-col gap-1" style={{ fontVariantNumeric: "tabular-nums" }}>
          <div className="flex min-w-[132px] items-center justify-between gap-4">
            <span className="text-[11.5px] text-zinc-500">Subtotal</span>
            <span className="text-[11.5px] font-semibold text-zinc-700">{money(total)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11.5px] text-zinc-500">Paid</span>
            <span className="text-[11.5px] font-semibold text-green">{money(job.paid || 0)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={openPay}
        className="flex min-w-[172px] flex-col items-center justify-center gap-0.5 px-6 text-white transition-colors"
        style={{ background: "#16a34a" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#15803d")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#16a34a")}
      >
        <div className="flex items-center gap-2">
          <CreditCard size={18} />
          <span className="text-base font-bold tracking-tight">Pay Now</span>
        </div>
      </button>

      <div className="relative flex items-stretch">
        {menuOpen && <div className="fixed inset-0 z-[5]" onClick={() => setMenuOpen(false)} />}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="relative z-[6] flex w-[52px] items-center justify-center bg-zinc-900 text-[#fafafa] hover:bg-[#2a2a2e]"
        >
          <MoreVertical size={17} />
        </button>
        {menuOpen && (
          <div className="absolute bottom-[60px] right-2 z-[7] min-w-[180px] rounded-[10px] border border-border bg-white p-[5px] shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
            <button className="flex h-9 w-full items-center gap-[9px] rounded-[7px] px-2.5 text-left text-[13px] font-medium text-zinc-900 hover:bg-app-bg">
              <Printer size={15} />
              Print receipt
            </button>
            <div className="my-1 h-px bg-app-bg mx-1.5" />
            <button
              onClick={() => deleteJob(job.id)}
              className="flex h-9 w-full items-center gap-[9px] rounded-[7px] px-2.5 text-left text-[13px] font-medium text-red hover:bg-[#fef2f2]"
            >
              <Trash2 size={15} />
              Delete Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
