import { GripVertical } from "lucide-react";
import type { DragEvent } from "react";
import { useAppStore } from "../../store/useAppStore";
import { filterJobs, jobToRows, sortByDue } from "../../lib/boardSelectors";
import { JobEntry } from "./JobEntry";
import { hexA } from "../../lib/format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function CheckedInEquipmentPanel() {
  const jobs = useAppStore((s) => s.jobs);
  const query = useAppStore((s) => s.query);
  const filterCats = useAppStore((s) => s.filterCats);
  const boardOrder = useAppStore((s) => s.boardOrder);
  const colWidths = useAppStore((s) => s.colWidths);
  const colDragKey = useAppStore((s) => s.colDragKey);
  const setColDragKey = useAppStore((s) => s.setColDragKey);
  const reorderCols = useAppStore((s) => s.reorderCols);
  const startColResize = useAppStore((s) => s.startColResize);
  const dragEq = useAppStore((s) => s.dragEq);
  const overCol = useAppStore((s) => s.overCol);
  const setOverCol = useAppStore((s) => s.setOverCol);
  const setWorkStatus = useAppStore((s) => s.setWorkStatus);

  const width = colWidths["table"] ?? 620;
  const wide = width >= 420;
  const order = boardOrder.indexOf("table");
  const isOver = overCol === "table";

  // This panel is the home of the `checked_in` stage — equipment physically in the shop but
  // not started yet. Items move out of here as they progress (In Progress / Pending / etc).
  const rows = sortByDue(
    filterJobs(jobs, query, filterCats)
      .flatMap(jobToRows)
      .filter((r) => r.stage === "checked_in"),
  );

  const onBodyDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (colDragKey) return;
    if (overCol !== "table") setOverCol("table");
  };
  const onBodyDragLeave = (e: DragEvent) => {
    if (e.currentTarget === e.target) setOverCol(null);
  };
  const onBodyDrop = (e: DragEvent) => {
    e.preventDefault();
    if (dragEq) setWorkStatus(dragEq.jobId, dragEq.eqIdx, { label: "Checked-in", stage: "checked_in" });
    setOverCol(null);
  };

  return (
    <Card
      style={{
        order,
        width,
        borderTopWidth: 3,
        // Longhand on every side — see the note in StageColumn.
        borderTopColor: "#2563eb",
        borderRightColor: isOver ? "#2563eb" : undefined,
        borderBottomColor: isOver ? "#2563eb" : undefined,
        borderLeftColor: isOver ? "#2563eb" : undefined,
        boxShadow: isOver ? `0 0 0 3px ${hexA("#2563eb", 0.12)}` : undefined,
      }}
      className="relative shrink-0 gap-0 overflow-hidden py-0 transition-shadow"
      onDragOver={(e) => {
        if (colDragKey && colDragKey !== "table") {
          e.preventDefault();
          reorderCols(colDragKey, "table");
        }
      }}
    >
      <div
        draggable
        onDragStart={() => setColDragKey("table")}
        onDragEnd={() => setColDragKey(null)}
        className="border-app-bg flex h-11 shrink-0 cursor-grab items-center gap-[9px] border-b pr-2 pl-3"
      >
        <GripVertical size={13} className="text-muted-foreground" />
        <span className="size-2 shrink-0 rounded-[3px]" style={{ background: "#2563eb" }} />
        <span className="text-[12.5px] leading-[1.15] font-semibold tracking-tight">Checked in Equipment</span>
        <Badge variant="secondary" className="rounded-full tabular-nums">
          {rows.length}
        </Badge>
        <div className="flex-1" />
      </div>

      {wide ? (
        <>
          <div className="border-app-bg text-muted-foreground flex shrink-0 gap-3 border-b px-3.5 py-2 text-[10.5px] font-semibold tracking-wide uppercase">
            <span className="w-[90px] shrink-0">Job</span>
            <span className="min-w-0 flex-[1.2]">Equipment</span>
            <span className="min-w-0 flex-1">Services</span>
            <span className="w-[110px] shrink-0">Customer</span>
            <span className="w-[60px] shrink-0">Due</span>
          </div>
          <div
            onDragOver={onBodyDragOver}
            onDragEnter={(e) => e.preventDefault()}
            onDragLeave={onBodyDragLeave}
            onDrop={onBodyDrop}
            style={{ background: isOver ? hexA("#2563eb", 0.04) : "transparent" }}
            className="flex-1 overflow-y-auto transition-colors"
          >
            {rows.length === 0 && (
              <div className="text-muted-foreground m-[10px] flex h-20 items-center justify-center rounded-[10px] border border-dashed text-[11.5px]">
                Drop equipment here
              </div>
            )}
            {rows.map((row) => (
              <JobEntry key={row.rowId} row={row} variant="row" />
            ))}
          </div>
        </>
      ) : (
        <div
          onDragOver={onBodyDragOver}
          onDragEnter={(e) => e.preventDefault()}
          onDragLeave={onBodyDragLeave}
          onDrop={onBodyDrop}
          style={{ background: isOver ? hexA("#2563eb", 0.04) : "transparent" }}
          className="flex flex-1 flex-col gap-2 overflow-y-auto p-[10px] transition-colors"
        >
          {rows.length === 0 && (
            <div className="text-muted-foreground flex h-20 items-center justify-center rounded-[10px] border border-dashed text-[11.5px]">
              Drop equipment here
            </div>
          )}
          {rows.map((row) => (
            <JobEntry key={row.rowId} row={row} variant="card" />
          ))}
        </div>
      )}

      <div
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startColResize("table", e.clientX, width);
        }}
        className="absolute top-0 right-0 z-[8] h-full w-[7px] cursor-col-resize"
      />
    </Card>
  );
}
