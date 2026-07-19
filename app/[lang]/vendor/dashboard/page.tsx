"use client";

import React from "react";
import Link from "next/link";
import Typography from "../../components/atoms/Typography";
import VendorDashboardOverview from "./components/VendorDashboardOverview";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

export default function VendorDashboardPage() {
  const { dict, lang } = useLocalizationContext();

  if (!dict) return <div className="min-h-screen bg-slate-50" />;
  const res = dict.page.vendor_dashboard;

  const managementLinks = [
    { name: res.tabs.bookings, icon: "📅", route: `/${lang}/vendor/bookings`, color: "bg-emerald-50 text-emerald-600", desc: "Manage guest bookings" },
    { name: res.tabs.services, icon: "🏨", route: `/${lang}/vendor/services`, color: "bg-emerald-50 text-emerald-500", desc: "Inventory & pricing" },
    { name: "Calendar", icon: "🗓️", route: `/${lang}/vendor/calendar`, color: "bg-amber-50 text-amber-600", desc: "Availability schedule" },
    { name: "Payouts", icon: "💰", route: `/${lang}/vendor/payouts`, color: "bg-slate-100 text-slate-900", desc: "Earnings & transfers" },
    { name: "Contracts", icon: "📄", route: `/${lang}/vendor/contracts`, color: "bg-rose-50 text-rose-600", desc: "Legal agreements" },
    { name: "Partners", icon: "🤝", route: `/${lang}/vendor/partnerships`, color: "bg-blue-50 text-blue-600", desc: "Network growth" },
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
                        className="group p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-50 hover:border-indigo-100 transition-all duration-500 text-center flex flex-col items-center"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${link.color} flex items-center justify-center text-xl mb-4 shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
                            {link.icon}
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