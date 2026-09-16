import { Trash2Icon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StaffAvatar } from "@/components/common/StaffAvatar";
import { LEAVE_TYPE_STYLES } from "@/lib/categories";
import type { LeaveEntry, StaffMember } from "@/lib/types";

interface AnnualLeaveTableProps {
  leave: LeaveEntry[];
  staff: StaffMember[];
  onDelete: (entry: LeaveEntry) => void;
}

export function AnnualLeaveTable({
  leave,
  staff,
  onDelete,
}: AnnualLeaveTableProps) {
  const byId = new Map(staff.map((s) => [s.id, s]));

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-card">
      <Table className="table-fixed">
        {/* Column widths from the handoff: 1.6fr 1.2fr 1.6fr 90px */}
        <colgroup>
          <col style={{ width: "32%" }} />
          <col style={{ width: "24%" }} />
          <col style={{ width: "32%" }} />
          <col style={{ width: 90 }} />
        </colgroup>
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className="px-[18px] py-3 text-[11px] font-semibold tracking-[0.4px] uppercase">
              Staff
            </TableHead>
            <TableHead className="px-[18px] py-3 text-[11px] font-semibold tracking-[0.4px] uppercase">
              Type
            </TableHead>
            <TableHead className="px-[18px] py-3 text-[11px] font-semibold tracking-[0.4px] uppercase">
              Dates
            </TableHead>
            <TableHead className="px-[18px] py-3 text-right text-[11px] font-semibold tracking-[0.4px] uppercase">
              Days
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leave.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground px-[18px] py-8 text-center text-[13px]"
              >
                No annual leave booked
              </TableCell>
            </TableRow>
          )}
          {leave.map((entry) => {
            const member = byId.get(entry.staffId);
            const style = LEAVE_TYPE_STYLES[entry.type];
            return (
              <TableRow key={entry.id} className="border-divider-light group">
                <TableCell className="px-[18px] py-3.5">
                  <span className="flex items-center gap-2.5">
                    {member && <StaffAvatar staff={member} size={28} />}
                    <span className="text-[13px] font-medium">
                      {member?.name ?? "Unknown"}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="px-[18px] py-3.5">
                  <span
                    className="rounded-md border px-2 py-[3px] text-[11.5px] font-semibold"
                    style={{
                      backgroundColor: style.bg,
                      color: style.fg,
                      borderColor: style.border,
                    }}
                  >
                    {entry.type}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground px-[18px] py-3.5 text-[13px]">
                  {entry.dates}
                </TableCell>
                <TableCell className="px-[18px] py-3.5 text-right">
                  <span className="flex items-center justify-end gap-2">
                    <span className="text-[13px] font-semibold">
                      {entry.days}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDelete(entry)}
                      className="text-placeholder-foreground hover:bg-destructive-tint hover:text-destructive focus-ring flex size-7 items-center justify-center rounded-md opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100"
                      aria-label={`Delete leave for ${member?.name ?? "staff member"}`}
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
