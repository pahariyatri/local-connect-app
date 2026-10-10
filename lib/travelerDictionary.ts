import en from '../locales/en/traveler.json';

// Auth-screen microcopy (English only).
export type TravelerDictionary = typeof en;

export function getTravelerDictionary(): TravelerDictionary {
  return en;
}

/** Replaces {token} placeholders, e.g. format('Step {current} of {total}', { current: 1, total: 2 }). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}
