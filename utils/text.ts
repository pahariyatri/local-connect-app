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

/**
 * Single-character avatar fallback for a user with no profile photo: the
 * real name's first letter, or the last digit of their phone number, never
 * a fabricated initial. Previously duplicated (and slightly diverged)
 * between Header.tsx and BottomNavigation.tsx — one shared implementation
 * now backs both.
 */
export function userAvatarInitial(name?: string | null, phone?: string | null): string {
    const trimmed = (name || "").trim();
    if (trimmed && trimmed.toLowerCase() !== "user") return trimmed[0].toUpperCase();
    const digits = (phone || "").replace(/\D/g, "");
    return digits ? digits.slice(-1) : "Y";
}
