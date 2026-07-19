// import "server-only";

import { Locale } from "./i18n-config";


export async function getDictionary(locale: Locale) {
  const dictionary = await import(`./dictionaries/${locale}.json`);
  return dictionary.default;
}

