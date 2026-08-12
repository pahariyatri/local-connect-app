/**
 * Title-case a place name for display.
 *
 * Destination values reach the UI from several sources — typed input, URL
 * params, and the backend's lower-cased `address.city` — so the trip summary
 * could render "Delhi → manali" (PY-037). Display-only: the underlying value
 * is left untouched so discovery lookups keep matching.
 */
export function toTitleCase(value: string | null | undefined): string {
    if (!value) return "";
    return value
        .toLowerCase()
        .replace(/\b[\p{L}]/gu, (c) => c.toUpperCase());
}
