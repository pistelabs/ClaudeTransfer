/**
 * Base URL of the Django API, e.g. `http://localhost:8000/api`.
 *
 * Set `VITE_API_BASE_URL` (see `.env.example`) to talk to a real backend. When
 * it is empty the app falls back to the in-memory mock server in `api/mock/`,
 * which serves the same shapes so no UI code changes when the backend lands.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const usingLiveApi = API_BASE_URL !== '';

/** Latency the mock server simulates, so loading states get exercised. */
export const MOCK_LATENCY_MS = 120;
