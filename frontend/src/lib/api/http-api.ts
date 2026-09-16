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
import {
  fromDocketSettings,
  fromLeave,
  fromPrinterSettings,
  fromStaff,
  fromStoreSettings,
  fromTimeBlock,
  toDocketSettings,
  toIntegration,
  toLeave,
  toPrinterSettings,
  toService,
  toStaff,
  toStoreSettings,
  toTimeBlock,
} from "./dto"
import type {
  DocketSettingsDTO,
  IntegrationDTO,
  LeaveDTO,
  PrinterSettingsDTO,
  ServiceDTO,
  StaffDTO,
  StoreSettingsDTO,
  TimeBlockDTO,
} from "./dto"
import { endpoints } from "./endpoints"
import { http, unwrapList, type Paginated } from "./http"
import type { PrinterTestResult, StoreApi } from "./types"

type List<T> = Paginated<T> | T[]

/** The real backend adapter. Every call goes through `http`. */
export const httpApi: StoreApi = {
  async listStaff(signal): Promise<StaffMember[]> {
    const data = await http.get<List<StaffDTO>>(endpoints.staff, { signal })
    return unwrapList(data).map(toStaff)
  },

  async createStaff(input) {
    const data = await http.post<StaffDTO>(endpoints.staff, fromStaff(input))
    return toStaff(data)
  },

  async updateStaff(id, input) {
    const data = await http.patch<StaffDTO>(
      endpoints.staffDetail(id),
      fromStaff(input)
    )
    return toStaff(data)
  },

  async deleteStaff(id) {
    await http.delete(endpoints.staffDetail(id))
  },

  async listServices(signal): Promise<Service[]> {
    const data = await http.get<List<ServiceDTO>>(endpoints.services, { signal })
    return unwrapList(data).map(toService)
  },

  async listTimeBlocks(weekStart, signal): Promise<TimeBlock[]> {
    const data = await http.get<List<TimeBlockDTO>>(endpoints.timeBlocks, {
      params: { week_start: weekStart },
      signal,
    })
    return unwrapList(data).map(toTimeBlock)
  },

  async createTimeBlock(input) {
    const data = await http.post<TimeBlockDTO>(
      endpoints.timeBlocks,
      fromTimeBlock(input)
    )
    return toTimeBlock(data)
  },

  async updateTimeBlock(id, input) {
    const data = await http.patch<TimeBlockDTO>(
      endpoints.timeBlockDetail(id),
      fromTimeBlock(input)
    )
    return toTimeBlock(data)
  },

  async deleteTimeBlock(id) {
    await http.delete(endpoints.timeBlockDetail(id))
  },

  async copyDay({ staffId, fromDay, toDay, weekStart }) {
    const data = await http.post<List<TimeBlockDTO>>(
      endpoints.timeBlockCopyDay,
      {
        staff: staffId,
        from_day: fromDay,
        to_day: toDay,
        week_start: weekStart,
      }
    )
    return unwrapList(data).map(toTimeBlock)
  },

  async listLeave(signal): Promise<LeaveEntry[]> {
    const data = await http.get<List<LeaveDTO>>(endpoints.leave, { signal })
    return unwrapList(data).map(toLeave)
  },

  async createLeave(input) {
    const data = await http.post<LeaveDTO>(endpoints.leave, fromLeave(input))
    return toLeave(data)
  },

  async deleteLeave(id) {
    await http.delete(endpoints.leaveDetail(id))
  },

  async getStoreSettings(signal): Promise<StoreSettings> {
    const data = await http.get<StoreSettingsDTO>(endpoints.storeSettings, {
      signal,
    })
    return toStoreSettings(data)
  },

  async updateStoreSettings(patch) {
    const data = await http.patch<StoreSettingsDTO>(
      endpoints.storeSettings,
      fromStoreSettings(patch)
    )
    return toStoreSettings(data)
  },

  async listIntegrations(signal): Promise<Integration[]> {
    const data = await http.get<List<IntegrationDTO>>(endpoints.integrations, {
      signal,
    })
    return unwrapList(data).map(toIntegration)
  },

  async connectIntegration(id) {
    const data = await http.post<IntegrationDTO>(
      endpoints.integrationConnect(id)
    )
    return toIntegration(data)
  },

  async disconnectIntegration(id) {
    const data = await http.post<IntegrationDTO>(
      endpoints.integrationDisconnect(id)
    )
    return toIntegration(data)
  },

  async getPrinterSettings(signal): Promise<PrinterSettings> {
    const data = await http.get<PrinterSettingsDTO>(endpoints.printerSettings, {
      signal,
    })
    return toPrinterSettings(data)
  },

  async updatePrinterSettings(patch) {
    const data = await http.patch<PrinterSettingsDTO>(
      endpoints.printerSettings,
      fromPrinterSettings(patch)
    )
    return toPrinterSettings(data)
  },

  async testPrinter(): Promise<PrinterTestResult> {
    return http.post<PrinterTestResult>(endpoints.printerTest)
  },

  async getDocketSettings(signal): Promise<DocketSettings> {
    const data = await http.get<DocketSettingsDTO>(endpoints.docketSettings, {
      signal,
    })
    return toDocketSettings(data)
  },

  async updateDocketSettings(patch) {
    const data = await http.patch<DocketSettingsDTO>(
      endpoints.docketSettings,
      fromDocketSettings(patch)
    )
    return toDocketSettings(data)
  },
}
