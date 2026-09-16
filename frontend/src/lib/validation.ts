/**
 * Validation the prototype never had. The handoff calls these out explicitly:
 * IP/port, times where end must be after start, and required staff name/email.
 */
import { z } from "zod"

import { toMinutes } from "./time"
import { DAYS, PRINTER_PROTOCOLS, ROLL_SIZES } from "./types"

const IPV4 =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/

export const staffSchema = z.object({
  name: z.string().trim().min(1, "Enter the staff member's name"),
  role: z.string().trim().min(1, "Enter a role"),
  email: z
    .string()
    .trim()
    .min(1, "Enter an email address")
    .email("Enter a valid email address"),
  phone: z.string().trim().optional().default(""),
  availableHours: z
    .number({ message: "Enter the weekly hours" })
    .min(0, "Hours cannot be negative")
    .max(168, "There are only 168 hours in a week"),
  daysOff: z.array(z.enum(DAYS)),
  bookingNotify: z.enum(["every", "daily", "none"]),
  canCheckEquipment: z.boolean(),
  canCompleteAppointments: z.boolean(),
})

export type StaffFormValues = z.infer<typeof staffSchema>

const breakSchema = z.object({
  start: z.string(),
  end: z.string(),
})

export const timeBlockSchema = z
  .object({
    start: z.string().min(1, "Pick a start time"),
    end: z.string().min(1, "Pick an end time"),
    breaks: z.array(breakSchema),
  })
  .superRefine((value, ctx) => {
    const start = toMinutes(value.start)
    const end = toMinutes(value.end)

    if (end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["end"],
        message: "The end time must be after the start time",
      })
    }

    value.breaks.forEach((brk, index) => {
      const bStart = toMinutes(brk.start)
      const bEnd = toMinutes(brk.end)
      if (bEnd <= bStart) {
        ctx.addIssue({
          code: "custom",
          path: ["breaks", index],
          message: "The break must end after it starts",
        })
        return
      }
      if (bStart < start || bEnd > end) {
        ctx.addIssue({
          code: "custom",
          path: ["breaks", index],
          message: "Breaks must sit inside the time block",
        })
      }
    })
  })

export const leaveSchema = z
  .object({
    staffId: z.string().min(1, "Pick a staff member"),
    type: z.enum(["Vacation", "Sick", "Personal"]),
    startDate: z.string().min(1, "Pick a start date"),
    endDate: z.string().min(1, "Pick an end date"),
  })
  .refine((value) => value.endDate >= value.startDate, {
    path: ["endDate"],
    message: "The end date must be on or after the start date",
  })

export type LeaveFormValues = z.infer<typeof leaveSchema>

export const printerSchema = z.object({
  connection: z.enum(["network", "wired"]),
  roll: z.enum(ROLL_SIZES),
  ip: z.string(),
  port: z.string(),
  model: z.string(),
  protocol: z.enum(PRINTER_PROTOCOLS),
})

/** Network printers need a reachable address; wired ones do not. */
export const networkPrinterSchema = z.object({
  ip: z.string().trim().regex(IPV4, "Enter a valid IPv4 address"),
  port: z
    .string()
    .trim()
    .refine((value) => {
      const port = Number(value)
      return Number.isInteger(port) && port >= 1 && port <= 65535
    }, "Enter a port between 1 and 65535"),
})

/** Field name → first message, the shape the dialogs render. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".")
    if (!(key in out)) out[key] = issue.message
  }
  return out
}
