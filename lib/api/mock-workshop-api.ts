import { emptyAppointmentInput, emptyServiceInput } from "@/lib/workshop/data"
import type {
  Appointment,
  AppointmentGroup,
  AppointmentInput,
  EquipmentType,
  Service,
  ServiceGroup,
  ServiceInput,
} from "@/lib/workshop/types"
import type { WorkshopApi } from "./workshop-api"

/**
 * Stand-in for the Django backend so the console runs (and the design can be
 * reviewed) with NEXT_PUBLIC_API_BASE_URL unset. It mimics the server contract:
 * ids are assigned here, and every call returns a fresh copy.
 */

const EQUIPMENT_TYPE_NAMES = [
  "Alpine Ski",
  "Touring Ski",
  "Race Ski",
  "Snowboard",
  "Powder Board",
  "Splitboard",
  "Kids Ski",
  "Kids Board",
  "Mountain Bike",
  "Road Bike",
  "Electric Bike",
  "Kids Bike",
  "Alpine Ski Boots",
  "Touring Ski Boots",
  "Snowboard Boots",
  "Other",
]

const ENABLED_BY_DEFAULT = new Set([
  "Alpine Ski",
  "Touring Ski",
  "Snowboard",
  "Alpine Ski Boots",
  "Snowboard Boots",
])

const equipmentTypes: EquipmentType[] = EQUIPMENT_TYPE_NAMES.map((name, index) => ({
  id: String(index + 1),
  name,
  enabled: ENABLED_BY_DEFAULT.has(name),
}))

let nextId = 100
const assignId = () => String(++nextId)

function seedService(groupId: string, position: number, overrides: Partial<Service>): Service {
  return { ...emptyServiceInput(), id: assignId(), groupId, position, ...overrides }
}

const groups: ServiceGroup[] = [
  {
    id: "1",
    name: "Standard tunes",
    position: 0,
    services: [
      seedService("1", 0, {
        name: "Full Tune",
        description: "Base grind, edge sharpen, hot wax",
        price: 170,
        color: "#3b82f6",
        duration: 45,
        equipmentTypeIds: ["1", "2"],
      }),
      seedService("1", 1, {
        name: "Hot Wax",
        price: 40,
        color: "#22c55e",
        duration: 15,
        equipmentTypeIds: ["1", "4"],
      }),
    ],
  },
  { id: "2", name: "Bootwork", position: 1, services: [] },
  { id: "3", name: "Extras", position: 2, services: [] },
]

function seedAppointment(
  groupId: string,
  position: number,
  overrides: Partial<Appointment>,
): Appointment {
  return { ...emptyAppointmentInput(), id: assignId(), groupId, position, ...overrides }
}

const appointmentGroups: AppointmentGroup[] = [
  {
    id: "1",
    name: "Standard",
    position: 0,
    appointments: [
      seedAppointment("1", 0, {
        name: "Boot Fitting",
        description: "In-store fitting consultation",
        color: "#0284c7",
        duration: 45,
        price: 60,
        equipmentTypeIds: ["13"],
      }),
      seedAppointment("1", 1, {
        mode: "checkin",
        name: "Service Drop-off",
        color: "#0d9488",
        duration: 15,
      }),
    ],
  },
  { id: "2", name: "Premium", position: 1, appointments: [] },
]

const clone = <T>(value: T): T => structuredClone(value)

/** Small delay so loading states behave like they will against a real API. */
const settle = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(clone(value)), 120))

function findGroup(groupId: string) {
  const group = groups.find((candidate) => candidate.id === groupId)
  if (!group) throw new Error("Service group " + groupId + " not found")
  return group
}

function findAppointmentGroup(groupId: string) {
  const group = appointmentGroups.find((candidate) => candidate.id === groupId)
  if (!group) throw new Error("Appointment type " + groupId + " not found")
  return group
}

export const mockWorkshopApi: WorkshopApi = {
  listEquipmentTypes: () => settle(equipmentTypes),

  listServiceGroups: () => settle(groups),

  createServiceGroup(name) {
    const group: ServiceGroup = { id: assignId(), name, position: groups.length, services: [] }
    groups.push(group)
    return settle(group)
  },

  updateServiceGroup(id, name) {
    const group = findGroup(id)
    group.name = name
    return settle(group)
  },

  deleteServiceGroup(id) {
    const index = groups.findIndex((group) => group.id === id)
    if (index > -1) groups.splice(index, 1)
    return settle(undefined as void)
  },

  createService(groupId, input: ServiceInput) {
    const group = findGroup(groupId)
    const service: Service = {
      ...clone(input),
      id: assignId(),
      groupId,
      position: group.services.length,
    }
    group.services.push(service)
    return settle(service)
  },

  updateService(id, groupId, input: ServiceInput) {
    const group = findGroup(groupId)
    const index = group.services.findIndex((service) => service.id === id)
    if (index === -1) throw new Error("Service " + id + " not found")
    const service: Service = {
      ...clone(input),
      id,
      groupId,
      position: group.services[index].position,
    }
    group.services[index] = service
    return settle(service)
  },

  deleteService(id) {
    for (const group of groups) {
      const index = group.services.findIndex((service) => service.id === id)
      if (index > -1) {
        group.services.splice(index, 1)
        break
      }
    }
    return settle(undefined as void)
  },

  listAppointmentGroups: () => settle(appointmentGroups),

  createAppointmentGroup(name) {
    const group: AppointmentGroup = {
      id: assignId(),
      name,
      position: appointmentGroups.length,
      appointments: [],
    }
    appointmentGroups.push(group)
    return settle(group)
  },

  updateAppointmentGroup(id, name) {
    const group = findAppointmentGroup(id)
    group.name = name
    return settle(group)
  },

  deleteAppointmentGroup(id) {
    const index = appointmentGroups.findIndex((group) => group.id === id)
    if (index > -1) appointmentGroups.splice(index, 1)
    return settle(undefined as void)
  },

  createAppointment(groupId, input: AppointmentInput) {
    const group = findAppointmentGroup(groupId)
    const appointment: Appointment = {
      ...clone(input),
      id: assignId(),
      groupId,
      position: group.appointments.length,
    }
    group.appointments.push(appointment)
    return settle(appointment)
  },

  updateAppointment(id, groupId, input: AppointmentInput) {
    const group = findAppointmentGroup(groupId)
    const index = group.appointments.findIndex((appointment) => appointment.id === id)
    if (index === -1) throw new Error("Appointment " + id + " not found")
    const appointment: Appointment = {
      ...clone(input),
      id,
      groupId,
      position: group.appointments[index].position,
    }
    group.appointments[index] = appointment
    return settle(appointment)
  },

  deleteAppointment(id) {
    for (const group of appointmentGroups) {
      const index = group.appointments.findIndex((appointment) => appointment.id === id)
      if (index > -1) {
        group.appointments.splice(index, 1)
        break
      }
    }
    return settle(undefined as void)
  },
}
