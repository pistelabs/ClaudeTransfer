import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTE = [
  "#6366f1",
  "#0ea5e9",
  "#0d9488",
  "#d97706",
  "#db2777",
  "#7c3aed",
  "#dc2626",
  "#059669",
];

export function avatarColor(name: string): string {
  let h = 0;
  const s = name || "";
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

/** Parse "DD/MM" into a sortable number, missing/invalid dates sort last. */
export function dueKey(d?: string): number {
  if (!d || d === "—") return Infinity;
  const parts = String(d).split("/");
  if (parts.length < 2) return Infinity;
  const day = parseInt(parts[0], 10);
  const mon = parseInt(parts[1], 10);
  if (isNaN(day) || isNaN(mon)) return Infinity;
  return mon * 100 + day;
}

/** Parse "DD/MM h:MM AM" drop-off strings into a sortable number, soonest first. */
export function dropKey(s?: string): number {
  if (!s) return Infinity;
  const parts = String(s).split(" ");
  const dm = (parts[0] || "").split("/");
  if (dm.length < 2) return Infinity;
  const day = parseInt(dm[0], 10);
  const mon = parseInt(dm[1], 10);
  if (isNaN(day) || isNaN(mon)) return Infinity;
  let mins = 0;
  const tm = (parts[1] || "").match(/(\d+):(\d+)/);
  if (tm) {
    let h = parseInt(tm[1], 10) % 12;
    if (/pm/i.test(s)) h += 12;
    mins = h * 60 + parseInt(tm[2], 10);
  }
  return (mon * 100 + day) * 10000 + mins;
}

export function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function stampNow(): string {
  return (
    new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }) +
    " " +
    new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

export function money(n: number): string {
  return "$" + n.toFixed(2);
}

/** Recognizes a typed token as email / phone / name for auto-routing (Add customer flow). */
export function parseCustomerQuery(q: string): { first?: string; last?: string; email?: string; phone?: string } {
  const trimmed = (q || "").trim();
  if (!trimmed) return {};
  if (/@/.test(trimmed)) return { email: trimmed };
  if (/[0-9].*[0-9].*[0-9]/.test(trimmed) && /^[0-9+()\-\s]+$/.test(trimmed)) return { phone: trimmed };
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return { first: parts[0] || "", last: parts.slice(1).join(" ") };
}
