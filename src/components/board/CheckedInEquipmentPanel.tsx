import { GripVertical } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { filterJobs, jobToRows, sortByDue } from "../../lib/boardSelectors";
import { JobEntry } from "./JobEntry";

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

  const width = colWidths["table"] ?? 620;
  const wide = width >= 420;
  const order = boardOrder.indexOf("table");

  const jobsFiltered = sortByDue(filterJobs(jobs, query, filterCats));
  const rows = jobsFiltered.flatMap(jobToRows);

  return (
    <section
      style={{ order, width, flexShrink: 0, borderTopWidth: 3, borderTopColor: "#2563eb" }}
      className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
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
        className="flex h-11 flex-shrink-0 cursor-grab items-center gap-[9px] border-b border-app-bg pl-3 pr-2"
      >
        <GripVertical size={13} color="#c4c4c8" />
        <span className="h-2 w-2 flex-shrink-0 rounded-[3px]" style={{ background: "#2563eb" }} />
        <span className="text-[12.5px] font-semibold leading-[1.15] tracking-tight">Checked in Equipment</span>
        <span className="rounded-full bg-app-bg px-2 py-px text-[11px] font-semibold leading-[1.6] text-zinc-500">{rows.length}</span>
        <div className="flex-1" />
      </div>

      {wide ? (
        <>
          <div className="flex flex-shrink-0 gap-3 border-b border-app-bg px-[14px] py-[9px] text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400">
            <span className="w-[76px] flex-shrink-0">Job</span>
            <span className="min-w-0 flex-[1.2]">Equipment</span>
            <span className="min-w-0 flex-1">Services</span>
            <span className="w-[110px] flex-shrink-0">Customer</span>
            <span className="w-[60px] flex-shrink-0">Due</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rows.map((row) => (
              <JobEntry key={row.rowId} row={row} variant="row" />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-[10px]">
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
        className="absolute right-0 top-0 z-[8] h-full w-[7px] cursor-col-resize"
      />
    </section>
  );
}
