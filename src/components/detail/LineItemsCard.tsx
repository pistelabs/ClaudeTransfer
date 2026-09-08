import { AlertTriangle, Check, Lock, MoreVertical, Plus } from "lucide-react";
import { useState } from "react";
import type { Job } from "../../types";
import { deriveLineItems } from "../../data/build";
import { useAppStore } from "../../store/useAppStore";
import { canPickStatus, isEquipmentLocked, lockCountdownMs, STATUS_FLOW } from "../../lib/statusFlow";
import { money } from "../../lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Props {
  job: Job;
  activeTab: number;
}

export function LineItemsCard({ job, activeTab }: Props) {
  const patchLoc = useAppStore((s) => s.setLoc);
  const toggleLineItemDone = useAppStore((s) => s.toggleLineItemDone);
  const setImgViewer = useAppStore((s) => s.setImgViewer);
  const setWorkStatus = useAppStore((s) => s.setWorkStatus);
  const openEditJob = useAppStore((s) => s.openEditJob);
  const progressMenuOpen = useAppStore((s) => s.progressMenuOpen);
  const toggleProgressMenu = useAppStore((s) => s.toggleProgressMenu);
  const closeProgressMenu = useAppStore((s) => s.closeProgressMenu);
  const now = useAppStore((s) => s.now);
  const isJobLocked = useAppStore((s) => s.isJobLocked);
  const [loc, setLocalLoc] = useState(job.equipment[activeTab]?.loc || "");

  const eq = job.equipment[activeTab];
  // Collected work is archived for good once its grace period runs out.
  const archived = isEquipmentLocked(eq, now);
  const countdown = lockCountdownMs(eq, now);
  const lineItems = deriveLineItems(eq);
  const total = lineItems.length;
  const done = lineItems.filter((li) => li.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="relative z-[1] flex flex-col gap-3.5 rounded-xl border bg-white p-4">
      {(archived || countdown != null) && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px]",
            archived ? "bg-muted text-zinc-600" : "border-emerald-200 bg-emerald-50 text-emerald-700",
          )}
        >
          {archived ? <Lock size={13} /> : <Check size={13} strokeWidth={3} />}
          <span className="font-semibold">{archived ? "Collected · archived" : "Collected"}</span>
          <span className="opacity-85">
            {archived
              ? "This equipment is locked — its status and services can no longer be changed."
              : `Locks in ${Math.ceil((countdown as number) / 1000)}s — undo now if this was a mistake.`}
          </span>
        </div>
      )}

      {/* Status bar — reflects this tab's own equipment, independent of its siblings */}
      <div className="bg-muted flex gap-0.5 rounded-lg border p-[3px]">
        {STATUS_FLOW.map((st) => {
          const active = eq.workStatus === st.label;
          // On hold, only the "resume work" options are selectable — services have to be
          // ticked off again before this item can go Ready/Collected.
          const locked = archived || (!active && !canPickStatus(eq.workStatus, st.label));
          return (
            <button
              key={st.label}
              onClick={() => setWorkStatus(job.id, activeTab, { label: st.label, stage: st.stage })}
              disabled={locked}
              title={
                archived
                  ? "This equipment has been collected and archived — its status can no longer be changed"
                  : locked
                    ? "Resolve the pending hold first — set this item back to Checked-in or In progress"
                    : undefined
              }
              className={cn(
                "flex h-[30px] flex-1 items-center justify-center rounded-md px-1 text-[11.5px] font-medium whitespace-nowrap transition-colors",
                active && "bg-background font-semibold shadow-sm",
                !active && !locked && "text-muted-foreground hover:text-foreground",
                locked && "text-muted-foreground/50 cursor-not-allowed",
              )}
              // The active step is tinted with its own stage colour, which is data.
              style={active ? { color: st.color } : undefined}
            >
              {st.label}
            </button>
          );
        })}
      </div>

      {/* Progress row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[12.5px] font-semibold text-zinc-500">Progress</span>
          <span className="text-[12.5px] font-semibold text-zinc-900">{done} of {total} Complete</span>
        </div>
        <div className="flex-1" />
        <div className="flex h-[34px] items-center gap-1.5 rounded-md border bg-white px-2.5">
          <span className="text-muted-foreground text-[11.5px]">Loc</span>
          <input
            value={loc}
            onChange={(e) => {
              setLocalLoc(e.target.value);
              patchLoc(job.id, activeTab, e.target.value);
            }}
            placeholder="—"
            disabled={archived}
            className="disabled:text-muted-foreground w-[52px] border-none bg-transparent text-[12.5px] font-semibold outline-none disabled:cursor-not-allowed"
          />
        </div>
        <DropdownMenu open={progressMenuOpen} onOpenChange={(o) => (o ? toggleProgressMenu() : closeProgressMenu())}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" title="More" className="text-muted-foreground size-[34px]">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem
              onSelect={() => openEditJob(job.id)}
              disabled={isJobLocked(job.id)}
              title={isJobLocked(job.id) ? "This job is archived and can no longer be edited" : undefined}
            >
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress bar */}
      <Progress
        value={pct}
        className={cn("h-1", pct === 100 && "[&>[data-slot=progress-indicator]]:bg-green-600")}
      />

      {/* Line items */}
      <div className="flex flex-col gap-2">
        {lineItems.map((li, idx) => (
          <div
            key={li.name + idx}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3.5 py-3",
              li.done ? "border-emerald-200 bg-emerald-50/40" : "bg-surface-50",
            )}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-bold uppercase tracking-wide text-zinc-900">{li.name}</span>
                <span className="text-[12.5px] font-semibold text-green">{money(li.price)}</span>
              </div>
              <div className="flex gap-7">
                <span className="text-xs text-zinc-500">
                  Angles: <span className="font-semibold text-zinc-700">{li.angles}</span>
                </span>
                <span className="text-xs text-zinc-500">
                  Structure: <span className="font-semibold text-zinc-700">{li.structure}</span>
                </span>
              </div>
              {li.photos.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {li.photos.map((url) => (
                    <img
                      key={url}
                      src={url}
                      onClick={() =>
                        setImgViewer({ url, title: "Damage photo", subtitle: `Check-in · ${li.name}` })
                      }
                      title="Open damage photo"
                      className="block h-11 w-11 cursor-zoom-in rounded-[7px] border border-border object-cover"
                    />
                  ))}
                  <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-[11px] text-amber-700">
                    <AlertTriangle />
                    Damage · {li.photos.length} photo{li.photos.length === 1 ? "" : "s"}
                  </Badge>
                </div>
              )}
            </div>
            <button
              onClick={() => toggleLineItemDone(job.id, activeTab, idx)}
              disabled={archived}
              title={archived ? "Archived — services can no longer be changed" : li.done ? "Mark incomplete" : "Mark complete"}
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                li.done
                  ? "border-green-600 bg-green-600 text-white"
                  : "text-muted-foreground/60 border-2 border-zinc-300 bg-white",
                archived && "cursor-not-allowed opacity-75",
              )}
            >
              <Check size={19} strokeWidth={3} />
            </button>
          </div>
        ))}
        {total === 0 && (
          <div className="flex flex-col items-center gap-2.5 rounded-lg border border-dashed py-5">
            <span className="text-muted-foreground text-xs">No services added at drop-off</span>
            <Button size="sm" onClick={() => openEditJob(job.id)}>
              <Plus strokeWidth={2.4} />
              Add services
            </Button>
          </div>
        )}
      </div>

      {/* Collection + Notes */}
      <div className="border-app-bg flex gap-2.5 border-t pt-3">
        <div className="flex w-[150px] shrink-0 flex-col gap-[3px]">
          <span className="text-xs font-semibold">Collection</span>
          <div className="flex gap-3.5">
            <div className="flex flex-col leading-tight">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Due</span>
              <span
                className={cn("text-[12.5px] font-semibold", job.status === "late" && "text-destructive")}
              >
                {job.due}
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Pickup</span>
              <span className="text-[12.5px] font-semibold">{job.pickup}</span>
            </div>
          </div>
        </div>
        <Separator orientation="vertical" />
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="text-xs font-semibold">Notes</span>
          <span className={cn("text-[12.5px] leading-relaxed", job.notes ? "text-zinc-700" : "text-muted-foreground")}>
            {job.notes || "No notes"}
          </span>
        </div>
      </div>
    </div>
  );
}
