"use client"

import * as React from "react"

import {
  DEFAULT_EQUIPMENT_TYPES,
  DEFAULT_GENERAL,
  DEFAULT_SERVICE_GROUPS,
  EQUIPMENT_TYPES,
  CURRENCY_SYMBOLS,
  uid,
} from "./data"
import type { GeneralSettings, Service, ServiceGroup } from "./types"

interface WorkshopState {
  general: GeneralSettings
  equipmentTypes: Record<string, boolean>
  serviceGroups: ServiceGroup[]
}

interface WorkshopContextValue extends WorkshopState {
  currencySymbol: string
  /** Equipment types enabled under the Equipment Types section, in canonical order. */
  enabledEquipmentTypes: string[]
  addServiceGroup: (name: string) => string
  renameServiceGroup: (groupId: string, name: string) => void
  deleteServiceGroup: (groupId: string) => void
  saveService: (groupId: string, service: Service) => void
  deleteService: (groupId: string, serviceId: string) => void
  duplicateService: (groupId: string, serviceId: string) => void
  toggleServiceVisibility: (groupId: string, serviceId: string) => void
}

const WorkshopContext = React.createContext<WorkshopContextValue | null>(null)

export function WorkshopProvider({ children }: { children: React.ReactNode }) {
  const [general] = React.useState<GeneralSettings>(DEFAULT_GENERAL)
  const [equipmentTypes] = React.useState<Record<string, boolean>>(DEFAULT_EQUIPMENT_TYPES)
  const [serviceGroups, setServiceGroups] = React.useState<ServiceGroup[]>(DEFAULT_SERVICE_GROUPS)

  const value = React.useMemo<WorkshopContextValue>(() => {
    const enabled = EQUIPMENT_TYPES.filter((name) => equipmentTypes[name])

    const mapGroup = (groupId: string, fn: (group: ServiceGroup) => ServiceGroup) =>
      setServiceGroups((groups) => groups.map((g) => (g.id === groupId ? fn(g) : g)))

    return {
      general,
      equipmentTypes,
      serviceGroups,
      currencySymbol: CURRENCY_SYMBOLS[general.currency],
      enabledEquipmentTypes: enabled.length ? [...enabled] : [...EQUIPMENT_TYPES],

      addServiceGroup(name) {
        const id = uid("g")
        setServiceGroups((groups) => [...groups, { id, name, services: [] }])
        return id
      },
      renameServiceGroup(groupId, name) {
        mapGroup(groupId, (group) => ({ ...group, name }))
      },
      deleteServiceGroup(groupId) {
        setServiceGroups((groups) => groups.filter((g) => g.id !== groupId))
      },
      saveService(groupId, service) {
        mapGroup(groupId, (group) => ({
          ...group,
          services: group.services.some((s) => s.id === service.id)
            ? group.services.map((s) => (s.id === service.id ? service : s))
            : [...group.services, service],
        }))
      },
      deleteService(groupId, serviceId) {
        mapGroup(groupId, (group) => ({
          ...group,
          services: group.services.filter((s) => s.id !== serviceId),
        }))
      },
      duplicateService(groupId, serviceId) {
        mapGroup(groupId, (group) => {
          const index = group.services.findIndex((s) => s.id === serviceId)
          if (index === -1) return group
          const original = group.services[index]
          const copy: Service = {
            ...structuredClone(original),
            id: uid("s"),
            name: original.name + " (copy)",
          }
          const services = [...group.services]
          services.splice(index + 1, 0, copy)
          return { ...group, services }
        })
      },
      toggleServiceVisibility(groupId, serviceId) {
        mapGroup(groupId, (group) => ({
          ...group,
          services: group.services.map((s) =>
            s.id === serviceId ? { ...s, disabled: !s.disabled } : s,
          ),
        }))
      },
    }
  }, [general, equipmentTypes, serviceGroups])

  return <WorkshopContext.Provider value={value}>{children}</WorkshopContext.Provider>
}

export function useWorkshop() {
  const context = React.useContext(WorkshopContext)
  if (!context) throw new Error("useWorkshop must be used inside a WorkshopProvider")
  return context
}
