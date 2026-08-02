import { ApiClientError, NetworkError } from '@/lib/apiClient';

/**
 * Maps backend machine codes (stable contract) to user-facing copy.
 * The UI must never branch on backend message strings.
 * Copy is deliberately generic — it must not reveal account existence.
 */
const CODE_MESSAGES: Record<string, string> = {
  AUTH_PHONE_INVALID: 'Please enter a valid mobile number.',
  AUTH_OTP_INVALID: 'That code is not valid. Please check and try again.',
  AUTH_OTP_EXPIRED: 'That code has expired. Please request a new one.',
  AUTH_OTP_RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  AUTH_INVALID_CREDENTIALS: 'We could not verify those details. Please try again.',
  AUTH_PIN_WEAK: 'That PIN is too easy to guess. Please choose a different one.',
  AUTH_PIN_MISMATCH: 'The PINs you entered do not match.',
  AUTH_RESET_TICKET_INVALID: 'This request is no longer valid. Please start again.',
  AUTH_SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  AUTH_PROVIDER_UNAVAILABLE: 'The verification service is briefly unavailable. Please try again shortly.',
  AUTH_USER_EXISTS: 'An account already exists for this number. Please sign in instead.',
  AUTH_FEATURE_DISABLED: 'This feature is not available right now.',
};

export interface AuthUiError {
  message: string;
  /** Seconds the user should wait (429s). */
  retryAfterSeconds?: number;
  offline?: boolean;
}

export function toAuthUiError(err: unknown): AuthUiError {
  if (err instanceof NetworkError) {
    return { message: 'No connection. Please check your network and try again.', offline: true };
  }
  if (err instanceof ApiClientError) {
    const known = CODE_MESSAGES[err.code];
    if (known) return { message: known, retryAfterSeconds: err.retryAfterSeconds };
    if (err.statusCode === 429) {
      return {
        message: 'Too many attempts. Please wait a moment and try again.',
        retryAfterSeconds: err.retryAfterSeconds,
      };
    }
    if (err.statusCode === 503) {
      return { message: CODE_MESSAGES.AUTH_PROVIDER_UNAVAILABLE };
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
  return { message: 'Something went wrong. Please try again.' };
}
