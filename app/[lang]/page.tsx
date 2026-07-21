"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n-config";
import LocalImage from "./components/atoms/Image";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "../loading";
import { useTripPlanner } from "@/contexts/TripPlannerContext";

type HomeProps = {
  params: Promise<{ lang: Locale }>;
};

// ─── Icon system ─────────────────────────────────────────────────────────────
// Data holds a semantic icon name; <Icon> renders the matching inline SVG.
// Stroke-based (feather/lucide style) so size + colour are controlled by CSS.

type IconName =
  | "search" | "message" | "shield-check"
  | "map-pin" | "calendar" | "users" | "target" | "compass" | "sparkles"
  | "home" | "car" | "utensils" | "tent" | "heart" | "camera" | "mountain"
  | "shield" | "lock" | "star" | "arrow-right";

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  message: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  "shield-check": <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>,
  "map-pin": <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  calendar: <><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  compass: <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>,
  sparkles: <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />,
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  car: <><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></>,
  utensils: <><path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  tent: <><path d="M3.5 21 14 3M20.5 21 10 3M15.5 21 12 15l-3.5 6M2 21h20" /></>,
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>,
  mountain: <path d="m8 3 4 8 5-5 5 15H2L8 3z" />,
  shield: <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />,
  lock: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  "arrow-right": <path d="M5 12h14M12 5l7 7-7 7" />,
};

