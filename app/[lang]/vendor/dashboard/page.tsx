"use client";

import React from "react";
import Link from "next/link";
import Typography from "../../components/atoms/Typography";
import VendorDashboardOverview from "./components/VendorDashboardOverview";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

  if (!dict) return <div className="min-h-screen bg-slate-50" />;
  const res = dict.page.vendor_dashboard;
  const firstName = user?.name?.split(" ")[0] || "there";
  const greeting = (res.welcome ?? "Welcome back, {name}! 👋").replace("{name}", firstName);

  const managementLinks: { name: string; icon: DashIconName; route: string; desc: string }[] = [
    { name: res.tabs.bookings, icon: "calendar", route: `/${lang}/vendor/bookings`, desc: "Manage guest bookings" },
    { name: res.tabs.services, icon: "home", route: `/${lang}/vendor/services`, desc: "Inventory & pricing" },
    { name: "Calendar", icon: "calendar-days", route: `/${lang}/vendor/bookings?view=calendar`, desc: "Availability schedule" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4">
        {/* Hub Header */}
        <header className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <Typography variant="h1" className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {greeting}
            </Typography>
            <p className="text-slate-500 text-sm mt-1">Here&apos;s your business summary</p>
        </header>

        {/* Real-time Insights */}
        <section className="animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
            <VendorDashboardOverview dict={dict} />
        </section>
        
    </div>
  );
}