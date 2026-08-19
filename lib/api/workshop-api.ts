import type { EquipmentType, Id, Service, ServiceGroup, ServiceInput } from "@/lib/workshop/types"

/**
 * Everything the admin console needs from the backend. The Django adapter talks
 * to DRF; the mock adapter keeps the same data in memory so the UI still runs
 * with no backend configured.
 */
export interface WorkshopApi {
  /** Equipment types defined in Django, including the ones not currently offered. */
  listEquipmentTypes(): Promise<EquipmentType[]>
  /** Service groups with their services nested, ordered by position. */
  listServiceGroups(): Promise<ServiceGroup[]>

  createServiceGroup(name: string): Promise<ServiceGroup>
  updateServiceGroup(id: Id, name: string): Promise<ServiceGroup>
  deleteServiceGroup(id: Id): Promise<void>

  createService(groupId: Id, input: ServiceInput): Promise<Service>
  updateService(id: Id, groupId: Id, input: ServiceInput): Promise<Service>
  deleteService(id: Id): Promise<void>
}
