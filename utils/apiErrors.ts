import { ApiClientError, NetworkError } from '@/lib/apiClient';

/**
 * General-purpose backend-error -> user-facing-copy mapper, for everything
 * outside the auth flow (which keeps its own `toAuthUiError` in
 * `authErrors.ts` — its copy has an extra constraint auth needs and nothing
 * else does: it must never reveal whether an account exists). Same shape,
 * same rule either way: never show the user a raw code, backend message,
 * or stack trace.
 */

const CODE_MESSAGES: Record<string, string> = {
  VENDOR_NOT_FOUND: "We couldn't find that vendor.",
  UPLOAD_FILE_TOO_LARGE: 'That file is too large. Please upload something smaller.',
  UPLOAD_INVALID_TYPE: "That file type isn't supported.",
};

export interface ApiUiError {
  /** Safe to render directly in a general error banner/toast. */
  message: string;
  /** Backend field-validation messages, if it sent any. These carry no field
   *  association (the backend returns a flat string array), so callers show
   *  them as a list rather than trying to place one per input. */
  details?: string[];
  retryAfterSeconds?: number;
  offline?: boolean;
  /** True for 4xx validation-shaped errors — callers may want to keep the form open and re-highlight fields instead of navigating away. */
  isValidation: boolean;
}

/**
 * @param fallback Context-specific message for the generic case, e.g.
 *   "We could not submit your application. Review the highlighted fields and try again."
 *   Defaults to a generic message when the caller doesn't have anything more specific to say.
 */
export function toApiUiError(err: unknown, fallback = 'Something went wrong. Please try again.'): ApiUiError {
  if (err instanceof NetworkError) {
    const timedOut = /timed out/i.test(err.message);
    return {
      message: timedOut
        ? 'That took too long. Please check your connection and try again.'
        : 'No connection. Please check your network and try again.',
      offline: true,
      isValidation: false,
    };
  }

  if (err instanceof ApiClientError) {
    // Technical detail goes to the console only — never to the user.
    console.warn(`[api] ${err.code} (${err.statusCode}): ${err.message}`, err.details);

    const known = CODE_MESSAGES[err.code];
    if (known) return { message: known, details: err.details, isValidation: false };

    if (err.statusCode === 401) {
      return { message: 'Please sign in to continue.', isValidation: false };
    }
    if (err.statusCode === 403) {
      return { message: "You don't have permission to do that.", isValidation: false };
    }
    if (err.statusCode === 404) {
      return { message: "We couldn't find what you're looking for.", isValidation: false };
    }
    if (err.statusCode === 429) {
      return {
        message: 'Too many attempts. Please wait a moment and try again.',
        retryAfterSeconds: err.retryAfterSeconds,
        isValidation: false,
      };
    }
    if (err.statusCode === 400 || err.statusCode === 422) {
      return { message: fallback, details: err.details, isValidation: true };
    }
    if (err.statusCode >= 500) {
      return { message: 'Something went wrong on our end. Please try again shortly.', isValidation: false };
    }
  }

  return { message: fallback, isValidation: false };
}
