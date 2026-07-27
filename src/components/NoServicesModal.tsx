import { AlertTriangle, Plus } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export function NoServicesModal() {
  const noSvcPrompt = useAppStore((s) => s.noSvcPrompt);
  const jobs = useAppStore((s) => s.jobs);
  const closeNoSvc = useAppStore((s) => s.closeNoSvc);
  const noSvcAddServices = useAppStore((s) => s.noSvcAddServices);

  if (!noSvcPrompt) return null;
  const job = jobs.find((j) => j.id === noSvcPrompt.jobId);
  const rowLabel = job && job.equipment.length > 1 ? `${job.id}-${noSvcPrompt.eqIdx + 1}` : noSvcPrompt.jobId;

  return (
    <div
      onClick={closeNoSvc}
      className="fixed inset-0 z-[70] flex items-center justify-center p-6"
      style={{ background: "rgba(9,9,11,0.45)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[392px] flex-col gap-3.5 rounded-[13px] border border-border bg-white p-5"
        style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#ea580c" }}>
            <AlertTriangle size={20} />
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-[15px] font-bold tracking-tight">No services added</span>
            <span className="text-xs text-zinc-500">{rowLabel} can't be moved yet</span>
          </div>
        </div>
        <p className="m-0 text-[13px] leading-relaxed text-zinc-700">
          This equipment has no services added yet. Add services before moving it out of Drop offs Booked.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={closeNoSvc} className="h-10 rounded-[9px] border border-border bg-white px-4 text-[13px] font-medium text-zinc-900 hover:bg-app-bg">
            Cancel
          </button>
          <button
            onClick={noSvcAddServices}
            className="flex h-10 items-center gap-[7px] rounded-[9px] bg-sky px-4 text-[13px] font-semibold text-white hover:bg-sky-hover"
          >
            <Plus size={14} strokeWidth={2.4} />
            Add services
          </button>
        </div>
      </div>
    </div>
  );
}
