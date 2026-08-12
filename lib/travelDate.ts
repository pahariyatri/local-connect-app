/**
 * Travel-date formatting — the single source of truth for turning a `Date`
 * into the `YYYY-MM-DD` string this app sends over the wire.
 *
 * A travel date is a DATE, not a timestamp. `toISOString()` converts to UTC
 * first, which silently shifts the day backwards for every user east of UTC —
 * India (UTC+5:30) included, since local midnight is 18:30 UTC the previous
 * day. That is what made a calendar cell for the 14th resolve to the 13th and
 * the "This Weekend" preset hand back Thu–Sat under a "Fri - Sun" label.
 *
 * This lives in `lib/` rather than beside one component on purpose: the same
 * bug reappeared in the results share-URL builder after being fixed in the
 * date picker, because the corrected formatter was module-private and the
 * second call site simply reached for `toISOString()` again.
 */
export const toLocalDateString = (date: Date): string => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * Same contract, but tolerant of the `string | Date | null` shapes that reach
 * the share/query-param paths. Returns '' for anything unparseable so a bad
 * value can never silently become "today".
 */
export const toLocalDateStringSafe = (value: string | Date | null | undefined): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : toLocalDateString(date);
};
