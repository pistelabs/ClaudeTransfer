import { CalendarDays, PauseCircle, User } from "lucide-react";
import type { EquipRow } from "../../lib/boardSelectors";
import { ServicePill, StatusPill, cardTint } from "../Pills";
import { useAppStore } from "../../store/useAppStore";
import { isEquipmentLocked } from "../../lib/statusFlow";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  row: EquipRow;
  variant: "card" | "row";
}

export function JobEntry({ row, variant }: Props) {
  const openJob = useAppStore((s) => s.openJob);
  const setDragEq = useAppStore((s) => s.setDragEq);
  const clearDrag = () => useAppStore.getState().setDragEq(null);

  const now = useAppStore((s) => s.now);
  // Archived (collected + past its grace period) equipment can't be dragged anywhere.
  const archived = isEquipmentLocked(row.job.equipment[row.eqIdx] ?? {}, now);

  const onOpen = () => openJob(row.jobId, row.eqIdx);
  // Drag payload is this specific equipment item — dropping it only ever moves this one item,
  // never its siblings on the same job.
  const onDragStart = () => setDragEq({ jobId: row.jobId, eqIdx: row.eqIdx });
  const onDragEnd = () => clearDrag();

  if (variant === "row") {
    const late = row.status === "late";
    return (
      <div
        draggable={!archived}
        onClick={onOpen}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={cn(
          "border-app-bg hover:bg-surface-50 flex cursor-pointer items-center gap-3 border-b px-3.5 py-2 transition-colors",
          late ? "bg-red-50" : "bg-white",
        )}
      >
        <div className="flex w-[90px] shrink-0 flex-col items-start gap-[3px]">
          <span className="text-xs font-semibold">{row.rowId}</span>
          <StatusPill status={row.status} />
        </div>
        <div className="flex min-w-0 flex-[1.2] items-baseline gap-1.5">
          <span className="overflow-hidden text-[12.5px] font-semibold text-ellipsis whitespace-nowrap">
            {row.brand}
          </span>
          <span className="text-muted-foreground overflow-hidden text-[11.5px] text-ellipsis whitespace-nowrap">
            {row.model}
          </span>
          <span className="text-muted-foreground shrink-0 text-[11.5px] font-medium">{row.size}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap content-center gap-1">
          {row.services.map((s) => (
            <ServicePill key={s} name={s} />
          ))}
        </div>
        <span className="w-[110px] shrink-0 overflow-hidden text-xs text-ellipsis whitespace-nowrap text-zinc-700">
          {row.customer}
        </span>
        <div className="flex w-[60px] shrink-0 flex-col leading-[1.25]">
          <span className="text-xs font-medium">{row.due}</span>
          <span className="text-muted-foreground text-[10.5px]">{row.pickup}</span>
        </div>
      </div>
    );
  }

  const [bg, bd] = cardTint(row.status);
  return (
    <Card
      draggable={!archived}
      onClick={onOpen}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="hover:border-border-hover cursor-grab gap-[7px] rounded-[10px] px-[11px] py-2.5 transition-shadow hover:shadow-md"
      // Tint and border carry the job's overdue/complete status, so they stay data-driven.
      style={{ background: bg, borderColor: bd }}
    >
      {row.holdReason && (
        <div className="-mx-[11px] -mt-2.5 mb-[2px] flex items-center gap-1.5 overflow-hidden rounded-t-[9px] border-b border-amber-200 bg-amber-50 px-[11px] py-1.5">
          <PauseCircle size={12} strokeWidth={2} className="shrink-0 text-amber-600" />
          <span className="shrink-0 text-[10.5px] font-bold tracking-wide text-amber-700">On hold</span>
          {/* one line only — a long reason truncates rather than growing the banner */}
          <span
            className="min-w-0 flex-1 overflow-hidden text-[10.5px] text-ellipsis whitespace-nowrap text-amber-700"
            title={row.holdReason}
          >
            {row.holdReason}
          </span>
        </div>
      )}
      {row.hasDrop && (
        <div className="-mx-[11px] -mt-2.5 mb-[2px] flex items-center gap-1.5 rounded-t-[9px] border-b border-emerald-200 bg-emerald-50 px-[11px] py-1.5">
          <CalendarDays size={12} strokeWidth={2} className="text-emerald-600" />
          <span className="text-[10.5px] font-bold tracking-wide text-emerald-700">Drop-off {row.dropDate}</span>
          <div className="flex-1" />
          <span className="text-[10.5px] font-bold text-emerald-700">{row.dropTime}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold">{row.rowId}</span>
        <StatusPill status={row.status} />
        <div className="flex-1" />
        <span className="text-muted-foreground text-[11px]">{row.due}</span>
      </div>
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="overflow-hidden text-[13px] font-semibold text-ellipsis whitespace-nowrap">{row.brand}</span>
        <span className="text-muted-foreground text-[11.5px]">{row.model}</span>
        <span className="text-muted-foreground text-[11.5px] font-medium">{row.size}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {row.services.map((s) => (
          <ServicePill key={s} name={s} />
        ))}
      </div>
      <div className="border-app-bg flex items-center gap-[5px] border-t pt-1.5">
        <User size={12} strokeWidth={2} className="text-muted-foreground" />
        <span className="overflow-hidden text-[11.5px] text-ellipsis whitespace-nowrap text-zinc-700">
          {row.customer}
        </span>
      </div>
    </Card>
  );
}
