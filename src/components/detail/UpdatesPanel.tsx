import type { Job } from "../../types";
import { useAppStore } from "../../store/useAppStore";

export function UpdatesPanel({ job }: { job: Job }) {
  const draft = useAppStore((s) => s.draft);
  const setDraft = useAppStore((s) => s.setDraft);
  const addUpdate = useAppStore((s) => s.addUpdate);

  const canAdd = draft.trim().length > 0;

  return (
    <div className="flex flex-col gap-[11px] rounded-[11px] border border-border bg-white p-4">
      <span className="text-[13.5px] font-semibold tracking-tight">Updates &amp; Notes</span>
      {job.updates.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {job.updates.map((u, i) => (
            <div
              key={i}
              className="flex gap-2.5 rounded-[9px] border p-[9px_11px]"
              style={{ background: u.hold ? "#fffbeb" : "#fafafa", borderColor: u.hold ? "#fde68a" : "#f0f0f1" }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] leading-relaxed text-zinc-800">{u.text}</div>
                <div className="mt-[3px] text-[10.5px] text-zinc-400">{u.at}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add update or note..."
        className="min-h-[74px] w-full resize-y rounded-[9px] border border-border bg-white px-3 py-2.5 text-[13px] leading-relaxed text-ink outline-none focus:border-zinc-400 focus:shadow-[0_0_0_3px_rgba(161,161,170,0.15)]"
      />
      <button
        onClick={addUpdate}
        disabled={!canAdd}
        className="h-[34px] self-start rounded-lg border px-4 text-[12.5px] font-semibold"
        style={{
          borderColor: canAdd ? "#18181b" : "#e4e4e7",
          color: canAdd ? "#fafafa" : "#a1a1aa",
          background: canAdd ? "#18181b" : "#f4f4f5",
          cursor: canAdd ? "pointer" : "default",
        }}
      >
        Add Update
      </button>
    </div>
  );
}
