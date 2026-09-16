import {
  API_BASE_URL,
  AUTH_SCHEME,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  WITH_CREDENTIALS,
  getAuthToken,
} from "./config"

/** A DRF `PageNumberPagination` / `LimitOffsetPagination` envelope. */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * A failed request. `fieldErrors` carries DRF's per-field validation messages
 * ({"email": ["Enter a valid email address."]}) so forms can surface them.
 */
export class ApiError extends Error {
  readonly status: number
  readonly detail: string
  readonly fieldErrors: Record<string, string[]>
  readonly payload: unknown

  constructor(
    status: number,
    detail: string,
    fieldErrors: Record<string, string[]> = {},
    payload: unknown = null
  ) {
    super(detail)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
    this.fieldErrors = fieldErrors
    this.payload = payload
  }

  /** First message for a field, if the backend rejected it. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0]
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"])

function buildUrl(path: string, params?: QueryParams): string {
  const base = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
  if (!params) return base

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)))
    } else {
      search.append(key, String(value))
    }
  }
  const query = search.toString()
  return query ? `${base}${base.includes("?") ? "&" : "?"}${query}` : base
}

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null | (string | number)[]
>

export interface RequestOptions {
  method?: string
  body?: unknown
  params?: QueryParams
  signal?: AbortSignal
  headers?: Record<string, string>
}

function normalizeErrorPayload(
  status: number,
  payload: unknown
): ApiError {
  if (typeof payload === "string" && payload.trim()) {
    return new ApiError(status, payload, {}, payload)
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>

    // DRF's APIException shape: {"detail": "Not found."}
    if (typeof record.detail === "string") {
      return new ApiError(status, record.detail, {}, payload)
    }

    // Serializer errors: {"field": ["msg"], "non_field_errors": ["msg"]}
    const fieldErrors: Record<string, string[]> = {}
    for (const [key, value] of Object.entries(record)) {
      if (Array.isArray(value)) {
        fieldErrors[key] = value.map(String)
      } else if (typeof value === "string") {
        fieldErrors[key] = [value]
      }
    }
    const first =
      fieldErrors.non_field_errors?.[0] ??
      fieldErrors.detail?.[0] ??
      Object.values(fieldErrors)[0]?.[0]
    return new ApiError(
      status,
      first ?? `Request failed with status ${status}`,
      fieldErrors,
      payload
    )
  }

  return new ApiError(status, `Request failed with status ${status}`, {}, payload)
}

/**
 * Thin fetch wrapper for the Django backend: adds CSRF and auth headers,
 * serializes JSON, and turns DRF error bodies into a typed `ApiError`.
 */
export async function request<T>(
  path: string,
  { method = "GET", body, params, signal, headers = {} }: RequestOptions = {}
): Promise<T> {
  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData
  if (body !== undefined && !isFormData) {
    requestHeaders["Content-Type"] = "application/json"
  }

  if (!SAFE_METHODS.has(method.toUpperCase())) {
    const csrf = readCookie(CSRF_COOKIE_NAME)
    if (csrf) requestHeaders[CSRF_HEADER_NAME] = csrf
  }

  const token = getAuthToken()
  if (token) requestHeaders.Authorization = `${AUTH_SCHEME} ${token}`

  let response: Response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers: requestHeaders,
      credentials: WITH_CREDENTIALS ? "include" : "same-origin",
      signal,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause
    throw new ApiError(0, "Could not reach the server.", {}, cause)
  }

  if (response.status === 204) return undefined as T

  const contentType = response.headers.get("content-type") ?? ""
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text()

  if (!response.ok) throw normalizeErrorPayload(response.status, payload)

  return payload as T
}

/** Collapses a paginated list endpoint to a plain array. */
export function unwrapList<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.results
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T = void>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
}
