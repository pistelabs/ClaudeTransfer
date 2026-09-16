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
import type { LeaveInput, StaffInput, TimeBlockInput } from "./dto"

export type { LeaveInput, StaffInput, TimeBlockInput }

export interface PrinterTestResult {
  ok: boolean
  detail: string
}

/**
 * The contract both adapters implement: `httpApi` talks to Django, `mockApi`
 * keeps the same shapes in memory. Components only ever see this interface.
 */
export interface StoreApi {
  listStaff(signal?: AbortSignal): Promise<StaffMember[]>
  createStaff(input: StaffInput): Promise<StaffMember>
  updateStaff(id: string, input: Partial<StaffInput>): Promise<StaffMember>
  deleteStaff(id: string): Promise<void>

  listServices(signal?: AbortSignal): Promise<Service[]>

  /** `weekStart` is the Monday, ISO `YYYY-MM-DD`. */
  listTimeBlocks(weekStart: string, signal?: AbortSignal): Promise<TimeBlock[]>
  createTimeBlock(input: TimeBlockInput): Promise<TimeBlock>
  updateTimeBlock(
    id: string,
    input: Partial<TimeBlockInput>,
  ): Promise<TimeBlock>
  deleteTimeBlock(id: string): Promise<void>
  /** Copy every block from one day onto another for the same staff member. */
  copyDay(params: {
    staffId: string
    fromDay: string
    toDay: string
    weekStart: string
  }): Promise<TimeBlock[]>

  listLeave(signal?: AbortSignal): Promise<LeaveEntry[]>
  createLeave(input: LeaveInput): Promise<LeaveEntry>
  deleteLeave(id: string): Promise<void>

  getStoreSettings(signal?: AbortSignal): Promise<StoreSettings>
  updateStoreSettings(patch: Partial<StoreSettings>): Promise<StoreSettings>

  listIntegrations(signal?: AbortSignal): Promise<Integration[]>
  connectIntegration(id: string): Promise<Integration>
  disconnectIntegration(id: string): Promise<Integration>

  getPrinterSettings(signal?: AbortSignal): Promise<PrinterSettings>
  updatePrinterSettings(
    patch: Partial<PrinterSettings>,
  ): Promise<PrinterSettings>
  testPrinter(): Promise<PrinterTestResult>

  getDocketSettings(signal?: AbortSignal): Promise<DocketSettings>
  updateDocketSettings(patch: Partial<DocketSettings>): Promise<DocketSettings>
}
