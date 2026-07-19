"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { fetchCurrentUser } from "@/services/userService";
import { User } from "@/types/userTypes";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { Locale } from "@/i18n-config";

type Tab = {
    id: string;
    label: string;
    icon: (active: boolean) => React.ReactNode;
    route: string;
};

export default function BottomNavigation({ onToggleLanguage }: { onToggleLanguage?: (lang?: Locale) => void }) {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const lang = params.lang || "en";
    
    const LANGUAGE_CYCLE: Locale[] = ['en', 'hi', 'he', 'fr', 'es', 'de'];
    const LANGUAGE_LABELS: Record<Locale, string> = {
        'en': 'EN',
        'hi': 'हिन्दी',
        'he': 'עברית',
        'fr': 'FR',
        'es': 'ES',
        'de': 'DE'
    };

    const handleLanguageToggle = () => {
        const currentIndex = LANGUAGE_CYCLE.indexOf(lang as Locale);
        const nextIndex = (currentIndex + 1) % LANGUAGE_CYCLE.length;
        const nextLang = LANGUAGE_CYCLE[nextIndex];
        onToggleLanguage?.(nextLang);
    };
    
    const [user, setUser] = useState<User | null>(null);
    const [showNav, setShowNav] = useState(true);

    useEffect(() => {
        // Persistent navigation
        setShowNav(true);
    }, []);

    const { dict } = useLocalizationContext();
    const common = dict?.page?.common?.actions;
    const dashboard = dict?.page?.vendor_dashboard?.tabs;

    const travelerTabs: Tab[] = [
        {
            id: "explore",
            label: common?.explore || "Explore",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
            ),
            route: `/${lang}`,
        },
        {
            id: "favorites",
            label: common?.wishlist || "Wishlist",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
            ),
            route: `/${lang}/wishlist`,
        },
        {
            id: "trip",
            label: common?.ai_guide || "AI Guide",
            icon: () => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
                </svg>
            ),
            route: `/${lang}/bot`,
        },
        {
            id: "booking",
            label: common?.bookings || "Bookings",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
            ),
            route: `/${lang}/bookings`,
        },
        {
            id: "profile",
            label: common?.profile || "Profile",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
            ),
            route: `/${lang}/profile`,
        },
    ];

    const vendorTabs: Tab[] = [
        {
            id: "dashboard",
            label: dashboard?.overview || "Dashboard",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
                </svg>
            ),
            route: `/${lang}/vendor`,
        },
        {
            id: "services",
            label: dashboard?.services || "Services",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <path d="m16.24 7.76-1.41 1.41ZM12 2v3M6.05 4.95l1.41 1.41ZM2 12h3M4.95 17.95l1.41-1.41M12 22v-3M17.95 19.05l-1.41-1.41M22 12h-3ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>
                </svg>
            ),
            route: `/${lang}/vendor/services`,
        },
        {
            id: "trip",
            label: common?.ai_guide || "AI Guide",
            icon: () => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
                </svg>
            ),
            route: `/${lang}/bot`,
        },
        {
            id: "bookings",
            label: dashboard?.bookings || "Sales",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
            ),
            route: `/${lang}/vendor/bookings`,
        },
        {
            id: "settings",
            label: common?.settings || "Settings",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
                </svg>
            ),
            route: `/${lang}/vendor/settings`,
        },
    ];

    const brokerTabs: Tab[] = [
        {
            id: "dashboard",
            label: common?.broker_hub || "Broker Hub",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            ),
            route: `/${lang}/broker`,
        },
        {
            id: "trips",
            label: common?.assisted || "Assisted",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
            ),
            route: `/${lang}/broker/trips`,
        },
        {
            id: "trip",
            label: common?.ai_guide || "AI Guide",
            icon: () => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
                </svg>
            ),
            route: `/${lang}/bot`,
        },
        {
            id: "earnings",
            label: common?.earnings || "Comms",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
            ),
            route: `/${lang}/broker/earnings`,
        },
        {
            id: "settings",
            label: common?.settings || "Settings",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
            ),
            route: `/${lang}/broker/settings`,
        },
    ];

    const adminTabs: Tab[] = [
        {
            id: "dashboard",
            label: common?.admin_hub || "Admin Pan",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/>
                </svg>
            ),
            route: `/${lang}/admin`,
        },
        {
            id: "verify",
            label: common?.queue || "Queue",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            ),
            route: `/${lang}/admin/verification`,
        },
        {
            id: "trip",
            label: common?.ai_guide || "AI Guide",
            icon: () => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
                </svg>
            ),
            route: `/${lang}/bot`,
        },
        {
            id: "disputes",
            label: common?.disputes || "Disputes",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                </svg>
            ),
            route: `/${lang}/admin/disputes`,
        },
        {
            id: "financial",
            label: common?.stats || "Stats",
            icon: (active) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-500" : "text-slate-400"}>
                    <line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>
                </svg>
            ),
            route: `/${lang}/admin/analytics`,
        },
    ];

    // Determine which tabs to show based on Role
    let currentTabs = travelerTabs;
    if (user?.role === "Vendor") {
        currentTabs = vendorTabs;
    } else if (user?.vendorType === "agency") {
        currentTabs = brokerTabs;
    } else if (user?.role === "Admin") {
        currentTabs = adminTabs;
    }

    if (!user) return null;

    const getActiveTabId = () => {
        const currentTab = currentTabs.find(tab => pathname === tab.route);
        return currentTab ? currentTab.id : "";
    };

    const activeTabId = getActiveTabId();

    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 glass border-t border-white/20 z-50 transition-all duration-500 ease-in-out md:hidden ${
                showNav ? "translate-y-0" : "translate-y-full"
            }`}
        >
            <div className="flex justify-between items-center max-w-md mx-auto h-20 px-3">
                {currentTabs.map((tab) => {
                    const isMiddle = tab.id === "trip";
                    const active = activeTabId === tab.id;
                    
                    return (
                        <button
                            key={tab.id}
                            className="relative flex flex-col items-center justify-center gap-1 group"
                            onClick={() => router.push(tab.route)}
                        >
                            {isMiddle ? (
                                <div className="absolute -top-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center shadow-xl shadow-emerald-200 border-4 border-white transition-transform group-hover:scale-110 active:scale-95">
                                    {tab.icon(true)}
                                </div>
                            ) : (
                                <div className={`p-1 rounded-xl transition-colors ${active ? "bg-emerald-50" : "group-hover:bg-slate-50"}`}>
                                    {tab.icon(active)}
                                </div>
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors mt-1 ${
                                active ? "text-emerald-600" : "text-slate-400"
                            } ${isMiddle ? "mt-6" : ""}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
                
                {/* Language Toggle */}
                {onToggleLanguage && (
                    <button
                        onClick={handleLanguageToggle}
                        className="flex flex-col items-center justify-center gap-1 group"
                        title="Toggle language"
                    >
                        <div className="p-1 rounded-xl transition-colors group-hover:bg-slate-50">
                            <span className="text-sm font-black text-slate-400 group-hover:text-slate-900">
                                {LANGUAGE_LABELS[lang as Locale] || "EN"}
                            </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {lang === "en" ? "Lang" : (lang === "hi" ? "भाषा" : "שפה")}
                        </span>
                    </button>
                )}
            </div>
        </nav>
    );
}
