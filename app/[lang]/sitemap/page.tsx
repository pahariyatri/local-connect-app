"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Typography from "../components/atoms/Typography";
import TopNavigation from "../components/organisms/TopNavigation";

const pageCategories = [
    {
        title: "Mountain Journeys",
        description: "The Traveler Experience",
        icon: "🏔️",
        links: [
            { name: "Build Story", path: "/builder" },
            { name: "Generated Path", path: "/results" },
            { name: "Discover Legends", path: "/discover" },
            { name: "My Journeys", path: "/bookings" },
            { name: "Trip Breakdown", path: "/bookings/BK-9021/summary" },
            { name: "Live Tracking", path: "/bookings/BK-9021/status" },
        ]
    },
    {
        title: "Agency Hub",
        description: "Broker Ecosystem",
        icon: "🤵",
        links: [
            { name: "Agency Dashboard", path: "/broker" },
            { name: "Lead Manager", path: "/broker" },
        ]
    },
    {
        title: "Local Legend Portal",
        description: "Vendor Management",
        icon: "🛡️",
        links: [
            { name: "Vendor Dashboard", path: "/vendor" },
            { name: "My Offerings", path: "/vendor/services" },
            { name: "Guest Check-ins", path: "/vendor/bookings" },
            { name: "Alliance Management", path: "/vendor/partnerships" },
            { name: "Agreements", path: "/vendor/contracts" },
        ]
    },
    {
        title: "Digital Basecamp",
        description: "Legal & Generic",
        icon: "⚖️",
        links: [
            { name: "Our Story", path: "/about" },
            { name: "House Rules (Terms)", path: "/terms-conditions" },
            { name: "Data Shield (Privacy)", path: "/privacy-policy" },
            { name: "Identity Sync (Auth)", path: "/auth/login" },
        ]
    },
    {
        title: "Misc Explorer",
        description: "Experimental & Legacy",
        icon: "🧪",
        links: [
            { name: "Global Search", path: "/search" },
            { name: "Peak AI Assistant", path: "/bot" },
            { name: "User Profile", path: "/profile" },
            { name: "Legacy Builder", path: "/journey" },
            { name: "Generic Details", path: "/details" },
            { name: "Admin Portal", path: "/admin" },
        ]
    }
];

export default function SitemapPage() {
    const params = useParams();
    const lang = params.lang || "en";

    return (
        <div className="min-h-screen bg-white pb-32">
            <TopNavigation title="Sitemap" />
            
            <main className="max-w-md mx-auto px-6 pt-24">
                <header className="mb-12">
                    <Typography variant="h1" className="text-4xl font-black text-slate-900 leading-tight">
                        Navigation <span className="text-emerald-500">Peak</span>.
                    </Typography>
                    <p className="text-slate-500 font-medium mt-2">Every trail in the Local Connect ecosystem.</p>
                </header>

                <div className="space-y-10">
                    {pageCategories.map((category, index) => (
                        <section key={index}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner border border-slate-100">
                                    {category.icon}
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{category.title}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{category.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {category.links.map((link, linkIndex) => (
                                    <Link 
                                        key={linkIndex}
                                        href={`/${lang}${link.path}`}
                                        className="premium-card p-5 group flex justify-between items-center active:scale-95 transition-all bg-slate-50/50 hover:bg-white"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-colors" />
                                            <span className="text-sm font-black text-slate-800 group-hover:text-slate-900">{link.name}</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                            Visit →
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-20 p-8 rounded-[3rem] bg-slate-900 text-center relative overflow-hidden">
                    <Typography variant="h3" className="text-white font-black uppercase tracking-widest mb-2">Missing something?</Typography>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Contact the architect to add a new trail.</p>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                </div>
            </main>
        </div>
    );
}
