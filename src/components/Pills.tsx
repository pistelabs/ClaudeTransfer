import { Check } from "lucide-react";
import { serviceColor, serviceDisplayLabel } from "../lib/serviceCatalog";
import { avatarColor, initials } from "../lib/format";
import type { EquipmentType } from "../types";

export function ServicePill({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const [bg, fg, border] = serviceColor(name);
  const big = size === "md";
  return (
    <span
      className={big ? "inline-flex items-center rounded-[7px] px-[11px] py-1 text-[12.5px] font-semibold" : "inline-flex items-center whitespace-nowrap rounded-[6px] px-[7px] py-px text-[10px] font-semibold leading-[1.5]"}
      style={{ background: bg, color: fg, border: `1px solid ${border}` }}
    >
      {serviceDisplayLabel(name)}
    </span>
  );
}

export function TypeBadge({ type }: { type: EquipmentType }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-[5px] border border-border bg-app-bg px-[6px] py-px text-[9px] font-semibold leading-[1.5] tracking-wide text-zinc-500">
      {type}
    </span>
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
    <span
      className="inline-flex items-center whitespace-nowrap rounded-[5px] px-[6px] py-px text-[9px] font-bold leading-[1.5] tracking-wide"
      style={{ background: d.bg, color: d.fg, border: `1px solid ${d.bd}` }}
    >
      {d.label}
    </span>
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
      className="flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: size <= 26 ? 10 : 12, letterSpacing: "0.02em" }}
    >
      {initials(name)}
    </div>
  );
}

export function CheckedBox({ on }: { on: boolean }) {
  return (
    <div
      className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-2"
      style={{ background: on ? "#0284c7" : "#ffffff", borderColor: on ? "#0284c7" : "#d4d4d8" }}
    >
      {on && <Check size={11} strokeWidth={3} color="#fff" />}
    </div>
  );
}
