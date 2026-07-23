"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n-config";
import LocalImage from "./components/atoms/Image";
import Button from "./components/atoms/Button";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "../loading";
import api from "@/lib/apiClient";

type HomeProps = {
  params: Promise<{ lang: Locale }>;
};

// ─── Icon system ─────────────────────────────────────────────────────────────
// Semantic icon name → inline stroke SVG. Size + colour come from CSS.

type IconName =
  | "message" | "shield-check" | "map-pin" | "users" | "compass" | "sparkles"
  | "home" | "car" | "utensils" | "mountain" | "heart" | "camera"
  | "check" | "star" | "arrow-right";

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  message: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  "shield-check": <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>,
  "map-pin": <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  compass: <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>,
  sparkles: <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />,
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  car: <><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></>,
  utensils: <><path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  mountain: <path d="m8 3 4 8 5-5 5 15H2L8 3z" />,
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  "arrow-right": <path d="M5 12h14M12 5l7 7-7 7" />,
};

function Icon({ name, className = "", filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {ICON_PATHS[name]}
    </svg>
  );
}

// ─── Static content ──────────────────────────────────────────────────────────

const TRUST_BADGES = ["Verified local partners", "Local stays & taxis", "Custom stop-based planning", "Request before booking"];

const HOW_STEPS: { icon: IconName; title: string; desc: string }[] = [
  { icon: "map-pin", title: "Tell us your route", desc: "Starting point, destination and rough dates. One-way, round trip, or not sure yet — all fine." },
  { icon: "compass", title: "Add stops & needs", desc: "Mark where you want to pause, stay, eat or explore. Choose what you need — stay, taxi, guide, food and more." },
  { icon: "message", title: "Request local options", desc: "Verified locals reply with real options. You confirm when you're ready — no upfront payment." },
];

const NEED_CATEGORIES: { icon: IconName; label: string; desc: string }[] = [
  { icon: "home", label: "Stay", desc: "Homestays & local stays" },
  { icon: "car", label: "Local transport", desc: "Taxis & shared rides" },
  { icon: "compass", label: "Guides", desc: "People who know the trail" },
  { icon: "utensils", label: "Food & local meals", desc: "Home food & dhabas" },
  { icon: "mountain", label: "Adventure", desc: "Treks & activities" },
  { icon: "sparkles", label: "Spiritual / yatra support", desc: "Temple & devta routes" },
  { icon: "heart", label: "Local experiences", desc: "Culture with real families" },
  { icon: "camera", label: "Creator-friendly spots", desc: "Quiet, photogenic places" },
];

const EXAMPLE_PLAN: { day: string; route: string; items: string[] }[] = [
  { day: "Day 1", route: "Delhi → Chandigarh → Manali", items: ["Lunch stop · Chandigarh", "Stay · Manali", "Need · local taxi"] },
  { day: "Day 2", route: "Manali → Kasol → Kalga", items: ["Stop · Kasol", "Stay · Kalga", "Need · homestay + local guide"] },
  { day: "Day 3", route: "Kalga · Pulga · Waichin", items: ["Local experience", "Food · guide · transport options"] },
  { day: "Return", route: "Flexible return", items: ["Rest stop wherever you like"] },
];

const WHY_POINTS: { icon: IconName; title: string; desc: string }[] = [
  { icon: "users", title: "Yatri, not tourist", desc: "You travel with people who live in the mountains — not a call centre reading a brochure." },
  { icon: "compass", title: "Local truth", desc: "Routes, stays and stops come from locals who actually know the region and its seasons." },
  { icon: "message", title: "Request before booking", desc: "See real options first, ask questions, then decide. No fake urgency, no automatic charges." },
  { icon: "shield-check", title: "Verified access", desc: "Partners are checked before they appear. Trust is the whole point of Local Connect." },
];

// ─── Vendor mapping (unchanged working logic) ────────────────────────────────

