import { ExternalLink, FileText } from "lucide-react";
import type { Job, WaiverKind } from "../../types";
import { requiresWaiver, WAIVER_LABEL } from "../../lib/waivers";

/** Liability paperwork for jobs that need it. The check-in waiver is captured when the job is
 * raised; the release waiver joins it once the equipment has been collected. */
export function WaiversPanel({ job }: { job: Job }) {
  if (!requiresWaiver(job)) return null;

  const order: WaiverKind[] = ["check_in", "release"];

  return (
    <div className="flex flex-col gap-[11px] rounded-[11px] border border-border bg-white p-4">
      <span className="text-[13.5px] font-semibold tracking-tight">Waivers</span>
      <div className="flex flex-col gap-1.5">
        {order.map((kind) => {
          const w = job.waivers.find((x) => x.kind === kind);
          if (!w) {
            return (
              <div
                key={kind}
                className="flex items-center gap-2.5 rounded-[9px] border border-dashed border-border px-3 py-2.5"
              >
                <FileText size={15} className="flex-shrink-0 text-zinc-350" />
                <span className="text-[12.5px] text-zinc-400">
                  {WAIVER_LABEL[kind]} — added once the equipment is collected
                </span>
              </div>
            );
          }
          return (
            <a
              key={kind}
              href={w.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 rounded-[9px] border border-border bg-surface-50 px-3 py-2.5 transition-colors hover:border-border-hover hover:bg-app-bg"
            >
              <div
                className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[6px]"
                style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
              >
                <FileText size={14} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="text-[12.5px] font-semibold text-zinc-900">{WAIVER_LABEL[kind]}</span>
                <span className="truncate text-[10.5px] text-zinc-400">
                  {w.fileName} · signed {w.signedAt} · {w.signedBy}
                </span>
              </div>
              <ExternalLink size={14} className="flex-shrink-0 text-zinc-400 group-hover:text-zinc-700" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
