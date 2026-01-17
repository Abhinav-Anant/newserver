/**
 * Storage keys for client-side data
 */
export const STORAGE_KEYS = {
  PROFILE_ID: 'leo_prime_profile_id',
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  PROFILES: '/api/profiles',
} as const;

/**
 * HTTP status codes with descriptions
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
