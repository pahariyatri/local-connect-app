import { ApiClientError, NetworkError } from '@/lib/apiClient';

/**
 * Maps backend machine codes (stable contract) to user-facing copy.
 * The UI must never branch on backend message strings.
 * Copy is deliberately generic — it must not reveal account existence.
 *
 * English fallback, used when a caller doesn't pass a localized `messages`
 * map (e.g. verify-otp/page.tsx, not yet wired to locales/{locale}/traveler.json)
 * and as the default for any key missing from a map that is passed.
 */
const CODE_MESSAGES: Record<string, string> = {
  AUTH_PHONE_INVALID: 'Please enter a valid mobile number.',
  AUTH_OTP_INVALID: 'That code is not valid. Please check and try again.',
  AUTH_OTP_EXPIRED: 'That code has expired. Please request a new one.',
  AUTH_OTP_RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  AUTH_INVALID_CREDENTIALS: 'That PIN doesn\'t match this number. Try again or reset it below.',
  AUTH_PIN_WEAK: 'That PIN is too easy to guess. Please choose a different one.',
  AUTH_PIN_MISMATCH: 'The PINs you entered do not match.',
  AUTH_RESET_TICKET_INVALID: 'This request is no longer valid. Please start again.',
  AUTH_SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  AUTH_PROVIDER_UNAVAILABLE: 'PIN reset isn\'t available right now — please try again in a few minutes.',
  AUTH_USER_EXISTS: 'An account already exists for this number. Please sign in instead.',
  AUTH_FEATURE_DISABLED: 'This feature is not available right now.',
  RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  OFFLINE: 'No connection. Please check your network and try again.',
  GENERIC: 'Something went wrong. Please try again.',
};

export interface AuthUiError {
  message: string;
  /** Seconds the user should wait (429s). */
  retryAfterSeconds?: number;
  offline?: boolean;
}

/**
 * @param messages Optional localized override map (same keys as CODE_MESSAGES,
 * e.g. locales/{locale}/traveler.json's `auth.errors`). Falls back to the
 * English default per-key, so a caller's map doesn't need every key filled in.
 */
export function toAuthUiError(err: unknown, messages?: Record<string, string>): AuthUiError {
  const m = { ...CODE_MESSAGES, ...messages };

  if (err instanceof NetworkError) {
    return { message: m.OFFLINE, offline: true };
  }
  if (err instanceof ApiClientError) {
    const known = m[err.code];
    if (known) return { message: known, retryAfterSeconds: err.retryAfterSeconds };
    if (err.statusCode === 429) {
      return { message: m.RATE_LIMITED, retryAfterSeconds: err.retryAfterSeconds };
    }
    if (err.statusCode === 503) {
      return { message: m.AUTH_PROVIDER_UNAVAILABLE };
    }
    // Unmapped code: this is deliberately NOT the anti-enumeration path above
    // (those known codes always keep their generic copy). Everything else —
    // validation errors, unexpected 500s, edge cases we haven't named yet —
    // shows the backend's own message instead of a vague catch-all, so a
    // real failure is diagnosable instead of hidden. The backend's global
    // exception filter (http-exception.filter.ts) already collapses truly
    // unexpected exceptions to a safe "Internal server error" string, so
    // this never leaks stack traces or internals.
    if (err.message) return { message: err.message, retryAfterSeconds: err.retryAfterSeconds };
  }
  return { message: m.GENERIC };
}
