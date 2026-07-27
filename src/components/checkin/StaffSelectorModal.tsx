import { ChevronRight } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Avatar } from "../Pills";

export function StaffSelectorModal() {
  const staffPrompt = useAppStore((s) => s.staffPrompt);
  const editId = useAppStore((s) => s.editId);
  const staffList = useAppStore((s) => s.staffList);
  const setStaff = useAppStore((s) => s.setStaff);

  if (!staffPrompt) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(3px)" }}
    >
      <div
        className="flex w-[400px] max-w-full flex-col gap-4 rounded-2xl border border-border bg-white p-6"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.22)" }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-[17px] font-bold tracking-tight text-ink">{editId ? "Who's editing?" : "Who's checking in?"}</span>
          <span className="text-[13px] leading-relaxed text-zinc-500">Select your name to attach it to this job.</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {staffList.map((name) => (
            <button
              key={name}
              onClick={() => setStaff(name)}
              className="flex w-full items-center gap-3 rounded-[11px] border border-border bg-white p-2.5 text-left hover:border-border-hover hover:bg-app-bg"
            >
              <Avatar name={name} />
              <span className="flex-1 text-sm font-semibold text-zinc-900">{name}</span>
              <ChevronRight size={16} color="#c4c4c8" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
