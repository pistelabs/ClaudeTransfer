import { API_BASE_URL, ApiError, apiRequest, csrfHeader, unwrapList } from "./http"
import type {
  AppointmentDto,
  AppointmentGroupDto,
  CompanySendingDomainDto,
  EquipmentTypeDto,
  GeneralSettingsDto,
  NotificationEventDto,
  ServiceDto,
  ServiceGroupDto,
} from "./dto"
import {
  fromAppointmentInput,
  fromGeneralSettings,
  fromNotificationEventInput,
  fromServiceInput,
  toAppointment,
  toAppointmentGroup,
  toEquipmentType,
  toGeneralSettings,
  toNotificationEvent,
  toService,
  toServiceGroup,
} from "./serializers"
import type { WorkshopApi } from "./workshop-api"

/** Endpoints are documented in docs/django-api.md. */
export const djangoWorkshopApi: WorkshopApi = {
  async getGeneralSettings() {
    const dto = await apiRequest<GeneralSettingsDto>("/general-settings/")
    return toGeneralSettings(dto)
  },

  async updateGeneralSettings(general) {
    const dto = await apiRequest<GeneralSettingsDto>("/general-settings/", {
      method: "PATCH",
      json: fromGeneralSettings(general),
    })
    return toGeneralSettings(dto)
  },

  async uploadLogo(file) {
    // Multipart, so no JSON content-type here — the browser sets the boundary.
    const form = new FormData()
    form.append("logo", file)
    const response = await fetch(API_BASE_URL + "/general-settings/logo/", {
      method: "POST",
      body: form,
      credentials: "include",
      headers: csrfHeader(),
    })
    if (!response.ok) throw new ApiError("Could not upload the logo", response.status)
    return toGeneralSettings((await response.json()) as GeneralSettingsDto)
  },

  async removeLogo() {
    const dto = await apiRequest<GeneralSettingsDto>("/general-settings/logo/", {
      method: "DELETE",
    })
    return toGeneralSettings(dto)
  },

  async listEquipmentTypes() {
    const body = await apiRequest<EquipmentTypeDto[] | { results: EquipmentTypeDto[] }>(
      "/equipment-types/",
    )
    return unwrapList(body).map(toEquipmentType)
  },

  async setEnabledEquipmentTypes(enabledIds) {
    const body = await apiRequest<EquipmentTypeDto[]>("/equipment-types/set-enabled/", {
      method: "POST",
      json: { enabled: enabledIds },
    })
    return unwrapList(body).map(toEquipmentType)
  },

  async listServiceGroups() {
    const body = await apiRequest<ServiceGroupDto[] | { results: ServiceGroupDto[] }>(
      "/service-groups/",
    )
    return unwrapList(body)
      .map(toServiceGroup)
      .map((group) => ({
        ...group,
        services: [...group.services].sort((a, b) => a.position - b.position),
      }))
      .sort((a, b) => a.position - b.position)
  },

  async createServiceGroup(name) {
    const dto = await apiRequest<ServiceGroupDto>("/service-groups/", {
      method: "POST",
      json: { name },
    })
    return toServiceGroup(dto)
  },

  async updateServiceGroup(id, name) {
    const dto = await apiRequest<ServiceGroupDto>("/service-groups/" + id + "/", {
      method: "PATCH",
      json: { name },
    })
    return toServiceGroup(dto)
  },

  async deleteServiceGroup(id) {
    await apiRequest<void>("/service-groups/" + id + "/", { method: "DELETE" })
  },

  async reorderServices(groupId, orderedIds) {
    await apiRequest<void>("/service-groups/" + groupId + "/reorder/", {
      method: "POST",
      json: { services: orderedIds },
    })
  },

  async createService(groupId, input) {
    const dto = await apiRequest<ServiceDto>("/services/", {
      method: "POST",
      json: fromServiceInput(groupId, input),
    })
    return toService(dto)
  },

  async updateService(id, groupId, input) {
    const dto = await apiRequest<ServiceDto>("/services/" + id + "/", {
      method: "PUT",
      json: fromServiceInput(groupId, input),
    })
    return toService(dto)
  },

  async deleteService(id) {
    await apiRequest<void>("/services/" + id + "/", { method: "DELETE" })
  },

  async listAppointmentGroups() {
    const body = await apiRequest<AppointmentGroupDto[] | { results: AppointmentGroupDto[] }>(
      "/appointment-groups/",
    )
    return unwrapList(body)
      .map(toAppointmentGroup)
      .map((group) => ({
        ...group,
        appointments: [...group.appointments].sort((a, b) => a.position - b.position),
      }))
      .sort((a, b) => a.position - b.position)
  },

  async createAppointmentGroup(name) {
    const dto = await apiRequest<AppointmentGroupDto>("/appointment-groups/", {
      method: "POST",
      json: { name },
    })
    return toAppointmentGroup(dto)
  },

  async updateAppointmentGroup(id, name) {
    const dto = await apiRequest<AppointmentGroupDto>("/appointment-groups/" + id + "/", {
      method: "PATCH",
      json: { name },
    })
    return toAppointmentGroup(dto)
  },

  async deleteAppointmentGroup(id) {
    await apiRequest<void>("/appointment-groups/" + id + "/", { method: "DELETE" })
  },

  async reorderAppointments(groupId, orderedIds) {
    await apiRequest<void>("/appointment-groups/" + groupId + "/reorder/", {
      method: "POST",
      json: { appointments: orderedIds },
    })
  },

  async createAppointment(groupId, input) {
    const dto = await apiRequest<AppointmentDto>("/appointments/", {
      method: "POST",
      json: fromAppointmentInput(groupId, input),
    })
    return toAppointment(dto)
  },

  async updateAppointment(id, groupId, input) {
    const dto = await apiRequest<AppointmentDto>("/appointments/" + id + "/", {
      method: "PUT",
      json: fromAppointmentInput(groupId, input),
    })
    return toAppointment(dto)
  },

  async deleteAppointment(id) {
    await apiRequest<void>("/appointments/" + id + "/", { method: "DELETE" })
  },

  async getSendingDomain() {
    const dto = await apiRequest<CompanySendingDomainDto>("/sending-domain/")
    return dto.address
  },

  async listNotificationEvents() {
    const body = await apiRequest<NotificationEventDto[] | { results: NotificationEventDto[] }>(
      "/notifications/",
    )
    return unwrapList(body)
      .map(toNotificationEvent)
      .sort((a, b) => a.position - b.position)
  },

  async updateNotificationEvent(id, input) {
    const dto = await apiRequest<NotificationEventDto>("/notifications/" + id + "/", {
      method: "PATCH",
      json: fromNotificationEventInput(input),
    })
    return toNotificationEvent(dto)
  },

  async sendNotificationTest(id, channel, recipient) {
    await apiRequest<void>("/notifications/" + id + "/send-test/", {
      method: "POST",
      json: { channel, recipient },
    })
  },
}
