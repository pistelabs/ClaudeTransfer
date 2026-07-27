import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function DueDatePicker() {
  const nf = useAppStore((s) => s.nf);
  const patchNf = useAppStore((s) => s.patchNf);
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [calY, setCalY] = useState(now.getFullYear());
  const [calM, setCalM] = useState(now.getMonth());

  const dueDisplay = nf.due ? nf.due : "Select date";

  const first = new Date(calY, calM, 1);
  const startDow = (first.getDay() + 6) % 7;
  const dim = new Date(calY, calM + 1, 0).getDate();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const atCurrentMonth = calY === now.getFullYear() && calM === now.getMonth();

  const cells: { key: string; empty?: boolean; day?: number }[] = [];
  for (let i = 0; i < startDow; i++) cells.push({ key: "e" + i, empty: true });
  for (let d = 1; d <= dim; d++) cells.push({ key: "d" + d, day: d });

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-[5]" onClick={() => setOpen(false)} />}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative z-[6] flex h-[38px] w-full items-center gap-2 rounded-[9px] border border-border bg-white px-3 text-[13px] font-medium hover:border-border-hover"
        style={{ color: nf.due ? "#09090b" : "#a1a1aa" }}
      >
        <CalendarDays size={15} color="#71717a" />
        <span>{dueDisplay}</span>
      </button>
      {open && (
        <div
          className="absolute bottom-[42px] left-0 z-[9] w-[252px] rounded-[11px] border border-border bg-white p-3"
          style={{ maxHeight: "70vh", overflowY: "auto", boxShadow: "0 12px 32px rgba(0,0,0,0.16)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              onClick={() => {
                if (atCurrentMonth) return;
                let m = calM - 1;
                let y = calY;
                if (m < 0) {
                  m = 11;
                  y--;
                }
                setCalM(m);
                setCalY(y);
              }}
              disabled={atCurrentMonth}
              className="flex h-7 w-7 items-center justify-center rounded-[7px] text-zinc-500 hover:bg-app-bg disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[12.5px] font-bold text-zinc-900">
              {MONTH_NAMES[calM]} {calY}
            </span>
            <button
              onClick={() => {
                let m = calM + 1;
                let y = calY;
                if (m > 11) {
                  m = 0;
                  y++;
                }
                setCalM(m);
                setCalY(y);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-[7px] text-zinc-500 hover:bg-app-bg"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <span key={d} className="text-center text-[10px] font-semibold text-zinc-400">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell) => {
              if (cell.empty) return <div key={cell.key} />;
              const d = cell.day!;
              const dd = String(d).padStart(2, "0");
              const mm = String(calM + 1).padStart(2, "0");
              const label = `${dd}/${mm}`;
              const isToday = now.getFullYear() === calY && now.getMonth() === calM && now.getDate() === d;
              const selected = nf.due === label;
              const past = new Date(calY, calM, d) < todayMid;
              return (
                <div
                  key={cell.key}
                  onClick={() => {
                    if (past) return;
                    patchNf({ due: label });
                    setOpen(false);
                  }}
                  className="flex h-8 items-center justify-center rounded-[7px] text-[12.5px]"
                  style={{
                    fontWeight: selected ? 700 : 500,
                    cursor: past ? "not-allowed" : "pointer",
                    color: past ? "#d4d4d8" : selected ? "#ffffff" : "#18181b",
                    background: selected ? "#0284c7" : "transparent",
                    border: isToday && !selected ? "1px solid #bfdbfe" : "1px solid transparent",
                    textDecoration: past ? "line-through" : "none",
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
