import { serviceColor, serviceDisplayLabel } from "../lib/serviceCatalog";
import { avatarColor, initials } from "../lib/format";
import type { EquipmentType } from "../types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Service badges are colour-coded per service, so their palette comes from the catalog
 * rather than the theme — the colour is what makes them scannable across a busy board. */
export function ServicePill({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const [bg, fg, border] = serviceColor(name);
  const big = size === "md";
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold",
        big ? "rounded-md px-2.5 py-1 text-[12.5px]" : "rounded-[6px] px-[7px] py-px text-[10px] leading-[1.5]",
      )}
      style={{ background: bg, color: fg, borderColor: border }}
    >
      {serviceDisplayLabel(name)}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: EquipmentType }) {
  return (
    <Badge
      variant="secondary"
      className="text-muted-foreground rounded-[5px] border px-1.5 py-px text-[9px] leading-[1.5] font-semibold tracking-wide"
    >
      {type}
    </Badge>
  );
}

const STATUS_DEFS: Record<string, { label: string; bg: string; fg: string; bd: string }> = {
  late: { label: "OVERDUE", bg: "#fef2f2", fg: "#dc2626", bd: "#fecaca" },
  complete: { label: "COMPLETE", bg: "#f0fdf4", fg: "#16a34a", bd: "#bbf7d0" },
  partial: { label: "PARTIAL", bg: "#fffbeb", fg: "#d97706", bd: "#fde68a" },
};

export function StatusPill({ status }: { status?: string | null }) {
  if (!status) return null;
  const d = STATUS_DEFS[status];
  if (!d) return null;
  return (
    <Badge
      variant="outline"
      className="rounded-[5px] px-1.5 py-px text-[9px] leading-[1.5] font-bold tracking-wide"
      style={{ background: d.bg, color: d.fg, borderColor: d.bd }}
    >
      {d.label}
    </Badge>
  );
}

export function cardTint(status?: string | null): [string, string] {
  if (status === "late") return ["#fef2f2", "#fecaca"];
  if (status === "complete") return ["#f6fef9", "#bbf7d0"];
  if (status === "partial") return ["#fffdf5", "#fde68a"];
  return ["#ffffff", "#e4e4e7"];
}

export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        background: avatarColor(name),
        fontSize: size <= 26 ? 10 : 12,
        letterSpacing: "0.02em",
      }}
    >
      {initials(name)}
    </div>
  );
}
