import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { Locale } from "@/i18n-config";

const LanguageSwitcher = () => {
    const { setLang } = useLocalizationContext();

    const handleLanguageChange = (newLang: string) => {
        setLang(newLang as Locale);
    };

    return (
        <div className="flex justify-center space-x-4">
            <button onClick={() => handleLanguageChange("en")} className="text-xl">English</button>
            <button onClick={() => handleLanguageChange("hi")} className="text-xl">Hindi</button>
            {/* Add more languages here */}
        </div>
    );
};

export default LanguageSwitcher;
