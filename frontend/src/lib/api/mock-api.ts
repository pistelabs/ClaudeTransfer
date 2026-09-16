/**
 * In-memory adapter used until `VITE_API_BASE_URL` points at Django.
 *
 * It mirrors `httpApi` exactly — same arguments, same return shapes, same
 * latency-shaped promises — so switching to the real backend changes one env
 * var and nothing else.
 */
import {
  demoDocket,
  demoIntegrations,
  demoLeave,
  demoPrinter,
  demoServices,
  demoStaff,
  demoStoreSettings,
  demoTimeBlocks,
} from "../demo-data"
import { countDays, formatDateRange, initialsOf } from "../time"
import { AVATAR_COLORS } from "../categories"
import type {
  DocketSettings,
  Integration,
  LeaveEntry,
  PrinterSettings,
  Service,
  StaffMember,
  StoreSettings,
  TimeBlock,
} from "../types"
import type { PrinterTestResult, StoreApi } from "./types"

const LATENCY_MS = 180

function clone<T>(value: T): T {
  return structuredClone(value)
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(clone(value)), LATENCY_MS)
  )
}

interface MockDb {
  staff: StaffMember[]
  services: Service[]
  timeBlocks: TimeBlock[]
  leave: LeaveEntry[]
  storeSettings: StoreSettings
  integrations: Integration[]
  printer: PrinterSettings
  docket: DocketSettings
}

const db: MockDb = {
  staff: clone(demoStaff),
  services: clone(demoServices),
  timeBlocks: clone(demoTimeBlocks),
  leave: clone(demoLeave),
  storeSettings: clone(demoStoreSettings),
  integrations: clone(demoIntegrations),
  printer: clone(demoPrinter),
  docket: clone(demoDocket),
}

let sequence = 1000
function nextId(prefix: string): string {
  sequence += 1
  return `${prefix}${sequence}`
}

function requireStaff(id: string): StaffMember {
  const found = db.staff.find((s) => s.id === id)
  if (!found) throw new Error(`No staff member with id ${id}`)
  return found
}

export const mockApi: StoreApi = {
  listStaff: () => delay(db.staff),

  createStaff: (input) => {
    const staff: StaffMember = {
      ...input,
      id: nextId("s"),
      initials: input.initials || initialsOf(input.name),
      color:
        input.color || AVATAR_COLORS[db.staff.length % AVATAR_COLORS.length],
    }
    db.staff = [...db.staff, staff]
    return delay(staff)
  },

  updateStaff: (id, input) => {
    const current = requireStaff(id)
    const updated: StaffMember = {
      ...current,
      ...input,
      initials: input.name ? initialsOf(input.name) : current.initials,
    }
    db.staff = db.staff.map((s) => (s.id === id ? updated : s))
    return delay(updated)
  },

  deleteStaff: (id) => {
    db.staff = db.staff.filter((s) => s.id !== id)
    db.timeBlocks = db.timeBlocks.filter((b) => b.staffId !== id)
    db.leave = db.leave.filter((l) => l.staffId !== id)
    return delay(undefined)
  },

  listServices: () => delay(db.services),

  /** The prototype's schedule repeats weekly, so the week is not filtered. */
  listTimeBlocks: () => delay(db.timeBlocks),

  createTimeBlock: (input) => {
    const block: TimeBlock = { ...input, id: nextId("b") }
    db.timeBlocks = [...db.timeBlocks, block]
    return delay(block)
  },

  updateTimeBlock: (id, input) => {
    const current = db.timeBlocks.find((b) => b.id === id)
    if (!current) throw new Error(`No time block with id ${id}`)
    const updated = { ...current, ...input }
    db.timeBlocks = db.timeBlocks.map((b) => (b.id === id ? updated : b))
    return delay(updated)
  },

  deleteTimeBlock: (id) => {
    db.timeBlocks = db.timeBlocks.filter((b) => b.id !== id)
    return delay(undefined)
  },

  copyDay: ({ staffId, fromDay, toDay }) => {
    const source = db.timeBlocks.filter(
      (b) => b.staffId === staffId && b.day === fromDay
    )
    const copies = source.map((b) => ({
      ...clone(b),
      id: nextId("b"),
      day: toDay as TimeBlock["day"],
    }))
    db.timeBlocks = [...db.timeBlocks, ...copies]
    return delay(copies)
  },

  listLeave: () => delay(db.leave),

  createLeave: (input) => {
    const entry: LeaveEntry = {
      id: nextId("l"),
      staffId: input.staffId,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      dates: formatDateRange(input.startDate, input.endDate),
      days: countDays(input.startDate, input.endDate),
    }
    db.leave = [...db.leave, entry]
    return delay(entry)
  },

  deleteLeave: (id) => {
    db.leave = db.leave.filter((l) => l.id !== id)
    return delay(undefined)
  },

  getStoreSettings: () => delay(db.storeSettings),

  updateStoreSettings: (patch) => {
    db.storeSettings = {
      ...db.storeSettings,
      ...patch,
      booking: { ...db.storeSettings.booking, ...patch.booking },
      walkIn: { ...db.storeSettings.walkIn, ...patch.walkIn },
    }
    return delay(db.storeSettings)
  },

  listIntegrations: () => delay(db.integrations),

  connectIntegration: (id) => {
    const found = db.integrations.find((i) => i.id === id)
    if (!found) throw new Error(`No integration with id ${id}`)
    const updated: Integration = {
      ...found,
      connected: true,
      account: found.account || `${found.name.toLowerCase()} · demo account`,
    }
    db.integrations = db.integrations.map((i) => (i.id === id ? updated : i))
    return delay(updated)
  },

  disconnectIntegration: (id) => {
    const found = db.integrations.find((i) => i.id === id)
    if (!found) throw new Error(`No integration with id ${id}`)
    const updated: Integration = { ...found, connected: false, account: "" }
    db.integrations = db.integrations.map((i) => (i.id === id ? updated : i))
    return delay(updated)
  },

  getPrinterSettings: () => delay(db.printer),

  updatePrinterSettings: (patch) => {
    db.printer = { ...db.printer, ...patch }
    return delay(db.printer)
  },

  testPrinter: (): Promise<PrinterTestResult> => {
    const { connection, ip, port, model } = db.printer
    return delay({
      ok: true,
      detail:
        connection === "network"
          ? `${model} at ${ip}:${port}`
          : `${model} over USB / serial`,
    })
  },

  getDocketSettings: () => delay(db.docket),

  updateDocketSettings: (patch) => {
    db.docket = {
      ...db.docket,
      ...patch,
      customerEls: { ...db.docket.customerEls, ...patch.customerEls },
      shopEls: { ...db.docket.shopEls, ...patch.shopEls },
    }
    return delay(db.docket)
  },
}