const LOCAL_PROVIDERS = [
  { id: "p1", name: "Tenzing Sherpa", role: "Mountain Guide", location: "Manali, HP", rating: 4.9, reviews: 142, tags: ["Trek", "Camping", "Rescue"], image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400", badge: "Verified" },
  { id: "p2", name: "Priya Homestay", role: "Host · 4 Rooms", location: "Old Manali", rating: 4.8, reviews: 89, tags: ["Rooms", "Meals", "Wi-Fi"], image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=400", badge: "Verified" },
  { id: "p3", name: "Arjun Thakur", role: "Local Food Guide", location: "Shimla, HP", rating: 4.7, reviews: 63, tags: ["Food", "Culture", "History"], image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400", badge: "Verified" },
  { id: "p4", name: "Sonam Wangchuk", role: "Transport Operator", location: "Leh, Ladakh", rating: 4.9, reviews: 211, tags: ["4x4", "Permits", "Ladakh"], image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400", badge: "Verified" },
  { id: "p5", name: "Kavya Nair", role: "Yoga & Wellness", location: "Rishikesh, UK", rating: 5.0, reviews: 47, tags: ["Yoga", "Meditation", "Detox"], image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400", badge: "New" },
  { id: "p6", name: "Rajan Chauhan", role: "River Rafting Pro", location: "Kullu, HP", rating: 4.8, reviews: 178, tags: ["Rafting", "Kayak", "Safety"], image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400", badge: "Verified" },
];

const mapHomeVendor = (v: any) => {
  const type = v.types?.[0] || "hotel";
  const roleMap: Record<string, string> = {
    hotel: "Host · Local Stay", adventure: "Adventure Specialist", transport: "Transport Operator",
    restaurant: "Culinary Host", guide: "Local Guide", wellness: "Yoga & Wellness",
  };
  let location = "Manali, HP";
  const lowerName = v.businessName.toLowerCase();
  if (lowerName.includes("dharamshala")) location = "Dharamshala, HP";
  else if (lowerName.includes("tirthan")) location = "Tirthan, HP";
  else if (lowerName.includes("spiti")) location = "Spiti, HP";
  else if (lowerName.includes("goa")) location = "Goa";
  else if (lowerName.includes("leh")) location = "Leh, Ladakh";
  else if (lowerName.includes("rishikesh")) location = "Rishikesh, UK";
  else if (lowerName.includes("shimla")) location = "Shimla, HP";
  const categoryMap: Record<string, string> = { hotel: "Homestays", adventure: "Adventures", transport: "Transport", restaurant: "Food", guide: "Guides", wellness: "Wellness" };
  const category = categoryMap[type.toLowerCase()] || "Guides";
  const categoryImages: Record<string, string> = {
    Homestays: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=400",
    Adventures: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
    Transport: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400",
    Food: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400",
    Guides: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400",
    Wellness: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400",
  };
  const cleanName = v.businessName.replace(/\s*\(.*?\)\s*/g, "").trim();
  return {
    id: v.id, name: cleanName, role: roleMap[type.toLowerCase()] || "Local Expert", location,
    rating: v.trustScore || 4.8,
    reviews: v.reviews || Math.floor((v.trustScore || 4.8) * 20) + (parseInt(v.id.slice(0, 2), 16) % 50 || 20),
    tags: v.services?.map((s: any) => s.name).slice(0, 3) || ["Verified", "Local"],
    image: categoryImages[category] || categoryImages["Guides"],
    badge: v.isVerified ? "Verified" : "Local",
  };
};

// ─── Small presentational helpers (match app: uppercase-black, emerald eyebrow) ─

function SectionHeading({ eyebrow, title, subtitle, center = false, dark = false }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean; dark?: boolean }) {
  return (
    <div className={`${center ? "text-center mx-auto" : ""} max-w-2xl mb-10 sm:mb-14`}>
      {eyebrow && <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-3">{eyebrow}</span>}
      <h2 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight ${dark ? "text-white" : "text-slate-900"}`}>{title}</h2>
      {subtitle && <p className={`text-sm sm:text-base mt-3 leading-relaxed ${dark ? "text-slate-300" : "text-slate-500"}`}>{subtitle}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home({ params }: HomeProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const { dict, lang } = useLocalizationContext();
  const router = useRouter();

  const [providersList, setProvidersList] = useState<any[]>([]);
  const [isProvidersLoading, setIsProvidersLoading] = useState(true);

  useEffect(() => {
    if (!dict) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await api.get("/vendors");
        if (!cancelled) {
          setProvidersList(response && Array.isArray(response) && response.length ? response.slice(0, 6).map(mapHomeVendor) : LOCAL_PROVIDERS);
        }
      } catch (err) {
        console.error("Error fetching homepage vendors:", err);
        if (!cancelled) setProvidersList(LOCAL_PROVIDERS);
      } finally {
        if (!cancelled) setIsProvidersLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dict]);

  if (!dict) return <Loading />;

  const builderHref = `/${lang}/builder`;
  const vendorHref = `/${lang}/vendor/onboarding`;
  const discoverHref = `/${lang}/discover`;

  return (
    <main className="bg-white">
      {/* ── 1 · HERO ─────────────────────────────────────────────────── */}
      <section className="relative bg-slate-900 overflow-hidden px-6 pt-32 sm:pt-40 pb-24 sm:pb-32">
        <div className="absolute inset-0 z-0 opacity-40 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-200 text-[10px] font-black uppercase tracking-[0.2em]">Pahari Yatri · Local Connect</span>
          </span>

          <h1 className="mt-6 text-white text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] max-w-3xl">
            Build your <span className="text-emerald-400">Yatra</span> with trusted locals.
          </h1>
          <p className="mt-5 text-slate-300 text-base sm:text-lg font-medium max-w-2xl leading-relaxed">
            Choose your route, dates, stops, stays, taxis, guides and local experiences — all in one simple plan.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button onClick={() => router.push(builderHref)} iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group bg-emerald-500 text-white hover:bg-emerald-600 h-14 rounded-2xl text-xs">
              Start Planning
            </Button>
            <Button onClick={() => router.push(vendorHref)} className="bg-transparent border border-white/25 text-white hover:bg-white/10 shadow-none h-14 rounded-2xl text-xs">
              Join as Local Partner
            </Button>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
            {TRUST_BADGES.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center"><Icon name="check" className="w-3 h-3" /></span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 2 · HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="How it works" title="Plan with people who know the mountains." subtitle="Three simple steps. No package pressure — just a clear local plan you control." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {HOW_STEPS.map((s, i) => (
              <div key={s.title} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-7">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center"><Icon name={s.icon} className="w-5 h-5" /></span>
                  <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Step 0{i + 1}</span>
                </div>
                <h3 className="text-slate-900 text-lg font-black uppercase tracking-tight mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 · WHAT YOU CAN PLAN ────────────────────────────────────── */}
      <section className="px-6 py-20 sm:py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="What you can plan" title="Local stays, taxis, guides and experiences." subtitle="Pick only what matters for your Yatra. Add or drop anything while you plan." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {NEED_CATEGORIES.map((c) => (
              <button key={c.label} type="button" onClick={() => router.push(builderHref)} className="group text-left bg-white border border-slate-100 rounded-[2rem] p-5 hover:border-emerald-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <span className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Icon name={c.icon} className="w-5 h-5" /></span>
                <h3 className="text-slate-900 font-black text-sm uppercase tracking-tight">{c.label}</h3>
                <p className="text-slate-500 text-xs mt-1 leading-snug">{c.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 · EXAMPLE LOCAL PLAN ───────────────────────────────────── */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-900 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-14 relative overflow-hidden">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-emerald-500/15 to-indigo-500/15 pointer-events-none" />
            <div className="relative z-10">
              <SectionHeading eyebrow="Example local plan" title="Not a generic package. A local access plan." subtitle="This is how a Yatra takes shape — day by day, stop by stop, with real locals behind each need." dark />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXAMPLE_PLAN.map((d) => (
                  <div key={d.day} className="rounded-[1.75rem] bg-white/5 border border-white/10 p-6">
                    <div className="flex items-baseline justify-between gap-3 mb-3">
                      <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">{d.day}</span>
                      <span className="text-slate-400 text-xs font-medium truncate">{d.route}</span>
                    </div>
                    <ul className="space-y-2">
                      {d.items.map((it) => (
                        <li key={it} className="flex items-center gap-2.5 text-sm text-slate-200"><span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400" />{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button onClick={() => router.push(builderHref)} iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group bg-emerald-500 text-white hover:bg-emerald-600 h-14 rounded-2xl text-xs">Build my plan</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5 · VERIFIED LOCAL PARTNERS ──────────────────────────────── */}
      <section className="px-6 py-20 sm:py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-10 sm:mb-14">
            <div className="max-w-xl">
              <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-3">Verified local partners</span>
              <h2 className="text-slate-900 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight">The real locals of the Himalayas.</h2>
            </div>
            <button onClick={() => router.push(discoverHref)} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b-2 border-emerald-500/20 pb-1 hover:text-emerald-700 hover:border-emerald-700 transition-all">
              View all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isProvidersLoading
              ? Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-6 space-y-4 animate-pulse">
                    <div className="flex gap-4"><div className="w-16 h-16 rounded-2xl bg-slate-200" /><div className="flex-1 space-y-2 py-1"><div className="h-4 bg-slate-200 rounded w-2/3" /><div className="h-3 bg-slate-200 rounded w-1/2" /></div></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                  </div>
                ))
              : providersList.map((p) => (
                  <div key={p.id} role="button" tabIndex={0}
                    onClick={() => router.push(`/${lang}/vendor/${p.id}`)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/${lang}/vendor/${p.id}`); } }}
                    className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:border-emerald-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start gap-4 p-6 pb-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 group-hover:border-emerald-400 transition-colors">
                        <LocalImage src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-slate-900 font-bold text-sm truncate">{p.name}</h3>
                          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <Icon name="shield-check" className="w-2.5 h-2.5" />{p.badge}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[9px] font-semibold uppercase tracking-wide">{p.role}</p>
                        <p className="text-slate-400 text-[10px] mt-1 flex items-center gap-1"><Icon name="map-pin" className="w-3 h-3 flex-shrink-0" /><span className="truncate">{p.location}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 px-6 pb-5 flex-wrap">
                      {p.tags.map((tag: string) => (<span key={tag} className="text-[8px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-0.5">{tag}</span>))}
                    </div>
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/30">
                      <div className="flex items-center gap-1.5"><Icon name="star" filled className="w-3.5 h-3.5 text-amber-400" /><span className="text-slate-900 text-xs font-bold">{p.rating}</span><span className="text-slate-400 text-[10px]">({p.reviews})</span></div>
                      <span className="h-8 px-4 inline-flex items-center rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest group-hover:bg-emerald-500 transition-colors duration-300">View Profile</span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ── 6 · WHY LOCAL ACCESS MATTERS ─────────────────────────────── */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="Why local access matters" title="Trusted local access, not a tour desk." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {WHY_POINTS.map((w) => (
              <div key={w.title} className="flex gap-4 bg-slate-50 border border-slate-100 rounded-[2rem] p-7">
                <span className="flex-shrink-0 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center"><Icon name={w.icon} className="w-5 h-5" /></span>
                <div>
                  <h3 className="text-slate-900 font-black text-base uppercase tracking-tight mb-1.5">{w.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7 · TRAVELLER CTA + LOCAL PARTNER CTA ────────────────────── */}
      <section className="px-6 py-20 sm:py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Traveller */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-emerald-500/15 to-indigo-500/15 pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-white text-2xl font-black uppercase tracking-tight leading-tight">Ready to build your Yatra?</h3>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed flex-1">Start with your route and dates. Add stops and needs. Request local options when you're ready.</p>
              <Button onClick={() => router.push(builderHref)} iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group mt-6 bg-emerald-500 text-white hover:bg-emerald-600 h-14 rounded-2xl text-xs w-full sm:w-fit">Start Planning</Button>
            </div>
          </div>
          {/* Vendor */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-10 flex flex-col">
            <h3 className="text-slate-900 text-2xl font-black uppercase tracking-tight leading-tight">Are you a local partner?</h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed flex-1">List your stay, taxi, guiding or experience. Reach Yatris who want the real mountains, on your terms.</p>
            <Button onClick={() => router.push(vendorHref)} iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group mt-6 bg-slate-900 text-white hover:bg-black h-14 rounded-2xl text-xs w-full sm:w-fit">Join as Local Partner</Button>
          </div>
        </div>
      </section>

      {/* ── Trust footer strip ───────────────────────────────────────── */}
      <section className="px-6 py-10 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST_BADGES.map((b) => (
            <div key={b} className="flex items-center gap-2 text-slate-500">
              <Icon name="check" className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{b}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
