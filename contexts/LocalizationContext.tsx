import en from "@/dictionaries/en.json";

// English-only (founder decision 2026-10-10): the app ships a single static
// dictionary. No locale routing, no runtime dictionary fetching.
const value = {
    dict: en as { [key: string]: any },
    lang: "en" as const,
    loading: false,
};

export const useLocalizationContext = () => value;
