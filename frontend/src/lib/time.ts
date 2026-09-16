import type { Break, BookingInterval, Day, LeadUnit } from "./types"

/** "HH:MM" → minutes since midnight. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export function toTimeString(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, minutes))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/** Every 15-minute increment across the day, for the Start/End selects. */
export function timeOptions(stepMinutes = 15): string[] {
  const out: string[] = []
  for (let m = 0; m <= 24 * 60 - stepMinutes; m += stepMinutes) {
    out.push(toTimeString(m))
  }
  return out
}

export function breakMinutes(breaks: Break[]): number {
  return breaks.reduce(
    (total, b) => total + Math.max(0, toMinutes(b.end) - toMinutes(b.start)),
    0,
  )
}

/** Worked minutes in a block: span minus any breaks. */
export function blockMinutes(
  start: string,
  end: string,
  breaks: Break[] = [],
): number {
  return Math.max(0, toMinutes(end) - toMinutes(start) - breakMinutes(breaks))
}

/** 195 → "3h 15m"; 180 → "3h"; 45 → "45m". */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0m"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m}m`
  if (!m) return `${h}h`
  return `${h}h ${m}m`
}

export function formatHours(minutes: number): string {
  const hours = minutes / 60
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1)
}

export const INTERVAL_OPTIONS: { value: BookingInterval; label: string }[] = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hr" },
  { value: 90, label: "1.5 hr" },
  { value: 120, label: "2 hr" },
]

export function formatInterval(interval: BookingInterval): string {
  return (
    INTERVAL_OPTIONS.find((o) => o.value === interval)?.label ??
    `${interval} min`
  )
}

export const LEAD_UNITS: { value: LeadUnit; label: string }[] = [
  { value: "min", label: "min" },
  { value: "h", label: "hrs" },
  { value: "d", label: "days" },
]

export function leadUnitLabel(unit: LeadUnit): string {
  return LEAD_UNITS.find((u) => u.value === unit)?.label ?? unit
}

export const DAY_NAMES: Record<Day, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

export function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** "Dec 22 – Dec 29", or a single date when start and end match. */
export function formatDateRange(startIso: string, endIso: string): string {
  const start = formatShortDate(startIso)
  const end = formatShortDate(endIso)
  return start === end ? start : `${start} – ${end}`
}

/** Inclusive day count between two ISO dates. */
export function countDays(startIso: string, endIso: string): number {
  const start = new Date(`${startIso}T00:00:00`)
  const end = new Date(`${endIso}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000)
  return Math.max(0, diff) + 1
}

/** Monday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Monday = 0
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** "Dec 8 – 14", spanning months as "Dec 29 – Jan 4". */
export function formatWeekLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6)
  const startLabel = `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()}`
  const endLabel =
    weekStart.getMonth() === end.getMonth()
      ? String(end.getDate())
      : `${MONTHS[end.getMonth()]} ${end.getDate()}`
  return `${startLabel} – ${endLabel}`
}

/** The seven dates of a week, keyed by day name. */
export function weekDates(weekStart: Date): Record<Day, Date> {
  const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return days.reduce(
    (acc, day, i) => {
      acc[day] = addDays(weekStart, i)
      return acc
    },
    {} as Record<Day, Date>,
  )
}
