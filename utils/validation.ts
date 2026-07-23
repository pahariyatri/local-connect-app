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

/**
 * UX-only weak-PIN pre-check mirroring the backend policy's obvious cases
 * (repeats, straight sequences, top common PINs). The backend PinPolicyService
 * is authoritative — this only saves the user a round-trip.
 */
export function isWeakPin(pin: string): boolean {
  if (!isValidPin(pin)) return true;
  if (/^(\d)\1+$/.test(pin)) return true;                 // 0000, 1111, …
  if (/^(\d{1,2})\1+$/.test(pin)) return true;            // 1212, 4545, …
  const asc = "0123456789";
  const desc = "9876543210";
  if (asc.includes(pin) || desc.includes(pin)) return true; // 1234, 4321, …
  return ["1122", "2580", "0852", "6969", "1010", "2020"].includes(pin);
}
