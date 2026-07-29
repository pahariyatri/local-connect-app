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
  | "home" | "car" | "utensils" | "mountain" | "heart" | "camera" | "route"
  | "check" | "star" | "arrow-right" | "layers" | "storefront" | "life-buoy" | "shopping-bag";

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
  route: <><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  "arrow-right": <path d="M5 12h14M12 5l7 7-7 7" />,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
  storefront: <><path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3" /><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" /><path d="M4 9v10a1 1 0 0 0 1 1h4v-6h6v6h4a1 1 0 0 0 1-1V9" /></>,
  "life-buoy": <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24m0-14.14-4.24 4.24m-5.66 5.66-4.24 4.24" /></>,
  "shopping-bag": <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
};

function Icon({ name, className = "", filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {ICON_PATHS[name]}
    </svg>
  );
}

// ─── Static content ──────────────────────────────────────────────────────────

const TRUST_BADGES = ["Verified local vendors", "Support along the whole route", "Request before you book", "No upfront payment"];

const USP_STEPS: { icon: IconName; title: string; desc: string }[] = [
  { icon: "route", title: "Select or build your route", desc: "Add your starting point, destination, and any stops along the way — one-way, round trip, or still deciding." },
  { icon: "layers", title: "We surface services along that route", desc: "Not just the final destination — stays, transport, food, guides and more at every point you pass through." },
  { icon: "compass", title: "View and choose local vendors", desc: "Compare verified local vendors and service providers, see real options, and ask questions before booking." },
  { icon: "storefront", title: "Local vendors get real business", desc: "Every request connects a traveller with a trusted local — more visibility and bookings for the community." },
];

const FALLBACK_CATEGORIES: { icon: IconName; label: string; desc: string }[] = [
  { icon: "home", label: "Hotels & Stays", desc: "Verified stays at every stop" },
  { icon: "car", label: "Local Transport", desc: "Taxis, shared rides & transfers" },
  { icon: "utensils", label: "Food & Restaurants", desc: "Local meals along your route" },
  { icon: "compass", label: "Tour Guides", desc: "People who know the area" },
  { icon: "sparkles", label: "Activities & Experiences", desc: "Things to do, wherever you are" },
  { icon: "life-buoy", label: "Emergency Assistance", desc: "Help when you need it, on the road" },
  { icon: "shopping-bag", label: "Shopping & Local Products", desc: "Genuine local goods" },
  { icon: "map-pin", label: "Other Route Services", desc: "More ways locals can help" },
];

const WHY_POINTS: { icon: IconName; title: string; desc: string }[] = [
  { icon: "route", title: "Support at every point, not just the destination", desc: "We connect you with trusted local vendors throughout your entire journey — not only where you're headed." },
  { icon: "shield-check", title: "Verified access", desc: "Vendors and service providers are checked before they appear. Trust is the whole point of Local Connect." },
  { icon: "message", title: "Request before booking", desc: "See real options first, ask questions, then decide. No fake urgency, no automatic charges." },
  { icon: "users", title: "Real people, real local knowledge", desc: "Every vendor lives and works where you're travelling — not a call centre reading a script." },
];

// ─── Vendor mapping (unchanged working logic) ────────────────────────────────

