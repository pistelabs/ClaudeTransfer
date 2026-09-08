import { ExternalLink, FileText } from "lucide-react";
import type { Job, WaiverKind } from "../../types";
import { requiresWaiver, WAIVER_LABEL } from "../../lib/waivers";

/** Liability paperwork for jobs that need it. The check-in waiver is captured when the job is
 * raised; the release waiver joins it once the equipment has been collected. */
export function WaiversPanel({ job }: { job: Job }) {
  if (!requiresWaiver(job)) return null;

  const order: WaiverKind[] = ["check_in", "release"];

  return (
    <div className="flex flex-col gap-[11px] rounded-xl border bg-white p-4">
      <span className="text-[13.5px] font-semibold tracking-tight">Waivers</span>
      <div className="flex flex-col gap-1.5">
        {order.map((kind) => {
          const w = job.waivers.find((x) => x.kind === kind);
          if (!w) {
            return (
              <div
                key={kind}
                className="flex items-center gap-2.5 rounded-lg border border-dashed px-3 py-2.5"
              >
                <FileText size={15} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-[12.5px]">
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
              className="group bg-surface-50 hover:border-border-hover hover:bg-accent flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors"
            >
              <div className="flex size-[26px] shrink-0 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600">
                <FileText size={14} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="text-[12.5px] font-semibold">{WAIVER_LABEL[kind]}</span>
                <span className="text-muted-foreground truncate text-[10.5px]">
                  {w.fileName} · signed {w.signedAt} · {w.signedBy}
                </span>
              </div>
              <ExternalLink size={14} className="text-muted-foreground group-hover:text-foreground shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
