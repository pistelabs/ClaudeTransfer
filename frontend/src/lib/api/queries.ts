/**
 * TanStack Query bindings.
 *
 * Every read is a query keyed under `queryKeys`; every write is a mutation that
 * invalidates the keys it touched. Swapping the mock adapter for Django needs
 * no change here — both satisfy `StoreApi`.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query"

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
import { api } from "./index"
import type {
  LeaveInput,
  PrinterTestResult,
  StaffInput,
  TimeBlockInput,
} from "./types"

export const queryKeys = {
  staff: ["staff"] as const,
  services: ["services"] as const,
  timeBlocks: (weekStart: string) => ["time-blocks", weekStart] as const,
  leave: ["leave"] as const,
  storeSettings: ["store-settings"] as const,
  integrations: ["integrations"] as const,
  printerSettings: ["printer-settings"] as const,
  docketSettings: ["docket-settings"] as const,
}

/* ------------------------------------------------------------------ reads */

export function useStaff() {
  return useQuery<StaffMember[]>({
    queryKey: queryKeys.staff,
    queryFn: ({ signal }) => api.listStaff(signal),
  })
}

export function useServices() {
  return useQuery<Service[]>({
    queryKey: queryKeys.services,
    queryFn: ({ signal }) => api.listServices(signal),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTimeBlocks(weekStart: string) {
  return useQuery<TimeBlock[]>({
    queryKey: queryKeys.timeBlocks(weekStart),
    queryFn: ({ signal }) => api.listTimeBlocks(weekStart, signal),
  })
}

export function useLeave() {
  return useQuery<LeaveEntry[]>({
    queryKey: queryKeys.leave,
    queryFn: ({ signal }) => api.listLeave(signal),
  })
}

export function useStoreSettings() {
  return useQuery<StoreSettings>({
    queryKey: queryKeys.storeSettings,
    queryFn: ({ signal }) => api.getStoreSettings(signal),
  })
}

export function useIntegrations() {
  return useQuery<Integration[]>({
    queryKey: queryKeys.integrations,
    queryFn: ({ signal }) => api.listIntegrations(signal),
  })
}

export function usePrinterSettings() {
  return useQuery<PrinterSettings>({
    queryKey: queryKeys.printerSettings,
    queryFn: ({ signal }) => api.getPrinterSettings(signal),
  })
}

export function useDocketSettings() {
  return useQuery<DocketSettings>({
    queryKey: queryKeys.docketSettings,
    queryFn: ({ signal }) => api.getDocketSettings(signal),
  })
}

/* ----------------------------------------------------------------- writes */

type MutationExtras<TData, TVars> = Omit<
  UseMutationOptions<TData, Error, TVars>,
  "mutationFn"
>

export function useCreateStaff(
  options?: MutationExtras<StaffMember, StaffInput>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: StaffInput) => api.createStaff(input),
    ...options,
    onSuccess: (...args) => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff })
      options?.onSuccess?.(...args)
    },
  })
}

export function useUpdateStaff(
  options?: MutationExtras<
    StaffMember,
    { id: string; input: Partial<StaffInput> }
  >,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<StaffInput> }) =>
      api.updateStaff(id, input),
    ...options,
    onSuccess: (...args) => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff })
      options?.onSuccess?.(...args)
    },
  })
}

export function useDeleteStaff(options?: MutationExtras<void, string>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteStaff(id),
    ...options,
    onSuccess: (...args) => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff })
      void qc.invalidateQueries({ queryKey: ["time-blocks"] })
      void qc.invalidateQueries({ queryKey: queryKeys.leave })
      options?.onSuccess?.(...args)
    },
  })
}

function useTimeBlockInvalidation(weekStart: string) {
  const qc = useQueryClient()
  return () =>
    qc.invalidateQueries({ queryKey: queryKeys.timeBlocks(weekStart) })
}

export function useCreateTimeBlock(
  weekStart: string,
  options?: MutationExtras<TimeBlock, TimeBlockInput>,
) {
  const invalidate = useTimeBlockInvalidation(weekStart)
  return useMutation({
    mutationFn: (input: TimeBlockInput) => api.createTimeBlock(input),
    ...options,
    onSuccess: (...args) => {
      void invalidate()
      options?.onSuccess?.(...args)
    },
  })
}

export function useUpdateTimeBlock(
  weekStart: string,
  options?: MutationExtras<
    TimeBlock,
    { id: string; input: Partial<TimeBlockInput> }
  >,
) {
  const invalidate = useTimeBlockInvalidation(weekStart)
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: Partial<TimeBlockInput>
    }) => api.updateTimeBlock(id, input),
    ...options,
    onSuccess: (...args) => {
      void invalidate()
      options?.onSuccess?.(...args)
    },
  })
}

