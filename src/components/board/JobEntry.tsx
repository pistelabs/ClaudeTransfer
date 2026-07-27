import { CalendarDays, User } from "lucide-react";
import type { EquipRow } from "../../lib/boardSelectors";
import { ServicePill, StatusPill, cardTint } from "../Pills";
import { useAppStore } from "../../store/useAppStore";

interface Props {
  row: EquipRow;
  variant: "card" | "row";
}

export function JobEntry({ row, variant }: Props) {
  const openJob = useAppStore((s) => s.openJob);
  const setDragEq = useAppStore((s) => s.setDragEq);
  const clearDrag = () => useAppStore.getState().setDragEq(null);

  const onOpen = () => openJob(row.jobId, row.eqIdx);
  // Drag payload is this specific equipment item — dropping it only ever moves this one item,
  // never its siblings on the same job.
  const onDragStart = () => setDragEq({ jobId: row.jobId, eqIdx: row.eqIdx });
  const onDragEnd = () => clearDrag();

  if (variant === "row") {
    const late = row.status === "late";
    return (
      <div
        draggable
        onClick={onOpen}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className="flex cursor-pointer items-center gap-3 border-b border-app-bg px-[14px] py-[9px] transition-colors hover:bg-surface-50"
        style={{ background: late ? "#fef2f2" : "#ffffff" }}
      >
        <div className="flex w-[76px] flex-shrink-0 flex-col items-start gap-[3px]">
          <span className="text-xs font-semibold text-zinc-900">{row.rowId}</span>
          <StatusPill status={row.status} />
        </div>
        <div className="flex min-w-0 flex-[1.2] items-baseline gap-1.5">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold">{row.brand}</span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] text-zinc-500">{row.model}</span>
          <span className="flex-shrink-0 text-[11.5px] font-medium text-zinc-400">{row.size}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap content-center gap-1">
          {row.services.map((s) => (
            <ServicePill key={s} name={s} />
          ))}
        </div>
        <span className="w-[110px] flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-zinc-700">{row.customer}</span>
        <div className="flex w-[60px] flex-shrink-0 flex-col leading-[1.25]">
          <span className="text-xs font-medium text-zinc-900">{row.due}</span>
          <span className="text-[10.5px] text-zinc-400">{row.pickup}</span>
        </div>
      </div>
    );
  }

  const [bg, bd] = cardTint(row.status);
  return (
    <div
      draggable
      onClick={onOpen}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="flex cursor-grab flex-col gap-[7px] rounded-[10px] border p-[10px_11px] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.09)] hover:border-border-hover"
      style={{ background: bg, borderColor: bd, boxShadow: "0 1px 1px rgba(0,0,0,0.03)", padding: "10px 11px" }}
    >
      {row.hasDrop && (
        <div className="-mx-[11px] -mt-[10px] mb-[2px] flex items-center gap-1.5 rounded-t-[9px] border-b border-[#bbf7d0] bg-[#ecfdf5] px-[11px] py-[6px]">
          <CalendarDays size={12} color="#059669" strokeWidth={2} />
          <span className="text-[10.5px] font-bold tracking-wide text-[#047857]">Drop-off {row.dropDate}</span>
          <div className="flex-1" />
          <span className="text-[10.5px] font-bold text-[#047857]">{row.dropTime}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold text-zinc-900">{row.rowId}</span>
        <StatusPill status={row.status} />
        <div className="flex-1" />
        <span className="text-[11px] text-zinc-400">{row.due}</span>
      </div>
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold">{row.brand}</span>
        <span className="text-[11.5px] text-zinc-500">{row.model}</span>
        <span className="text-[11.5px] font-medium text-zinc-400">{row.size}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {row.services.map((s) => (
          <ServicePill key={s} name={s} />
        ))}
      </div>
      <div className="flex items-center gap-[5px] border-t border-app-bg pt-1.5">
        <User size={12} color="#a1a1aa" strokeWidth={2} />
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] text-zinc-700">{row.customer}</span>
      </div>
    </div>
  );
}
