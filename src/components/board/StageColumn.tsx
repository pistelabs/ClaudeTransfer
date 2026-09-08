import { ChevronLeft } from "lucide-react";
import { GripVertical } from "lucide-react";
import type { DragEvent } from "react";
import { useAppStore } from "../../store/useAppStore";
import type { Stage } from "../../types";
import { filterJobs, jobToRows, sortByDropoff, sortByDue } from "../../lib/boardSelectors";
import { JobEntry } from "./JobEntry";
import { hexA } from "../../lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
      <Card
        style={{ order, width: 52, opacity: isColDrag ? 0.4 : 1, borderTopWidth: 3, borderTopColor: dot }}
        className="relative shrink-0 gap-0 overflow-hidden py-0"
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
          <span className="size-2 shrink-0 rounded-[3px]" style={{ background: dot }} />
          <Badge variant="secondary" className="rounded-full px-[7px] tabular-nums">
            {rows.length}
          </Badge>
          <span
            className="text-xs font-semibold tracking-wide whitespace-nowrap text-zinc-700"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {label}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{
        order,
        width,
        opacity: isColDrag ? 0.4 : 1,
        // Stage colour is data, so the top edge and the drag-over highlight stay inline.
        // All four sides use longhand: mixing `borderColor` with `borderTopColor` makes React
        // warn about shorthand/longhand conflicts on re-render.
        borderTopColor: dot,
        borderRightColor: isOver ? dot : undefined,
        borderBottomColor: isOver ? dot : undefined,
        borderLeftColor: isOver ? dot : undefined,
        borderTopWidth: 3,
        boxShadow: isOver ? `0 0 0 3px ${hexA(dot, 0.12)}` : undefined,
      }}
      className="relative shrink-0 gap-0 overflow-hidden py-0 transition-shadow"
      onDragOver={handleReorderDragOver}
    >
      <div
        draggable
        onDragStart={() => setColDragKey(stageKey)}
        onDragEnd={() => setColDragKey(null)}
        className="border-app-bg flex h-11 shrink-0 cursor-grab items-center gap-[9px] border-b pr-2 pl-3"
      >
        <GripVertical size={13} className="text-muted-foreground" />
        <span className="size-2 shrink-0 rounded-[3px]" style={{ background: dot }} />
        <span className="text-[12.5px] leading-[1.15] font-semibold tracking-tight">{label}</span>
        <Badge variant="secondary" className="rounded-full tabular-nums">
          {rows.length}
        </Badge>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleCollapse(stageKey)}
          title="Collapse"
          className="text-muted-foreground size-[26px] shrink-0"
        >
          <ChevronLeft />
        </Button>
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
          <div className="text-muted-foreground flex h-20 items-center justify-center rounded-[10px] border border-dashed text-[11.5px]">
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
        className="absolute top-0 right-0 z-[8] h-full w-[7px] cursor-col-resize"
      />
    </Card>
  );
}
