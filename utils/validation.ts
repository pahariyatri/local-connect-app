/**
 * Shared input validation & sanitisation helpers.
 * Keep every phone/PIN field in the app consistent: digits-only, fixed length.
 */

export const PHONE_LENGTH = 10;
export const PIN_LENGTH = 4;

/** Strip non-digits and clamp to a 10-digit mobile number. */
export function sanitizePhone(value: string): string {
  return (value || "").replace(/\D/g, "").slice(0, PHONE_LENGTH);
}

/** True when the value is exactly a 10-digit mobile number. */
export function isValidPhone(value: string): boolean {
  return new RegExp(`^\\d{${PHONE_LENGTH}}$`).test(value || "");
}

/** Strip non-digits and clamp to a 4-digit PIN. */
export function sanitizePin(value: string): string {
  return (value || "").replace(/\D/g, "").slice(0, PIN_LENGTH);
}

/** True when the value is exactly a 4-digit PIN. */
export function isValidPin(value: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(value || "");
}
