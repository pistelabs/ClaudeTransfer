"use client"

import * as React from "react"

import { djangoWorkshopApi } from "@/lib/api/django-workshop-api"
import { ApiError, isApiConfigured } from "@/lib/api/http"
import { mockWorkshopApi } from "@/lib/api/mock-workshop-api"
import type { WorkshopApi } from "@/lib/api/workshop-api"
import { byPosition, CURRENCY_SYMBOLS, DEFAULT_GENERAL } from "./data"
import type { EquipmentType, Id, Service, ServiceGroup, ServiceInput } from "./types"

/** Django when NEXT_PUBLIC_API_BASE_URL is set, otherwise the in-memory stand-in. */
const api: WorkshopApi = isApiConfigured ? djangoWorkshopApi : mockWorkshopApi

type Status = "loading" | "ready" | "error"

interface WorkshopContextValue {
  status: Status
  error: string | null
  reload: () => void
  /** True while running against the in-memory stand-in rather than Django. */
  usingMockApi: boolean

  equipmentTypes: EquipmentType[]
  /** Equipment types the workshop offers — the only ones assignable to a service. */
  enabledEquipmentTypes: EquipmentType[]
  serviceGroups: ServiceGroup[]
  currencySymbol: string

  createServiceGroup: (name: string) => Promise<ServiceGroup>
  renameServiceGroup: (groupId: Id, name: string) => Promise<void>
  deleteServiceGroup: (groupId: Id) => Promise<void>
  createService: (groupId: Id, input: ServiceInput) => Promise<Service>
  updateService: (serviceId: Id, groupId: Id, input: ServiceInput) => Promise<Service>
  deleteService: (groupId: Id, serviceId: Id) => Promise<void>
}

const WorkshopContext = React.createContext<WorkshopContextValue | null>(null)

export function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return "Something went wrong"
}

export function WorkshopProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<Status>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [equipmentTypes, setEquipmentTypes] = React.useState<EquipmentType[]>([])
  const [serviceGroups, setServiceGroups] = React.useState<ServiceGroup[]>([])
  const [reloadToken, setReloadToken] = React.useState(0)

  // Loads equipment types and service groups; re-runs when reload() bumps the token.
  React.useEffect(() => {
    let cancelled = false

    Promise.all([api.listEquipmentTypes(), api.listServiceGroups()])
      .then(([types, groups]) => {
        if (cancelled) return
        setEquipmentTypes(types)
        setServiceGroups(groups)
        setStatus("ready")
      })
      .catch((cause) => {
        if (cancelled) return
        setError(errorMessage(cause))
        setStatus("error")
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const value = React.useMemo<WorkshopContextValue>(() => {
    const replaceGroup = (groupId: Id, fn: (group: ServiceGroup) => ServiceGroup) =>
      setServiceGroups((groups) => groups.map((g) => (g.id === groupId ? fn(g) : g)))

    return {
      status,
      error,
      usingMockApi: !isApiConfigured,
      reload: () => {
        setStatus("loading")
        setError(null)
        setReloadToken((token) => token + 1)
      },

      equipmentTypes,
      enabledEquipmentTypes: equipmentTypes.filter((type) => type.enabled),
      serviceGroups,
      currencySymbol: CURRENCY_SYMBOLS[DEFAULT_GENERAL.currency],

      async createServiceGroup(name) {
        const group = await api.createServiceGroup(name)
        setServiceGroups((groups) => [...groups, group].sort(byPosition))
        return group
      },

      async renameServiceGroup(groupId, name) {
        const group = await api.updateServiceGroup(groupId, name)
        replaceGroup(groupId, (current) => ({ ...current, name: group.name }))
      },

      async deleteServiceGroup(groupId) {
        await api.deleteServiceGroup(groupId)
        setServiceGroups((groups) => groups.filter((group) => group.id !== groupId))
      },

      async createService(groupId, input) {
        const service = await api.createService(groupId, input)
        replaceGroup(groupId, (group) => ({
          ...group,
          services: [...group.services, service].sort(byPosition),
        }))
        return service
      },

      async updateService(serviceId, groupId, input) {
        const service = await api.updateService(serviceId, groupId, input)
        replaceGroup(groupId, (group) => ({
          ...group,
          services: group.services.map((current) => (current.id === serviceId ? service : current)),
        }))
        return service
      },

      async deleteService(groupId, serviceId) {
        await api.deleteService(serviceId)
        replaceGroup(groupId, (group) => ({
          ...group,
          services: group.services.filter((service) => service.id !== serviceId),
        }))
      },
    }
  }, [status, error, equipmentTypes, serviceGroups])

  return <WorkshopContext.Provider value={value}>{children}</WorkshopContext.Provider>
}

export function useWorkshop() {
  const context = React.useContext(WorkshopContext)
  if (!context) throw new Error("useWorkshop must be used inside a WorkshopProvider")
  return context
}
