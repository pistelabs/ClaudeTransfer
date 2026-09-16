import { USE_MOCK_API } from "./config"
import { httpApi } from "./http-api"
import { mockApi } from "./mock-api"
import type { StoreApi } from "./types"

/** The adapter the app talks to: Django when configured, mock otherwise. */
export const api: StoreApi = USE_MOCK_API ? mockApi : httpApi

export { USE_MOCK_API, API_BASE_URL, setAuthTokenGetter } from "./config"
export { ApiError } from "./http"
export type { Paginated } from "./http"
export { endpoints } from "./endpoints"
export type { StoreApi, StaffInput, TimeBlockInput, LeaveInput } from "./types"
