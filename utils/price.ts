/**
 * Price DISPLAY formatting only.
 *
 * The pricing engine computes and persists exact decimal amounts (see the
 * PY-001 pricing-integrity work) — those values are canonical and must never
 * be rounded in the calculation or storage layers. Indian consumer travel
 * pricing is quoted in whole rupees though, so the rounding happens here, at
 * the render boundary, and nowhere else.
 *
 * `formatINR(8134.86)` → `"8,135"`.
 */
export function formatINR(amount: number | string | null | undefined): string {
    const n = typeof amount === "string" ? Number(amount) : amount;
    if (n == null || !Number.isFinite(n)) return "—";
    return Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/** As `formatINR`, prefixed with the rupee sign. */
export function formatINRWithSymbol(amount: number | string | null | undefined): string {
    const formatted = formatINR(amount);
    return formatted === "—" ? formatted : `₹${formatted}`;
}

/**
 * Human label for a price unit as reported by the backend
 * (`pricing.priceUnit`, derived from the service's category tree).
 *
 * Only the Accommodation subtree is genuinely a nightly rate. Nothing else in
 * the schema carries a unit, so non-stay services deliberately render NO unit
 * rather than an invented one — a single-day rafting run priced "PER NIGHT"
 * was the defect (PY-036).
 */
export function priceUnitLabel(unit: string | null | undefined): string | null {
    return unit === "night" ? "per night" : null;
}
