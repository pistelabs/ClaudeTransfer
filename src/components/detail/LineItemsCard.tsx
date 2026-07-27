import { AlertTriangle, Check, MoreVertical, Plus } from "lucide-react";
import { useState } from "react";
import type { Job } from "../../types";
import { deriveLineItems } from "../../data/build";
import { useAppStore } from "../../store/useAppStore";
import { canPickStatus, STATUS_FLOW } from "../../lib/statusFlow";
import { money } from "../../lib/format";

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
  const [loc, setLocalLoc] = useState(job.equipment[activeTab]?.loc || "");

  const eq = job.equipment[activeTab];
  const lineItems = deriveLineItems(eq);
  const total = lineItems.length;
  const done = lineItems.filter((li) => li.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div
      className="relative z-[1] flex flex-col gap-3.5 border border-border bg-white p-4"
      style={{ borderRadius: activeTab === 0 ? "0 11px 11px 11px" : "11px" }}
    >
      {/* Status bar — reflects this tab's own equipment, independent of its siblings */}
      <div className="flex gap-0.5 rounded-[9px] border border-border bg-app-bg p-[3px]">
        {STATUS_FLOW.map((st) => {
          const active = eq.workStatus === st.label;
          // On hold, only the "resume work" options are selectable — services have to be
          // ticked off again before this item can go Ready/Collected.
          const locked = !active && !canPickStatus(eq.workStatus, st.label);
          return (
            <button
              key={st.label}
              onClick={() => setWorkStatus(job.id, activeTab, { label: st.label, stage: st.stage })}
              disabled={locked}
              title={locked ? "Resolve the pending hold first — set this item back to Checked-in or In progress" : undefined}
              className="flex h-[30px] flex-1 items-center justify-center whitespace-nowrap rounded-[7px] px-1 text-[11.5px] transition-colors"
              style={{
                fontWeight: active ? 600 : 500,
                color: active ? st.color : locked ? "#c4c4c8" : "#71717a",
                background: active ? "#ffffff" : "transparent",
                boxShadow: active ? "0 1px 2px rgba(0,0,0,0.09)" : "none",
                cursor: locked ? "not-allowed" : "pointer",
              }}
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
        <div className="flex h-[34px] items-center gap-1.5 rounded-lg border border-border bg-white px-2.5">
          <span className="text-[11.5px] text-zinc-400">Loc</span>
          <input
            value={loc}
            onChange={(e) => {
              setLocalLoc(e.target.value);
              patchLoc(job.id, activeTab, e.target.value);
            }}
            placeholder="—"
            className="w-[52px] border-none bg-transparent text-[12.5px] font-semibold text-zinc-900 outline-none"
          />
        </div>
        <div className="relative">
          {progressMenuOpen && <div className="fixed inset-0 z-[5]" onClick={closeProgressMenu} />}
          <button
            onClick={toggleProgressMenu}
            title="More"
            className="relative z-[6] flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border bg-white text-zinc-500 hover:bg-app-bg hover:text-zinc-900"
          >
            <MoreVertical size={16} />
          </button>
          {progressMenuOpen && (
            <div className="absolute right-0 top-[38px] z-[7] min-w-[140px] rounded-[10px] border border-border bg-white p-[5px] shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
              <button
                onClick={() => openEditJob(job.id)}
                className="flex h-9 w-full items-center gap-[9px] rounded-[7px] px-2.5 text-left text-[13px] font-medium text-zinc-900 hover:bg-app-bg"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 overflow-hidden rounded-full bg-app-bg">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${pct}%`, background: pct === 100 ? "#16a34a" : "#18181b" }}
        />
      </div>

      {/* Line items */}
      <div className="flex flex-col gap-2">
        {lineItems.map((li, idx) => (
          <div
            key={li.name + idx}
            className="flex items-center gap-3 rounded-[10px] border p-[12px_14px]"
            style={{ background: li.done ? "#f6fef9" : "#fafafa", borderColor: li.done ? "#bbf7d0" : "#f0f0f1" }}
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
                  <span className="inline-flex items-center gap-1 rounded-[6px] border border-[#fde68a] bg-[#fffbeb] px-2 py-0.5 text-[11px] font-semibold text-[#b45309]">
                    <AlertTriangle size={12} />
                    Damage · {li.photos.length} photo{li.photos.length === 1 ? "" : "s"}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => toggleLineItemDone(job.id, activeTab, idx)}
              title={li.done ? "Mark incomplete" : "Mark complete"}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors"
              style={{
                color: li.done ? "#ffffff" : "#c4c4c8",
                background: li.done ? "#16a34a" : "#ffffff",
                border: li.done ? "1px solid #16a34a" : "2px solid #d4d4d8",
              }}
            >
              <Check size={19} strokeWidth={3} />
            </button>
          </div>
        ))}
        {total === 0 && (
          <div className="flex flex-col items-center gap-2.5 rounded-[10px] border border-dashed border-border py-5">
            <span className="text-xs text-zinc-400">No services added at drop-off</span>
            <button
              onClick={() => openEditJob(job.id)}
              className="flex h-[34px] items-center gap-[7px] rounded-lg bg-sky px-3.5 text-[12.5px] font-semibold text-white hover:bg-sky-hover"
            >
              <Plus size={14} strokeWidth={2.4} />
              Add services
            </button>
          </div>
        )}
      </div>

      {/* Collection + Notes */}
      <div className="flex gap-2.5 border-t border-app-bg pt-3">
        <div className="flex w-[150px] flex-shrink-0 flex-col gap-[3px]">
          <span className="text-xs font-semibold text-zinc-900">Collection</span>
          <div className="flex gap-3.5">
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Due</span>
              <span className="text-[12.5px] font-semibold" style={{ color: job.status === "late" ? "#dc2626" : "#18181b" }}>
                {job.due}
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Pickup</span>
              <span className="text-[12.5px] font-semibold text-zinc-900">{job.pickup}</span>
            </div>
          </div>
        </div>
        <div className="w-px bg-app-bg" />
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="text-xs font-semibold text-zinc-900">Notes</span>
          <span className="text-[12.5px] leading-relaxed" style={{ color: job.notes ? "#3f3f46" : "#a1a1aa" }}>
            {job.notes || "No notes"}
          </span>
        </div>
      </div>
    </div>
  );
}
