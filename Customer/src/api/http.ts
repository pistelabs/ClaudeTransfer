import { API_BASE_URL } from './config';

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** Django's CSRF cookie, required on unsafe methods with session auth. */
function csrfToken(): string | null {
  const match = /(?:^|;\s*)csrftoken=([^;]*)/.exec(document.cookie);
  return match ? decodeURIComponent(match[1]) : null;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Thin fetch wrapper: JSON in and out, session cookies attached, DRF errors
 * surfaced as `ApiError` so callers can show the message the server sent.
 */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method ?? 'GET';
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  // FormData must set its own content type so the multipart boundary survives.
  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = csrfToken();
    if (token) headers.set('X-CSRFToken', token);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method,
    headers,
    credentials: 'include',
  });

  const body = await parseBody(response);

  if (!response.ok) {
    const detail =
      body && typeof body === 'object' && 'detail' in body
        ? String((body as { detail: unknown }).detail)
        : `${method} ${path} failed with ${response.status}`;
    throw new ApiError(response.status, detail, body);
  }

  return body as T;
}