function Icon({ name, className = "", filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

// ─── Static data ─────────────────────────────────────────────────────────────
// Copy lives in the dictionaries (dict.page.home); presentation-only bits
// (icons, sample provider records, category routing keys, counts) live here.

const LOCAL_PROVIDERS = [
  { id: "p1", name: "Tenzing Sherpa", role: "Mountain Guide", location: "Manali, HP", rating: 4.9, reviews: 142, tags: ["Trek", "Camping", "Rescue"], image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400", badge: "Elite" },
  { id: "p2", name: "Priya Homestay", role: "Host · 4 Rooms", location: "Old Manali", rating: 4.8, reviews: 89, tags: ["Rooms", "Meals", "Wi-Fi"], image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=400", badge: "Verified" },
  { id: "p3", name: "Arjun Thakur", role: "Local Food Guide", location: "Shimla, HP", rating: 4.7, reviews: 63, tags: ["Food", "Culture", "History"], image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400", badge: "Verified" },
  { id: "p4", name: "Sonam Wangchuk", role: "Transport Operator", location: "Leh, Ladakh", rating: 4.9, reviews: 211, tags: ["4x4", "Permits", "Ladakh"], image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400", badge: "Elite" },
  { id: "p5", name: "Kavya Nair", role: "Yoga & Wellness", location: "Rishikesh, UK", rating: 5.0, reviews: 47, tags: ["Yoga", "Meditation", "Detox"], image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400", badge: "New" },
  { id: "p6", name: "Rajan Chauhan", role: "River Rafting Pro", location: "Kullu, HP", rating: 4.8, reviews: 178, tags: ["Rafting", "Kayak", "Safety"], image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400", badge: "Verified" },
];

const STAT_META: { value: string; key: string; star?: boolean }[] = [
  { value: "2,400+", key: "providers" },
  { value: "18,000+", key: "travellers" },
  { value: "32", key: "districts" },
  { value: "4.9", key: "rating", star: true },
];

const HOW_ICONS: IconName[] = ["search", "message", "shield-check"];
const BUILDER_ICONS: IconName[] = ["map-pin", "calendar", "users", "target", "compass", "sparkles"];

// `cat` is the canonical (English) value used for /discover filtering — kept
// language-independent so filters work regardless of UI locale. `key` maps to
// the localized label in dict.page.home.categories.items.
const CATEGORY_META: { icon: IconName; key: string; cat: string; count: string }[] = [
  { icon: "compass", key: "guides", cat: "Guides", count: "480+" },
  { icon: "home", key: "homestays", cat: "Homestays", count: "620+" },
  { icon: "car", key: "transport", cat: "Transport", count: "310+" },
  { icon: "utensils", key: "food", cat: "Food", count: "190+" },
  { icon: "tent", key: "camping", cat: "Camping", count: "250+" },
  { icon: "heart", key: "wellness", cat: "Wellness", count: "140+" },
  { icon: "camera", key: "photography", cat: "Photography", count: "95+" },
  { icon: "mountain", key: "adventures", cat: "Adventures", count: "370+" },
];

const TRUST_META: { icon: IconName; key: string }[] = [
  { icon: "shield", key: "verified" },
  { icon: "lock", key: "escrow" },
  { icon: "message", key: "messaging" },
  { icon: "star", key: "reviews" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home({ params }: HomeProps) {
  const { dict, lang } = useLocalizationContext();
  useTripPlanner();

  const router = useRouter();

  const [sandboxRoute, setSandboxRoute] = useState("manali");
  const [addGuide, setAddGuide] = useState(true);
  const [addHomestay, setAddHomestay] = useState(true);
  const [addTransport, setAddTransport] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 2800);
    return () => clearInterval(interval);
  }, [isHovered]);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 40;
    if (diff > swipeThreshold) {
      setActiveStep((prev) => (prev + 1) % 6);
      setIsHovered(true);
    } else if (diff < -swipeThreshold) {
      setActiveStep((prev) => (prev - 1 + 6) % 6);
      setIsHovered(true);
    }
  };

  if (!dict) return <Loading />;

  // All landing copy — guarded so a missing key never crashes the page.
  const h = dict.page?.home ?? {};
  const hero = h.hero ?? {};
  const stats = h.stats ?? {};
  const builder = h.builder ?? {};
  const cats = h.categories ?? {};
  const providers = h.providers ?? {};
  const how = h.how ?? {};
  const join = h.join ?? {};
  const trust = h.trust ?? {};

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-slate-50 overflow-hidden px-4">
        {/* Grid and Blur backgrounds */}
        <div className="absolute inset-0 z-0 bg-grid-pattern opacity-100" />
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-[20%] right-[5%] w-96 h-96 bg-indigo-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Background image overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none">
          <LocalImage
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000"
            alt="Himalayan mountain range"
            className="w-full h-full object-cover scale-105 object-center"
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto pt-32 pb-20">
          {/* Network badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 text-[10px] font-black uppercase tracking-[0.25em]">
              {h.badge}
            </span>
          </div>

          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-950 leading-[1.05] tracking-tight mb-6 uppercase italic"
            dangerouslySetInnerHTML={{ __html: hero.title ?? "" }}
          />

          <p className="text-slate-600 text-sm sm:text-base font-semibold max-w-xl mx-auto leading-relaxed mb-10">
            {hero.subtitle}
          </p>

          {/* CTA buttons — traveler-first hierarchy */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              id="hero-plan-trip-btn"
              onClick={() => router.push(`/${lang}/builder`)}
              className="group w-full sm:w-auto min-h-12 h-12 px-8 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2.5 touch-manipulation duration-300"
            >
              {hero.cta_plan}
              <Icon name="arrow-right" className="w-4 h-4 transition-transform group-hover:translate-x-1.5 rtl:rotate-180" />
            </button>
            <button
              id="hero-explore-btn"
              onClick={() => router.push(`/${lang}/discover`)}
              className="w-full sm:w-auto min-h-12 h-12 px-8 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:border-slate-350 transition-all active:scale-95 touch-manipulation duration-300 shadow-sm"
            >
              {hero.cta_explore}
            </button>
          </div>

          {/* Vendor entry — demoted to text link */}
          <button
            id="hero-list-btn"
            onClick={() => router.push(`/${lang}/vendor/onboarding`)}
            className="mt-8 text-slate-400 hover:text-emerald-600 text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 touch-manipulation"
          >
            {hero.vendor_link}
            <Icon name="arrow-right" className="w-3 h-3 rtl:rotate-180" />
          </button>

          {/* Social proof strip */}
          <div className="mt-12 flex items-center justify-center gap-3.5 flex-wrap">
            <div className="flex -space-x-2.5">
              {["photo-1544620347-c4fd4a3d5957", "photo-1582719478250-c89cae4dc85b", "photo-1573496359142-b8d87734a5a2"].map((id, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-100">
                  <LocalImage
                    src={`https://images.unsplash.com/${id}?q=80&w=80`}
                    alt="Local provider portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="text-slate-500 text-xs font-semibold">
              <strong className="text-slate-900 font-extrabold">2,400+</strong> {hero.social_proof}
            </span>
          </div>
        </div>
      </section>

      {/* ── PLAN YOUR TRIP (BUILDER PREVIEW & SANDBOX) ────────────────── */}
      <section className="py-20 sm:py-28 px-4 bg-slate-950 text-white relative">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-[3rem] bg-slate-900/50 border border-slate-800/80 p-6 sm:p-14 relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-md">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-12">
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] block mb-3">
                  {builder.eyebrow}
                </span>
                <h2
                  className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic tracking-tight leading-tight mb-4"
                  dangerouslySetInnerHTML={{ __html: builder.title ?? "" }}
                />
                <p className="text-slate-400 text-xs sm:text-sm font-semibold max-w-lg mx-auto leading-relaxed">
                  {builder.subtitle}
                </p>
              </div>

              {/* Interactive Split-Panel Steps Walkthrough */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
                {/* Desktop Vertical Steps List (Visible on desktop only) */}
                <div className="hidden lg:flex lg:col-span-7 flex-col justify-between gap-3">
                  {BUILDER_ICONS.map((icon, i) => {
                    const step = builder.steps?.[i] ?? {};
                    const isActive = activeStep === i;
                    return (
                      <div
                        key={i}
                        onMouseEnter={() => {
                          setActiveStep(i);
                          setIsHovered(true);
                        }}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={() => {
                          setActiveStep(i);
                          setIsHovered(true);
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all duration-350 cursor-pointer flex items-center gap-4 ${isActive
                          ? "bg-slate-950 border-slate-800 text-white shadow-xl -translate-y-0.5"
                          : "bg-slate-900/40 border-slate-900/60 text-slate-400 hover:border-slate-800 hover:text-white"
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-950 text-slate-600"}`}>
                          <Icon name={icon} className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider leading-none">Step 0{i + 1}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-950 text-slate-600"}`}>
                              {isActive ? "Viewing" : "Explore"}
                            </span>
                          </div>
                          <p className="text-xs font-black uppercase tracking-wide leading-tight mt-1">{step.label}</p>
                          <p className={`text-[9px] leading-relaxed mt-0.5 font-semibold ${isActive ? "text-slate-350" : "text-slate-500"}`}>{step.desc || "Prepare your route specifications, stays, and preferences."}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Panel: Simulated Phone Mockup Screen with Swiping support */}
                <div className="lg:col-span-5 flex justify-center items-center">
                  <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="w-[280px] h-[460px] rounded-[2.5rem] bg-slate-950 p-4 border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between text-white select-none cursor-grab active:cursor-grabbing"
                  >
                    {/* Speaker notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center">
                      <div className="w-10 h-1 bg-slate-950 rounded-full" />
                    </div>

                    {/* Status bar */}
                    <div className="flex justify-between items-center px-3 pt-3 text-[8px] font-black text-slate-500 z-10 uppercase tracking-widest">
                      <span>9:41 AM</span>
                      <span className="text-emerald-400 font-extrabold flex items-center gap-1 animate-pulse">
                        Swipe ↔
                      </span>
                      <span>5G ⚡</span>
                    </div>

                    {/* Dynamic Screen Content */}
                    <div className="flex-1 mt-6 px-2 flex flex-col justify-center text-center">
                      {activeStep === 0 && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Icon name="map-pin" className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">1. Setup Your Route</p>
                            <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5">Delhi NCR ➔ Manali HP</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 text-left">
                            <div className="flex justify-between text-[7px] text-slate-500 font-bold uppercase">
                              <span>Origin</span>
                              <span className="text-white font-black">Delhi Terminal 3</span>
                            </div>
                            <div className="flex justify-between text-[7px] text-slate-500 font-bold uppercase">
                              <span>Destination</span>
                              <span className="text-emerald-400 font-black">Manali Orchard</span>
                            </div>
                            <div className="h-[2px] bg-white/5 my-1" />
                            <p className="text-[6px] text-slate-400 font-semibold uppercase text-center">640 KM Journey Map Generated</p>
                          </div>
                        </div>
                      )}

                      {activeStep === 1 && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Icon name="calendar" className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">2. Select Travel Dates</p>
                            <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5">July 24 ➔ July 30</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center space-y-2">
                            <p className="text-sm font-black text-white italic">6 nights</p>
                            <p className="text-[6px] text-slate-400 font-bold uppercase tracking-widest">Acclimatization day included</p>
                            <div className="grid grid-cols-7 gap-1 text-[6px] font-bold text-slate-500 pt-1 border-t border-white/5">
                              <span>M</span><span>T</span><span>W</span><span className="text-emerald-400">T</span><span className="text-emerald-400">F</span><span className="text-emerald-400">S</span><span className="text-emerald-400">S</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeStep === 2 && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Icon name="users" className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">3. Traveling Party</p>
                            <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5">Define passenger volume</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center space-y-2">
                            <p className="text-lg font-black text-emerald-400 italic">2 Adults</p>
                            <p className="text-[6px] text-slate-400 font-bold uppercase tracking-widest">Matched with private SUV size</p>
                          </div>
                        </div>
                      )}

                      {activeStep === 3 && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Icon name="target" className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">4. Service Preferences</p>
                            <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5">Filter by categories</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1.5 text-left">
                            <div className="flex justify-between items-center text-[7px] text-slate-300 font-bold uppercase bg-white/5 p-1.5 rounded">
                              <span>🏔️ Mountain Guides</span>
                              <span className="text-[6px] text-emerald-400 font-black">✓ ACTIVE</span>
                            </div>
                            <div className="flex justify-between items-center text-[7px] text-slate-300 font-bold uppercase bg-white/5 p-1.5 rounded">
                              <span>🏡 Orchard Stays</span>
                              <span className="text-[6px] text-emerald-400 font-black">✓ ACTIVE</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeStep === 4 && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Icon name="compass" className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">5. Stops Along Route</p>
                            <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5">Explore stops along pathway</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 text-left">
                            <div className="p-1.5 bg-white/5 rounded border border-white/5">
                              <p className="text-[7px] font-black text-emerald-400 uppercase">📍 Stop: Kullu Valley</p>
                              <p className="text-[6px] text-slate-400 font-bold uppercase mt-0.5">Guide: Tenzing matched</p>
                            </div>
                            <div className="p-1.5 bg-white/5 rounded border border-white/5">
                              <p className="text-[7px] font-black text-amber-400 uppercase">📍 Stop: Old Manali</p>
                              <p className="text-[6px] text-slate-400 font-bold uppercase mt-0.5">Stay: Priya Homestay matched</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeStep === 5 && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Icon name="sparkles" className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">6. Custom Consolidated Package</p>
                            <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5">Ready for instant checkout</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-left space-y-1">
                            <div className="flex justify-between text-[7px] font-bold text-slate-400">
                              <span>Tenzing Peak Guide</span>
                              <span>₹3,500</span>
                            </div>
                            <div className="flex justify-between text-[7px] font-bold text-slate-400">
                              <span>Priya Attic Room</span>
                              <span>₹2,200</span>
                            </div>
                            <div className="border-t border-white/10 pt-1.5 flex justify-between text-[8px] font-black text-emerald-400 uppercase">
                              <span>Combined Cost</span>
                              <span>₹5,700</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step Dots indicator */}
                    <div className="w-full flex justify-center gap-1.5 z-10 mt-2">
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveStep(idx);
                            setIsHovered(true);
                          }}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeStep === idx
                            ? "bg-emerald-400 w-3 shadow-[0_0_8px_#10b981]"
                            : "bg-slate-800 hover:bg-slate-700"
                            }`}
                          aria-label={`Go to step ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Bottom Indicator */}
                    <div className="w-full flex justify-center pb-2 pt-1">
                      <div className="w-16 h-1 bg-slate-800 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE ROUTE SANDBOX ────────────────── */}
      <section className="py-20 sm:py-28 px-4 bg-slate-950 text-white relative border-t border-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-[3rem] bg-slate-900/50 border border-slate-800/80 p-6 sm:p-14 relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-md">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-white text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Route Estimator & Sandbox Simulator
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Configurator */}
                <div className="lg:col-span-6 flex flex-col gap-6 justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5">1. Select a Route</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "manali", label: "Manali Loop" },
                        { key: "leh", label: "Leh Expedition" },
                        { key: "rishikesh", label: "Rishikesh Flow" }
                      ].map((routeOpt) => (
                        <button
                          key={routeOpt.key}
                          onClick={() => setSandboxRoute(routeOpt.key)}
                          className={`p-3.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all text-center ${sandboxRoute === routeOpt.key
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                              : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                        >
                          {routeOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5">2. Toggle Local Services</p>
                    <div className="space-y-2">
                      {[
                        { id: "guide", label: "🏔️ Elite Mountain Guide", desc: "Safety first, trail secrets", price: 3000, state: addGuide, setState: setAddGuide },
                        { id: "homestay", label: "🏡 Apple Orchard Homestay", desc: "Organic meals included", price: 2200, state: addHomestay, setState: setAddHomestay },
                        { id: "transport", label: "🚗 Private 4x4 Jeep Cab", desc: "Experienced pass navigator", price: 3500, state: addTransport, setState: setAddTransport },
                      ].map((serviceOpt) => (
                        <button
                          key={serviceOpt.id}
                          onClick={() => serviceOpt.setState(!serviceOpt.state)}
                          className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all group ${serviceOpt.state
                              ? "border-emerald-500 bg-emerald-500/10 text-white"
                              : "border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-slate-350"
                            }`}
                        >
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-wide ${serviceOpt.state ? "text-emerald-400" : "text-slate-300"}`}>
                              {serviceOpt.label}
                            </p>
                            <p className="text-[8px] text-slate-500 font-semibold uppercase mt-0.5">{serviceOpt.desc}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${serviceOpt.state ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"}`}>
                            +₹{serviceOpt.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visualizer Display Card */}
                <div className="lg:col-span-6 bg-slate-950 rounded-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden border border-slate-850 shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />

                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Route Package Preview</p>
                        <h4 className="text-lg font-black uppercase italic tracking-wide mt-1">
                          {sandboxRoute === "manali" ? "Manali Orchard Loop" : sandboxRoute === "leh" ? "Leh Valley Expedition" : "Rishikesh Wellness Flow"}
                        </h4>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/10 text-slate-300">
                        Live Cost
                      </span>
                    </div>

                    {/* Animated Route Line */}
                    <div className="my-6 p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                        <span>Start</span>
                        <span>Stops</span>
                        <span>End</span>
                      </div>

                      <div className="relative py-2">
                        <svg className="w-full h-8 text-emerald-400 overflow-visible" viewBox="0 0 100 20" fill="none">
                          <path id="route-path" d="M 5,10 Q 50,18 95,10" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="3 3" />
                          <path d="M 5,10 Q 50,18 95,10" stroke="currentColor" strokeWidth="2" strokeDasharray="100" strokeDashoffset="100" className="animate-dash" />

                          <circle cx="5" cy="10" r="3" fill="#10b981" />
                          <circle cx="50" cy="14" r="3" fill="#3b82f6" />
                          <circle cx="95" cy="10" r="3" fill="#f59e0b" />

                          {/* Animated Jeep/Car following route path */}
                          <g>
                            <text fontSize="5.5" dy="1.8" dx="-2.8">🚗</text>
                            <animateMotion dur="5.5s" repeatCount="indefinite">
                              <mpath href="#route-path" />
                            </animateMotion>
                          </g>

                          {/* Animated Hiker/Trekker following route path */}
                          <g>
                            <text fontSize="4.8" dy="1.6" dx="-2.4">🚶</text>
                            <animateMotion dur="9.5s" repeatCount="indefinite">
                              <mpath href="#route-path" />
                            </animateMotion>
                          </g>
                        </svg>
                      </div>

                      <div className="flex justify-between text-[9px] font-bold text-white uppercase tracking-tight">
                        <span>{sandboxRoute === "manali" ? "Delhi" : sandboxRoute === "leh" ? "Manali" : "Haridwar"}</span>
                        <span className="text-blue-400">{sandboxRoute === "manali" ? "Kullu" : sandboxRoute === "leh" ? "Jispa" : "Rishikesh"}</span>
                        <span className="text-amber-400">{sandboxRoute === "manali" ? "Manali" : sandboxRoute === "leh" ? "Leh" : "Devprayag"}</span>
                      </div>
                    </div>

                    {/* Selected Items details */}
                    <div className="space-y-1.5 mt-4 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                        <span>Base Route Rate</span>
                        <span>₹{sandboxRoute === "manali" ? 4000 : sandboxRoute === "leh" ? 8500 : 3000}</span>
                      </div>
                      {addGuide && (
                        <div className="flex justify-between text-[9px] font-bold text-emerald-400 uppercase">
                          <span>+ Elite Mountain Guide</span>
                          <span>₹3,000</span>
                        </div>
                      )}
                      {addHomestay && (
                        <div className="flex justify-between text-[9px] font-bold text-emerald-400 uppercase">
                          <span>+ Orchard Homestay</span>
                          <span>₹2,200</span>
                        </div>
                      )}
                      {addTransport && (
                        <div className="flex justify-between text-[9px] font-bold text-emerald-400 uppercase">
                          <span>+ Private 4x4 Jeep</span>
                          <span>₹3,500</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-4 flex flex-col gap-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Price Estimate</span>
                      <span className="text-3xl font-black italic text-emerald-400">
                        ₹{(sandboxRoute === "manali" ? 4000 : sandboxRoute === "leh" ? 8500 : 3000) + (addGuide ? 3000 : 0) + (addHomestay ? 2200 : 0) + (addTransport ? 3500 : 0)}
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/${lang}/builder?route=${sandboxRoute}&guide=${addGuide}&stay=${addHomestay}&ride=${addTransport}`)}
                      className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      {builder.cta}
                      <Icon name="arrow-right" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── LOCAL PROVIDERS GRID ───────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-2">
                {providers.eyebrow}
              </span>
              <h2 className="text-slate-900 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
                {providers.title}
              </h2>
            </div>
            <button
              id="view-all-locals-btn"
              onClick={() => router.push(`/${lang}/discover`)}
              className="shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b-2 border-emerald-500/20 pb-1 hover:text-emerald-700 hover:border-emerald-700 transition-all touch-manipulation"
            >
              {providers.view_all}
            </button>
          </div>

          {/* Provider cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOCAL_PROVIDERS.map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/${lang}/vendor/${p.id}`)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/${lang}/vendor/${p.id}`); } }}
                className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:border-emerald-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer active:scale-[0.99] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                {/* Top — avatar + badge */}
                <div className="flex items-start gap-4 p-6 pb-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-100 group-hover:border-emerald-400 transition-colors">
                    <LocalImage src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-slate-900 font-bold text-sm truncate">{p.name}</h3>
                        <span
                          className={`shrink-0 text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider ${p.badge === "Elite"
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : p.badge === "New"
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                        >
                          {p.badge}
                        </span>
                      </div>

                      {/* Copy Shareable Portfolio Link button */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${window.location.origin}/${lang}/vendor/${p.id}`);
                            setCopiedId(p.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all shadow-sm active:scale-95 ${copiedId === p.id
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20"
                              : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100"
                            }`}
                          title="Copy Public Portfolio Link"
                        >
                          {copiedId === p.id ? (
                            <svg className="w-3.5 h-3.5 animate-scaleIn" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l5.028-2.514m0 0a3 3 0 10-2.514-5.028 3 3 0 002.514 5.028zm0 5.028l-5.028-2.514m0 0a3 3 0 102.514 5.028 3 3 0 00-2.514-5.028zm0 0a3 3 0 11-5.028 2.514 3 3 0 015.028-2.514z" />
                            </svg>
                          )}
                        </button>

                        {copiedId === p.id && (
                          <span className="absolute bottom-full right-0 mb-2 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-emerald-500 text-white rounded-md shadow-md animate-fadeIn whitespace-nowrap z-20">
                            Copied!
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide text-[9px]">{p.role}</p>
                    <p className="text-slate-400 text-[10px] mt-1 flex items-center gap-1 font-medium min-w-0">
                      <Icon name="map-pin" className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 px-6 pb-5 flex-wrap">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Bottom — rating + CTA */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/30">
                  <div className="flex items-center gap-1.5">
                    <Icon name="star" filled className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-900 text-xs font-bold">{p.rating}</span>
                    <span className="text-slate-400 text-[10px] font-semibold">({p.reviews} reviews)</span>
                  </div>
                  <span className="h-8 px-4 inline-flex items-center rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest group-hover:bg-emerald-500 transition-colors duration-300 shadow-sm shadow-slate-900/10">
                    View Profile
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── JOIN THE NETWORK CTA ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 sm:p-14 text-center relative overflow-hidden shadow-xl shadow-emerald-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_70%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                  {join.badge}
                </span>
              </div>

              <h2
                className="text-white text-2xl sm:text-4xl font-black tracking-tight mb-4 leading-tight"
                dangerouslySetInnerHTML={{ __html: join.title ?? "" }}
              />
              <p className="text-emerald-50/90 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
                {join.subtitle}
              </p>

              {/* Two short CTA buttons side by side */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  id="cta-list-service-btn"
                  onClick={() => router.push(`/${lang}/vendor/onboarding`)}
                  className="w-full sm:w-auto min-h-11 h-11 px-7 rounded-xl bg-white text-emerald-700 font-bold text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg hover:bg-emerald-50 touch-manipulation"
                >
                  {join.cta_join}
                </button>
                <button
                  id="cta-learn-more-btn"
                  onClick={() => router.push(`/${lang}/about`)}
                  className="w-full sm:w-auto min-h-11 h-11 px-7 rounded-xl border border-white/40 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all active:scale-95 touch-manipulation"
                >
                  {join.cta_learn}
                </button>
              </div>

              <p className="text-emerald-50/80 text-[10px] mt-5 uppercase tracking-wider">
                {join.note}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST FOOTER STRIP ─────────────────────────────────────── */}
      <section className="py-10 px-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          {TRUST_META.map((t) => (
            <div key={t.key} className="flex items-center gap-2.5 text-slate-600">
              <Icon name={t.icon} filled={t.icon === "star"} className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{trust[t.key]}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
