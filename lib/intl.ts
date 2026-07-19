"use client";

import { Locale } from "@/i18n-config";
import { createIntl } from "@formatjs/intl";

export async function getIntl(locale: Locale) {
    const messages = (await import(`@/dictionaries/${locale}.json`)).default;

    return createIntl({
        locale,
        messages,
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getDirection(_locale: Locale): "ltr" | "rtl" {
    return "ltr";
}