export function useDeleteTimeBlock(
  weekStart: string,
  options?: MutationExtras<void, string>,
) {
  const invalidate = useTimeBlockInvalidation(weekStart)
  return useMutation({
    mutationFn: (id: string) => api.deleteTimeBlock(id),
    ...options,
    onSuccess: (...args) => {
      void invalidate()
      options?.onSuccess?.(...args)
    },
  })
}

export function useCopyDay(
  weekStart: string,
  options?: MutationExtras<
    TimeBlock[],
    { staffId: string; fromDay: string; toDay: string }
  >,
) {
  const invalidate = useTimeBlockInvalidation(weekStart)
  return useMutation({
    mutationFn: (vars: { staffId: string; fromDay: string; toDay: string }) =>
      api.copyDay({ ...vars, weekStart }),
    ...options,
    onSuccess: (...args) => {
      void invalidate()
      options?.onSuccess?.(...args)
    },
  })
}

export function useCreateLeave(
  options?: MutationExtras<LeaveEntry, LeaveInput>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LeaveInput) => api.createLeave(input),
    ...options,
    onSuccess: (...args) => {
      void qc.invalidateQueries({ queryKey: queryKeys.leave })
      options?.onSuccess?.(...args)
    },
  })
}

export function useDeleteLeave(options?: MutationExtras<void, string>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteLeave(id),
    ...options,
    onSuccess: (...args) => {
      void qc.invalidateQueries({ queryKey: queryKeys.leave })
      options?.onSuccess?.(...args)
    },
  })
}

/** Settings writes are optimistic: the switches must feel instant. */
export function useUpdateStoreSettings(
  options?: MutationExtras<StoreSettings, Partial<StoreSettings>>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<StoreSettings>) =>
      api.updateStoreSettings(patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: queryKeys.storeSettings })
      const previous = qc.getQueryData<StoreSettings>(queryKeys.storeSettings)
      if (previous) {
        qc.setQueryData<StoreSettings>(queryKeys.storeSettings, {
          ...previous,
          ...patch,
          booking: { ...previous.booking, ...patch.booking },
          walkIn: { ...previous.walkIn, ...patch.walkIn },
        })
      }
      return { previous }
    },
    onError: (_error, _patch, context) => {
      const previous = (context as { previous?: StoreSettings } | undefined)
        ?.previous
      if (previous) qc.setQueryData(queryKeys.storeSettings, previous)
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.storeSettings })
    },
    ...options,
  })
}

export function useConnectIntegration(
  options?: MutationExtras<Integration, string>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.connectIntegration(id),
    ...options,
    onSuccess: (...args) => {
      void qc.invalidateQueries({ queryKey: queryKeys.integrations })
      options?.onSuccess?.(...args)
    },
  })
}

export function useDisconnectIntegration(
  options?: MutationExtras<Integration, string>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.disconnectIntegration(id),
    ...options,
    onSuccess: (...args) => {
      void qc.invalidateQueries({ queryKey: queryKeys.integrations })
      options?.onSuccess?.(...args)
    },
  })
}

export function useUpdatePrinterSettings(
  options?: MutationExtras<PrinterSettings, Partial<PrinterSettings>>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<PrinterSettings>) =>
      api.updatePrinterSettings(patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: queryKeys.printerSettings })
      const previous = qc.getQueryData<PrinterSettings>(
        queryKeys.printerSettings,
      )
      if (previous) {
        qc.setQueryData<PrinterSettings>(queryKeys.printerSettings, {
          ...previous,
          ...patch,
        })
      }
      return { previous }
    },
    onError: (_error, _patch, context) => {
      const previous = (context as { previous?: PrinterSettings } | undefined)
        ?.previous
      if (previous) qc.setQueryData(queryKeys.printerSettings, previous)
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.printerSettings })
    },
    ...options,
  })
}

export function useTestPrinter(
  options?: MutationExtras<PrinterTestResult, void>,
) {
  return useMutation({
    mutationFn: () => api.testPrinter(),
    ...options,
  })
}

export function useUpdateDocketSettings(
  options?: MutationExtras<DocketSettings, Partial<DocketSettings>>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<DocketSettings>) =>
      api.updateDocketSettings(patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: queryKeys.docketSettings })
      const previous = qc.getQueryData<DocketSettings>(queryKeys.docketSettings)
      if (previous) {
        qc.setQueryData<DocketSettings>(queryKeys.docketSettings, {
          ...previous,
          ...patch,
          customerEls: { ...previous.customerEls, ...patch.customerEls },
          shopEls: { ...previous.shopEls, ...patch.shopEls },
        })
      }
      return { previous }
    },
    onError: (_error, _patch, context) => {
      const previous = (context as { previous?: DocketSettings } | undefined)
        ?.previous
      if (previous) qc.setQueryData(queryKeys.docketSettings, previous)
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.docketSettings })
    },
    ...options,
  })
}
