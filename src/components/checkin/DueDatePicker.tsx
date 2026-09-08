import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

  const first = new Date(calY, calM, 1);
  const startDow = (first.getDay() + 6) % 7;
  const dim = new Date(calY, calM + 1, 0).getDate();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const atCurrentMonth = calY === now.getFullYear() && calM === now.getMonth();

  const cells: { key: string; empty?: boolean; day?: number }[] = [];
  for (let i = 0; i < startDow; i++) cells.push({ key: "e" + i, empty: true });
  for (let d = 1; d <= dim; d++) cells.push({ key: "d" + d, day: d });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start font-medium", !nf.due && "text-muted-foreground")}
        >
          <CalendarDays className="text-muted-foreground" />
          {nf.due || "Select date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-[252px] p-3">
        <div className="mb-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
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
          >
            <ChevronLeft />
          </Button>
          <span className="text-[12.5px] font-bold">
            {MONTH_NAMES[calM]} {calY}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
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
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-0.5">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <span key={d} className="text-muted-foreground text-center text-[10px] font-semibold">
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
              <button
                key={cell.key}
                disabled={past}
                onClick={() => {
                  patchNf({ due: label });
                  setOpen(false);
                }}
                className={cn(
                  "flex h-8 items-center justify-center rounded-md border border-transparent text-[12.5px] font-medium",
                  past && "text-muted-foreground/50 cursor-not-allowed line-through",
                  !past && !selected && "hover:bg-accent",
                  selected && "bg-primary text-primary-foreground font-bold",
                  isToday && !selected && "border-sky-200",
                )}
              >
                {d}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
