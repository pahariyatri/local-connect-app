import en from '../locales/en/traveler.json';
import hi from '../locales/hi/traveler.json';

// Role-separated microcopy (see locales/{locale}/traveler.json), distinct
// from the existing dictionaries/{locale}.json system used elsewhere in the
// app. Static imports (not get-dictionary.ts's dynamic import) because the
// auth screens that consume this are client components ('use client') and
// need the strings synchronously on first render. Only en/hi exist so far —
// every other page's copy still comes from dictionaries/.
const travelerDictionaries = { en, hi } as const;

export type TravelerDictionary = typeof en;
export type TravelerLocale = keyof typeof travelerDictionaries;

export function getTravelerDictionary(locale: string): TravelerDictionary {
  return travelerDictionaries[locale as TravelerLocale] ?? travelerDictionaries.en;
}

/** Replaces {token} placeholders, e.g. format('Step {current} of {total}', { current: 1, total: 2 }). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}
