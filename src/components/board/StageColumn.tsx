import { ChevronLeft } from "lucide-react";
import { GripVertical } from "lucide-react";
import type { DragEvent } from "react";
import { useAppStore } from "../../store/useAppStore";
import type { Stage } from "../../types";
import { filterJobs, jobToRows, sortByDropoff, sortByDue } from "../../lib/boardSelectors";
import { JobEntry } from "./JobEntry";
import { hexA } from "../../lib/format";

interface Props {
  stageKey: Stage;
  label: string;
  dot: string;
}

export function StageColumn({ stageKey, label, dot }: Props) {
  const jobs = useAppStore((s) => s.jobs);
  const query = useAppStore((s) => s.query);
  const filterCats = useAppStore((s) => s.filterCats);
  const boardOrder = useAppStore((s) => s.boardOrder);
  const colWidths = useAppStore((s) => s.colWidths);
  const collapsedCols = useAppStore((s) => s.collapsedCols);
  const colDragKey = useAppStore((s) => s.colDragKey);
  const overCol = useAppStore((s) => s.overCol);
  const dragEq = useAppStore((s) => s.dragEq);

  const setColDragKey = useAppStore((s) => s.setColDragKey);
  const reorderCols = useAppStore((s) => s.reorderCols);
  const startColResize = useAppStore((s) => s.startColResize);
  const toggleCollapse = useAppStore((s) => s.toggleCollapse);
  const setOverCol = useAppStore((s) => s.setOverCol);
  const dropJob = useAppStore((s) => s.dropJob);

  const width = colWidths[stageKey] ?? 268;
  const collapsed = collapsedCols.includes(stageKey);
  const isColDrag = colDragKey === stageKey;
  const isOver = overCol === stageKey;
  const order = boardOrder.indexOf(stageKey);

  // Each row (one per equipment item) is placed by its OWN stage, independently of its siblings.
  let rows = filterJobs(jobs, query, filterCats).flatMap(jobToRows).filter((r) => r.stage === stageKey);
  rows = stageKey === "kiosk" ? sortByDropoff(rows) : sortByDue(rows);
  const wide = !collapsed && width >= 420;

  const handleReorderDragOver = (e: DragEvent) => {
    if (colDragKey && colDragKey !== stageKey) {
      e.preventDefault();
      reorderCols(colDragKey, stageKey);
    }
  };

  if (collapsed) {
    return (
      <section
        style={{ order, width: 52, flexShrink: 0, opacity: isColDrag ? 0.4 : 1, borderTop: `3px solid ${dot}` }}
        className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        onDragOver={handleReorderDragOver}
      >
        <div
          onClick={() => toggleCollapse(stageKey)}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragEq) dropJob(dragEq.jobId, dragEq.eqIdx, stageKey);
          }}
          title="Expand"
          className="flex flex-1 cursor-pointer flex-col items-center gap-2.5 py-3"
        >
          <span className="h-2 w-2 flex-shrink-0 rounded-[3px]" style={{ background: dot }} />
          <span className="rounded-full bg-app-bg px-[7px] py-px text-[11px] font-semibold text-zinc-500">{rows.length}</span>
          <span
            className="whitespace-nowrap text-xs font-semibold tracking-wide text-zinc-700"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {label}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        order,
        width,
        flexShrink: 0,
        opacity: isColDrag ? 0.4 : 1,
        borderColor: isOver ? dot : "#e4e4e7",
        borderTopColor: dot,
        borderTopWidth: 3,
        boxShadow: isOver ? `0 0 0 3px ${hexA(dot, 0.12)}` : "0 1px 2px rgba(0,0,0,0.04)",
      }}
      className="relative flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow"
      onDragOver={handleReorderDragOver}
    >
      <div
        draggable
        onDragStart={() => setColDragKey(stageKey)}
        onDragEnd={() => setColDragKey(null)}
        className="flex h-11 flex-shrink-0 cursor-grab items-center gap-[9px] border-b border-app-bg pl-3 pr-2"
      >
        <GripVertical size={13} color="#c4c4c8" />
        <span className="h-2 w-2 flex-shrink-0 rounded-[3px]" style={{ background: dot }} />
        <span className="text-[12.5px] font-semibold leading-[1.15] tracking-tight">{label}</span>
        <span className="rounded-full bg-app-bg px-2 py-px text-[11px] font-semibold leading-[1.6] text-zinc-500">{rows.length}</span>
        <div className="flex-1" />
        <button
          onClick={() => toggleCollapse(stageKey)}
          title="Collapse"
          className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[7px] text-zinc-400 hover:bg-app-bg hover:text-zinc-900"
        >
          <ChevronLeft size={15} />
        </button>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (colDragKey) return;
          if (overCol !== stageKey) setOverCol(stageKey);
        }}
        onDragEnter={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setOverCol(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (dragEq) dropJob(dragEq.jobId, dragEq.eqIdx, stageKey);
        }}
        style={{ background: isOver ? hexA(dot, 0.04) : "transparent" }}
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-[10px] transition-colors"
      >
        {rows.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-[10px] border border-dashed border-border text-[11.5px] text-zinc-350">
            Drop jobs here
          </div>
        )}
        {rows.map((row) => (
          <JobEntry key={row.rowId} row={row} variant={wide ? "row" : "card"} />
        ))}
      </div>
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startColResize(stageKey, e.clientX, width);
        }}
        className="absolute right-0 top-0 z-[8] h-full w-[7px] cursor-col-resize"
      />
    </section>
  );
}
