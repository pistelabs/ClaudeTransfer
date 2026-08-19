import { apiRequest, unwrapList } from "./http"
import type { EquipmentTypeDto, ServiceDto, ServiceGroupDto } from "./dto"
import { fromServiceInput, toEquipmentType, toService, toServiceGroup } from "./serializers"
import type { WorkshopApi } from "./workshop-api"

/** Endpoints are documented in docs/django-api.md. */
export const djangoWorkshopApi: WorkshopApi = {
  async listEquipmentTypes() {
    const body = await apiRequest<EquipmentTypeDto[] | { results: EquipmentTypeDto[] }>(
      "/equipment-types/",
    )
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
}
