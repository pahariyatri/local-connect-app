"use client";

import React from "react";
import Link from "next/link";
import Typography from "../../components/atoms/Typography";
import VendorDashboardOverview from "./components/VendorDashboardOverview";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

// Inline stroke icons — same convention as the rest of the app (landing
// page, builder, onboarding). One neutral + one emerald accent, no emojis.
type IconName = "calendar" | "home" | "calendarDays" | "wallet" | "file" | "users" | "chat";
const ICON_PATHS: Record<IconName, React.ReactNode> = {
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  calendarDays: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01" /></>,
  wallet: <><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" /><path d="M18 12a2 2 0 0 0 0 4h3v-4Z" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  chat: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
};
function DashIcon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  );
}

export default function VendorDashboardPage() {
  const { dict, lang } = useLocalizationContext();

  if (!dict) return <div className="min-h-screen bg-slate-50" />;
  const res = dict.page.vendor_dashboard;

  const managementLinks: { name: string; icon: IconName; route: string; desc: string }[] = [
    { name: res.tabs.bookings, icon: "calendar", route: `/${lang}/vendor/bookings`, desc: "Manage guest bookings" },
    { name: res.tabs.services, icon: "home", route: `/${lang}/vendor/services`, desc: "Inventory & pricing" },
    { name: "Calendar", icon: "calendarDays", route: `/${lang}/vendor/calendar`, desc: "Availability schedule" },
    { name: "Payouts", icon: "wallet", route: `/${lang}/vendor/payouts`, desc: "Earnings & transfers" },
    { name: "Contracts", icon: "file", route: `/${lang}/vendor/contracts`, desc: "Legal agreements" },
    { name: "Partners", icon: "users", route: `/${lang}/vendor/partnerships`, desc: "Network growth" },
    { name: res.tabs?.community || "Community", icon: "chat", route: `/${lang}/vendor/community`, desc: "Host circle" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4">
        {/* Hub Header */}
        <header className="mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <Typography variant="h1" className="text-4xl font-black text-slate-900 leading-tight">
                Control <span className="text-emerald-500">Center.</span>
            </Typography>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 italic">Welcome back to your business hub</p>
        </header>

        {/* Quick Management Hub - Replaces Tabs */}
        <section className="mb-16 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
            <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8 px-2">
                Management Hub
            </Typography>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {managementLinks.map((link, i) => (
                    <Link
                        key={i}
                        href={link.route}
                        className="group p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-50 hover:border-emerald-100 transition-all duration-500 text-center flex flex-col items-center"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors duration-500">
                            <DashIcon name={link.icon} className="w-5 h-5" />
                        </div>
                        <div className="font-black text-slate-900 uppercase tracking-tighter text-[10px] italic leading-none">{link.name}</div>
                    </Link>
                ))}
            </div>
        </section>

        {/* Real-time Insights */}
        <section className="animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
            <Typography variant="h3" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8 px-2">
                Business Pulse
            </Typography>
            <VendorDashboardOverview dict={dict} />
        </section>
        
        <div className="mt-20 text-center pb-12 opacity-20">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Command & Control v.2.5</p>
        </div>
    </div>
  );
}