const LOCAL_PROVIDERS = [
  { id: "p1", name: "Tenzing Sherpa", role: "Local Guide", location: "Manali, HP", rating: 4.9, reviews: 142, tags: ["Trek", "Camping", "Rescue"], image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400", badge: "Verified" },
  { id: "p2", name: "Priya Homestay", role: "Host · 4 Rooms", location: "Old Manali", rating: 4.8, reviews: 89, tags: ["Rooms", "Meals", "Wi-Fi"], image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=400", badge: "Verified" },
  { id: "p3", name: "Arjun Thakur", role: "Local Food Guide", location: "Shimla, HP", rating: 4.7, reviews: 63, tags: ["Food", "Culture", "History"], image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400", badge: "Verified" },
  { id: "p4", name: "Sonam Wangchuk", role: "Transport Operator", location: "Leh, Ladakh", rating: 4.9, reviews: 211, tags: ["4x4", "Permits", "Ladakh"], image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400", badge: "Verified" },
  { id: "p5", name: "Kavya Nair", role: "Wellness Host", location: "Rishikesh, UK", rating: 5.0, reviews: 47, tags: ["Yoga", "Meditation", "Detox"], image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400", badge: "New" },
  { id: "p6", name: "Rajan Chauhan", role: "Activity Operator", location: "Kullu, HP", rating: 4.8, reviews: 178, tags: ["Rafting", "Kayak", "Safety"], image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400", badge: "Verified" },
];

const mapHomeVendor = (v: any) => {
  const type = v.types?.[0] || "hotel";
  const roleMap: Record<string, string> = {
    hotel: "Host · Local Stay", adventure: "Activity Operator", transport: "Transport Operator",
    restaurant: "Culinary Host", guide: "Local Guide", wellness: "Wellness Host",
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
    id: v.id, name: cleanName, role: roleMap[type.toLowerCase()] || "Local Vendor", location,
    rating: v.trustScore || 4.8,
    reviews: v.reviews || Math.floor((v.trustScore || 4.8) * 20) + (parseInt(v.id.slice(0, 2), 16) % 50 || 20),
    tags: v.services?.map((s: any) => s.name).slice(0, 3) || ["Verified", "Local"],
    image: categoryImages[category] || categoryImages["Guides"],
    badge: v.isVerified ? "Verified" : "Local",
  };
};

/** Backend categories → homepage cards. Falls back to FALLBACK_CATEGORIES if the API has none yet. */
const mapApiCategory = (c: any, i: number): { icon: IconName; label: string; desc: string } => ({
  icon: FALLBACK_CATEGORIES[i % FALLBACK_CATEGORIES.length].icon,
  label: c.name,
  desc: c.description || "Local services along your route",
});

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
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

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
    (async () => {
      try {
        const response: any = await api.get("/categories", { sessionCache: true });
        const list = response?.data ?? response;
        const topLevel = Array.isArray(list) ? list.filter((c: any) => !c.parent).slice(0, 8) : [];
        if (!cancelled && topLevel.length) setCategories(topLevel.map(mapApiCategory));
      } catch (err) {
        console.error("Error fetching homepage categories:", err);
        // Keep FALLBACK_CATEGORIES — this is temporary content until the
        // category catalog is fully populated.
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
            <span className="text-slate-200 text-[10px] font-black uppercase tracking-[0.2em]">Local Connect</span>
          </span>

          <h1 className="mt-6 text-white text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] max-w-3xl">
            Trusted Local Services <span className="text-emerald-400">Across Your Entire Journey</span>
          </h1>
          <p className="mt-5 text-slate-300 text-base sm:text-lg font-medium max-w-2xl leading-relaxed">
            Discover verified local vendors, stays, transport, food, experiences and essential services throughout your travel route — not only at your final destination.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button onClick={() => router.push(builderHref)} iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group bg-emerald-500 text-white hover:bg-emerald-600 h-14 rounded-2xl text-xs">
              Start Planning Your Journey
            </Button>
            <Button onClick={() => router.push(discoverHref)} className="bg-transparent border border-white/25 text-white hover:bg-white/10 shadow-none h-14 rounded-2xl text-xs">
              Explore Services
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

      {/* ── 2 · HOW THE PLATFORM WORKS (USP) ─────────────────────────── */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="How it works"
            title="Local support at every point along your route."
            subtitle="We don't just connect you with vendors at your final destination — we help you find trusted local support throughout the complete journey."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {USP_STEPS.map((s, i) => (
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

      {/* ── 3 · SERVICE CATEGORIES ───────────────────────────────────── */}
      <section className="px-6 py-20 sm:py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="Service categories" title="Everything you need, wherever you are." subtitle="From your first stop to your last — pick what matters for this trip. Add or drop anything while you plan." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((c) => (
              <button key={c.label} type="button" onClick={() => router.push(builderHref)} className="group text-left bg-white border border-slate-100 rounded-[2rem] p-5 hover:border-emerald-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <span className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Icon name={c.icon} className="w-5 h-5" /></span>
                <h3 className="text-slate-900 font-black text-sm uppercase tracking-tight">{c.label}</h3>
                <p className="text-slate-500 text-xs mt-1 leading-snug">{c.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 · VERIFIED LOCAL VENDORS ───────────────────────────────── */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-10 sm:mb-14">
            <div className="max-w-xl">
              <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-3">Verified local vendors</span>
              <h2 className="text-slate-900 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight">Real local vendors, ready to help.</h2>
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

      {/* ── 5 · WHY LOCAL CONNECT ────────────────────────────────────── */}
      <section className="px-6 py-20 sm:py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="Why Local Connect" title="Not vendors only at the destination." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {WHY_POINTS.map((w) => (
              <div key={w.title} className="flex gap-4 bg-white border border-slate-100 rounded-[2rem] p-7">
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

      {/* ── 6 · TRAVELLER CTA + LOCAL VENDOR CTA ─────────────────────── */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Traveller */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-emerald-500/15 to-indigo-500/15 pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-white text-2xl font-black uppercase tracking-tight leading-tight">Ready to build your route?</h3>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed flex-1">Start with your route and dates. Add stops and needs. Request local options when you're ready.</p>
              <Button onClick={() => router.push(builderHref)} iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group mt-6 bg-emerald-500 text-white hover:bg-emerald-600 h-14 rounded-2xl text-xs w-full sm:w-fit">Build Your Route</Button>
            </div>
          </div>
          {/* Vendor */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-10 flex flex-col">
            <h3 className="text-slate-900 text-2xl font-black uppercase tracking-tight leading-tight">Are you a local service provider?</h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed flex-1">List your stay, transport, guiding or experience. Reach travellers passing through your area, on your terms.</p>
            <Button onClick={() => router.push(vendorHref)} iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group mt-6 bg-slate-900 text-white hover:bg-black h-14 rounded-2xl text-xs w-full sm:w-fit">Join as Local Provider</Button>
          </div>
        </div>
      </section>

      {/* ── Trust footer strip ───────────────────────────────────────── */}
      <section className="px-6 py-10 bg-slate-50 border-t border-slate-100">
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
