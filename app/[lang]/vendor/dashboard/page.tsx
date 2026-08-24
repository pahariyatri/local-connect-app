"use client";

import React from "react";
import Link from "next/link";
import Typography from "../../components/atoms/Typography";
import VendorDashboardOverview from "./components/VendorDashboardOverview";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

import { Icon } from '../../components/atoms/Icon';

type DashIconName = 'calendar' | 'home' | 'calendar-days' | 'wallet' | 'file' | 'users' | 'chat';
// Map legacy local names to shared icon names
const ICON_MAP: Record<DashIconName, Parameters<typeof Icon>[0]['name']> = {
  calendar: 'calendar',
  home: 'home',
  'calendar-days': 'calendar-days',
  wallet: 'wallet',
  file: 'file',
  users: 'users',
  chat: 'chat',
};
function DashIcon({ name, className = '' }: { name: DashIconName; className?: string }) {
  return <Icon name={ICON_MAP[name]} className={className} />;
}

export default function VendorDashboardPage() {
  const { dict, lang } = useLocalizationContext();

  if (!dict) return <div className="min-h-screen bg-slate-50" />;
  const res = dict.page.vendor_dashboard;

  const managementLinks: { name: string; icon: DashIconName; route: string; desc: string }[] = [
    { name: res.tabs.bookings, icon: "calendar", route: `/${lang}/vendor/bookings`, desc: "Manage guest bookings" },
    { name: res.tabs.services, icon: "home", route: `/${lang}/vendor/services`, desc: "Inventory & pricing" },
    { name: "Calendar", icon: "calendar-days", route: `/${lang}/vendor/calendar`, desc: "Availability schedule" },
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

        {/* Real-time Insights */}
        <section className="animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
            <VendorDashboardOverview dict={dict} />
        </section>
        
        <div className="mt-20 text-center pb-12 opacity-20">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Command & Control v.2.5</p>
        </div>
    </div>
  );
}