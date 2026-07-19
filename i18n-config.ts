export const i18n = {
    locales: ["en", "hi", "he", "de", "fr", "es"] as const,
    defaultLocale: "en",
};

export type Locale = (typeof i18n.locales)[number];
