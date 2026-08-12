import { usingLiveApi } from './config';
import { liveApi } from './live';
import { mockApi } from './mock/server';
import type { CustomersApi } from './types';

/**
 * The API the app talks to: the Django backend when `VITE_API_BASE_URL` is
 * set, the in-memory mock otherwise.
 */
export const api: CustomersApi = usingLiveApi ? liveApi : mockApi;

export { ApiError } from './http';
export { usingLiveApi } from './config';
export type { CustomersApi } from './types';
