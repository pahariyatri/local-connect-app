"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { useRouter, usePathname } from "next/navigation";

interface LocalizationContextProps {
    dict: { [key: string]: any } | null;
    lang: Locale;
    setLang: React.Dispatch<React.SetStateAction<Locale>>;
    loading: boolean;
    switchLanguage: (newLang: Locale) => void;
}

const LocalizationContext = createContext<LocalizationContextProps | undefined>(undefined);

export const useLocalizationContext = () => {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error("useLocalizationContext must be used within a LocalizationProvider");
    }
    return context;
};

interface LocalizationProviderProps {
    children: React.ReactNode;
}

const SUPPORTED_LOCALES: Locale[] = ['en', 'hi', 'he', 'fr', 'es', 'de'];

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
    const [dict, setDict] = useState<{ [key: string]: string } | null>(null);
    const [lang, setLang] = useState<Locale>("en");
    const [loading, setLoading] = useState<boolean>(true);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Cache for dictionaries to avoid refetching
    const [dictCache, setDictCache] = useState<Record<Locale, any>>({} as Record<Locale, any>);

    // Initialize language from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem("preferred-language");
        if (savedLang && SUPPORTED_LOCALES.includes(savedLang as Locale)) {
            setLang(savedLang as Locale);
        }
    }, []);

    // Fetch dictionary when language changes
    useEffect(() => {
        if (!mounted) return;

        const fetchDictionary = async () => {
            // Skip if we already have this dictionary cached
            if (dictCache[lang]) {
                setDict(dictCache[lang]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const fetchedDict = await getDictionary(lang);
                setDict(fetchedDict);
                // Cache the dictionary
                setDictCache(prev => ({ ...prev, [lang]: fetchedDict }));
            } catch (error) {
                console.error("Error fetching dictionary:", error);
                setDict(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDictionary();
    }, [lang, dictCache, mounted]);

    // Extract language from pathname
    useEffect(() => {
        if (!mounted) return;
        
        const pathLang = pathname.split('/')[1] as Locale;
        if (pathLang && SUPPORTED_LOCALES.includes(pathLang)) {
            setLang(pathLang);
        }
    }, [pathname, mounted]);

    // Function to switch language
    const switchLanguage = useCallback((newLang: Locale) => {
        if (!SUPPORTED_LOCALES.includes(newLang)) return;

        // Save preference to localStorage
        localStorage.setItem("preferred-language", newLang);
        setLang(newLang);
        
        // Navigate to new language path
        const currentPath = pathname.replace(/^\/(en|hi|he|fr|es|de)/, "");
        router.push(`/${newLang}${currentPath || ""}`);
    }, [pathname, router]);

    if (!mounted) {
        return (
            <LocalizationContext.Provider value={{ dict: null, lang: "en", setLang, loading: true, switchLanguage }}>
                {children}
            </LocalizationContext.Provider>
        );
    }

    return (
        <LocalizationContext.Provider value={{ dict, lang, setLang, loading, switchLanguage }}>
            {children}
        </LocalizationContext.Provider>
    );
};
