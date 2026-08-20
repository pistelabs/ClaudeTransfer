import type {
  Appointment,
  AppointmentGroup,
  AppointmentInput,
  EquipmentType,
  Id,
  Service,
  ServiceGroup,
  ServiceInput,
} from "@/lib/workshop/types"

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

  /** Appointment types with their appointments nested, ordered by position. */
  listAppointmentGroups(): Promise<AppointmentGroup[]>

  createAppointmentGroup(name: string): Promise<AppointmentGroup>
  updateAppointmentGroup(id: Id, name: string): Promise<AppointmentGroup>
  deleteAppointmentGroup(id: Id): Promise<void>

  createAppointment(groupId: Id, input: AppointmentInput): Promise<Appointment>
  updateAppointment(id: Id, groupId: Id, input: AppointmentInput): Promise<Appointment>
  deleteAppointment(id: Id): Promise<void>
}
