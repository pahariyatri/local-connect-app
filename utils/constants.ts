/**
 * Backend host, no /api/v1 suffix (apiClient.ts appends it).
 * NEXT_PUBLIC_API_BASE_URL should be set per-environment (Vercel dashboard
 * for Preview/Production — see backend/docs/vercel-environments.md). This
 * fallback only covers the case where it's unset: local dev falls back to
 * localhost, and production builds fall back to the live API rather than
 * silently pointing at localhost.
 */
const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === 'production' ? 'https://api.pahariyatri.com' : 'http://localhost:4000';

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL) + '/api/v1';

/**
 * Active authentication mode.
 *   'pin' — single-step phone+PIN entry point (`POST /auth/phone/check` +
 *           `POST /auth/pin/signup`). Backend keeps both routes behind
 *           AUTH_DIRECT_PIN_SIGNUP, OFF by default in production (account-
 *           enumeration oracle by design) — so this mode 404s there unless
 *           that flag is deliberately enabled. Opt in locally with
 *           NEXT_PUBLIC_AUTH_MODE=pin.
 *   'otp' — default. Existing users sign in directly via `/auth/pin/login`
 *           (no gated endpoint involved); new users verify via real OTP.
 *           Both routes are always enabled in production.
 * OTP screens/services stay in the codebase either way — this flag only
 * decides which flow the login entry point routes into.
 *
 * 2026-08-03: enabled in production (NEXT_PUBLIC_AUTH_MODE=pin,
 * AUTH_DIRECT_PIN_SIGNUP=true) as a temporary bridge while a real OTP
 * provider is provisioned. Revert both once MSG91/DLT is live.
 */
export const AUTH_MODE: 'pin' | 'otp' =
  process.env.NEXT_PUBLIC_AUTH_MODE === 'pin' ? 'pin' : 'otp';

/**
 * Centralized API endpoint constants.
 * 
 * NOTE: All paths here are relative to the API base URL which already
 * includes the /api/v1 prefix (set in apiClient.ts).
 * So paths here start from the resource name (e.g. /auth/send-otp).
 */
export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    GOOGLE_LOGIN: '/auth/google-login',
    LOGIN_AS_GUEST: '/auth/login-as-guest',
    ME: '/auth/me',
  },
  USERS: {
    CREATE: '/users',
    GET_ALL: '/users',
    GET_ME: '/auth/me',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  VENDORS: {
    CREATE: '/vendors',
    GET_ALL: '/vendors',
    GET_BY_ID: (id: string) => `/vendors/${id}`,
    UPDATE: (id: string) => `/vendors/${id}`,
    DELETE: (id: string) => `/vendors/${id}`,
    GET_SERVICES: (id: string) => `/vendors/${id}/services`,
  },
  PARTNERSHIP: {
    CREATE: '/partnership',
    GET_ALL: '/partnership',
    GET_BY_ID: (id: string) => `/partnership/${id}`,
    UPDATE: (id: string) => `/partnership/${id}`,
    DELETE: (id: string) => `/partnership/${id}`,
  },
  CATEGORIES: {
    AUTOCOMPLETE: '/categories/autocomplete',
    CREATE: '/categories',
    GET_ALL: '/categories',
    GET_BY_ID: (id: string) => `/categories/${id}`,
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
    GET_SUBCATEGORIES: (id: string) => `/categories/${id}/subcategories`,
  },
  VENDOR_SERVICES: {
    FILTER: '/service/filter',
    DISCOVER: '/service/discover',
    CREATE: (vendorId: string) => `/service/${vendorId}`,
    GET_ALL: '/service',
    GET_BY_ID: (id: string) => `/service/${id}`,
    UPDATE: (id: string) => `/service/${id}`,
    DELETE: (vendorId: string, id: string) => `/service/${vendorId}/${id}`,
  },
  ADDRESS: {
    CREATE: '/address',
    GET_ALL: '/address',
    GET_BY_ID: (id: string) => `/address/${id}`,
    UPDATE: (id: string) => `/address/${id}`,
    DELETE: (id: string) => `/address/${id}`,
  },
  ITINERARY: {
    GENERATE: (packageId: string) => `/itinerary/${packageId}/generate`,
    GET_BY_ID: (id: string) => `/itinerary/${id}`,
    UPDATE: (id: string) => `/itinerary/${id}`,
    DELETE: (id: string) => `/itinerary/${id}`,
    SHARE: (id: string) => `/itinerary/${id}/share`,
  },
  TRIP: {
    CREATE: '/trip',
    GET_ALL: '/trip',
    GET_BY_ID: (id: string | number) => `/trip/${id}`,
    UPDATE: (id: string | number) => `/trip/${id}`,
    DELETE: (id: string | number) => `/trip/${id}`,
  },
  BOOKING: {
    CREATE: '/booking',
    GET_ALL: '/booking',
    GET_BY_ID: (id: string) => `/booking/${id}`,
    CANCEL: (id: string) => `/booking/${id}/cancel`,
  },
  PAYMENT: {
    CREATE_ORDER: (bookingId: string) => `/payments/create-order/${bookingId}`,
    VERIFY: '/payments/verify',
    GET_ALL: '/payments',
    GET_BY_ID: (id: string) => `/payments/${id}`,
  },
  SESSIONS: {
    START: '/sessions/start',
    EVENT: '/sessions/event',
    LINK_USER: (sessionId: string, userId: string) => `/sessions/${sessionId}/link-user/${userId}`,
    ANALYTICS_FUNNEL: '/sessions/analytics/funnel',
    ANALYTICS_DESTINATIONS: '/sessions/analytics/destinations',
    ANALYTICS_VENDORS: '/sessions/analytics/vendors',
    ANALYTICS_TRAFFIC: '/sessions/analytics/traffic',
    ANALYTICS_DEVICES: '/sessions/analytics/devices',
    ANALYTICS_ABANDONED: '/sessions/analytics/abandoned',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    BOOKINGS: '/admin/bookings',
    VENDORS: '/admin/vendors',
    VERIFY_VENDOR: (id: string) => `/admin/vendor/${id}/verify`,
    REVENUE: '/admin/revenue',
    VENDOR_ANALYTICS: '/admin/vendor-analytics',
  },
  S3: {
    UPLOAD: '/s3/upload',
    DOWNLOAD: (key: string) => `/s3/download/${key}`,
    DELETE: (key: string) => `/s3/delete/${key}`,
  },
  HEALTH: '/health',
};
