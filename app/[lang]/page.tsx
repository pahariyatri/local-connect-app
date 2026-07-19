"use client";

import React from "react";
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

// ─── Static data ────────────────────────────────────────────────────────────

const LOCAL_PROVIDERS = [
  {
    id: "p1",
    name: "Tenzing Sherpa",
    role: "Mountain Guide",
    location: "Manali, HP",
    rating: 4.9,
    reviews: 142,
    tags: ["Trek", "Camping", "Rescue"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400",
    badge: "Elite",
  },
  {
    id: "p2",
    name: "Priya Homestay",
    role: "Host · 4 Rooms",
    location: "Old Manali",
    rating: 4.8,
    reviews: 89,
    tags: ["Rooms", "Meals", "Wi-Fi"],
    image: "https://images.unsplash.com/photo-1651319485646-f0f30e46b761?q=80&w=400",
    badge: "Verified",
  },
  {
    id: "p3",
    name: "Arjun Thakur",
    role: "Local Food Guide",
    location: "Shimla, HP",
    rating: 4.7,
    reviews: 63,
    tags: ["Food", "Culture", "History"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400",
    badge: "Verified",
  },
  {
    id: "p4",
    name: "Sonam Wangchuk",
    role: "Transport Operator",
    location: "Leh, Ladakh",
    rating: 4.9,
    reviews: 211,
    tags: ["4x4", "Permits", "Ladakh"],
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400",
    badge: "Elite",
  },
  {
    id: "p5",
    name: "Kavya Nair",
    role: "Yoga & Wellness",
    location: "Rishikesh, UK",
    rating: 5.0,
    reviews: 47,
    tags: ["Yoga", "Meditation", "Detox"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400",
    badge: "New",
  },
  {
    id: "p6",
    name: "Rajan Chauhan",
    role: "River Rafting Pro",
    location: "Kullu, HP",
    rating: 4.8,
    reviews: 178,
    tags: ["Rafting", "Kayak", "Safety"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
    badge: "Verified",
  },
];

const STATS = [
  { value: "2,400+", label: "Local Providers" },
  { value: "18,000+", label: "Happy Travellers" },
  { value: "32", label: "Himalayan Districts" },
  { value: "4.9", label: "Avg. Rating", star: true },
];

const HOW_IT_WORKS: { step: string; icon: IconName; title: string; desc: string }[] = [
  {
    step: "01",
    icon: "search",
    title: "Browse Locals",
    desc: "Search verified guides, hosts, and operators near your destination.",
  },
  {
    step: "02",
    icon: "message",
    title: "Chat Direct",
    desc: "Message providers in real-time — no middlemen, no call centres.",
  },
  {
    step: "03",
    icon: "shield-check",
    title: "Book & Go",
    desc: "Pay securely via escrow. Your money releases only after service.",
  },
];

const BUILDER_STEPS: { n: string; icon: IconName; label: string; desc: string }[] = [
  { n: "01", icon: "map-pin", label: "Route", desc: "Origin & destinations" },
  { n: "02", icon: "calendar", label: "Dates", desc: "When you travel" },
  { n: "03", icon: "users", label: "Party", desc: "Who's coming" },
  { n: "04", icon: "target", label: "Interests", desc: "What you love" },
  { n: "05", icon: "compass", label: "Stops", desc: "Along the way" },
  { n: "06", icon: "sparkles", label: "Package", desc: "Ready to book" },
];

const CATEGORIES: { icon: IconName; label: string; count: string }[] = [
  { icon: "compass", label: "Guides", count: "480+" },
  { icon: "home", label: "Homestays", count: "620+" },
  { icon: "car", label: "Transport", count: "310+" },
  { icon: "utensils", label: "Food Tours", count: "190+" },
  { icon: "tent", label: "Camping", count: "250+" },
  { icon: "heart", label: "Wellness", count: "140+" },
  { icon: "camera", label: "Photography", count: "95+" },
  { icon: "mountain", label: "Adventures", count: "370+" },
];

const TRUST: { icon: IconName; label: string }[] = [
  { icon: "shield", label: "Verified Providers" },
  { icon: "lock", label: "Escrow Payments" },
  { icon: "message", label: "Direct Messaging" },
  { icon: "star", label: "Rated Reviews" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home({ params }: HomeProps) {
  const { dict, lang } = useLocalizationContext();
  useTripPlanner();

  const router = useRouter();

  if (!dict) return <Loading />;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-slate-50 overflow-hidden px-4">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <LocalImage
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000"
            alt="Himalayan mountain range"
            className="w-full h-full object-cover opacity-15 scale-105 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/80 to-slate-50" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto pt-24 pb-16">
          {/* Network badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-[0.25em]">
              Local Connect Network
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-6">
            Meet the{" "}
            <span className="text-emerald-600">Real Locals</span>
            <br />
            of the Himalayas
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Connect directly with verified guides, hosts &amp; operators.
            No packages. No agencies. Just authentic local service.
          </p>

          {/* CTA buttons — traveler-first hierarchy */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="hero-plan-trip-btn"
              onClick={() => router.push(`/${lang}/builder`)}
              className="group w-full sm:w-auto h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              Plan My Trip
              <Icon name="arrow-right" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              id="hero-explore-btn"
              onClick={() => router.push(`/${lang}/discover`)}
              className="w-full sm:w-auto h-12 px-8 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm uppercase tracking-wider hover:bg-slate-100 hover:border-slate-400 transition-all active:scale-95"
            >
              Explore Locals
            </button>
          </div>

          {/* Vendor entry — demoted to text link */}
          <button
            id="hero-list-btn"
            onClick={() => router.push(`/${lang}/vendor/onboarding`)}
            className="mt-5 text-slate-500 hover:text-emerald-600 text-xs font-medium uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
          >
            Are you a local? List your service
            <Icon name="arrow-right" className="w-3 h-3" />
          </button>

          {/* Social proof strip */}
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            <div className="flex -space-x-2">
              {["photo-1544620347-c4fd4a3d5957","photo-1582719478250-c89cae4dc85b","photo-1573496359142-b8d87734a5a2"].map((id, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden">
                  <LocalImage
                    src={`https://images.unsplash.com/${id}?q=80&w=80`}
                    alt="Local provider portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="text-slate-600 text-xs">
              <strong className="text-slate-900">2,400+</strong> locals ready to connect
            </span>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-slate-200">
          {STATS.map((s) => (
            <div key={s.label} className="text-center px-4">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight inline-flex items-center justify-center gap-1">
                {s.value}
                {s.star && <Icon name="star" filled className="w-5 h-5 text-amber-400" />}
              </p>
              <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLAN YOUR TRIP (BUILDER PREVIEW) ────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-100 p-8 sm:p-12 relative overflow-hidden shadow-sm">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-10">
                <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em] block mb-3">
                  For Travellers
                </span>
                <h2 className="text-slate-900 text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
                  Build Your Trip in <span className="text-emerald-600">6 Steps</span>
                </h2>
                <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                  Tell us your route, dates &amp; interests — we&apos;ll match you with verified
                  locals along the whole way and turn it into one bookable package.
                </p>
              </div>

              {/* Step chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 mb-10">
                {BUILDER_STEPS.map((s) => (
                  <div
                    key={s.n}
                    className="flex flex-col items-center text-center gap-1.5 p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm"
                  >
                    <Icon name={s.icon} className="w-6 h-6 text-emerald-500" />
                    <span className="text-emerald-600 text-[8px] font-black tracking-widest">{s.n}</span>
                    <span className="text-slate-900 text-[10px] sm:text-xs font-bold leading-tight">{s.label}</span>
                    <span className="text-slate-500 text-[8px] sm:text-[9px] leading-tight hidden sm:block">{s.desc}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  id="builder-preview-cta"
                  onClick={() => router.push(`/${lang}/builder`)}
                  className="group w-full sm:w-auto h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  Start Building — Free
                  <Icon name="arrow-right" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider">
                  No sign-up needed · Takes ~2 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-slate-900 font-black text-lg sm:text-xl mb-6 tracking-tight">
            Browse by Category
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                id={`cat-${cat.label.toLowerCase()}`}
                onClick={() => router.push(`/${lang}/discover?category=${cat.label}`)}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group active:scale-95"
              >
                <Icon name={cat.icon} className="w-6 h-6 text-slate-700 group-hover:text-emerald-600 transition-colors" />
                <span className="text-slate-900 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide leading-tight text-center">{cat.label}</span>
                <span className="text-emerald-600 text-[8px] sm:text-[9px] font-bold">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCAL PROVIDERS GRID ───────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">
                Verified Locals
              </span>
              <h2 className="text-slate-900 text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                People, Not Packages
              </h2>
            </div>
            <button
              id="view-all-locals-btn"
              onClick={() => router.push(`/${lang}/discover`)}
              className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-500/40 pb-0.5 hover:text-emerald-700 transition-colors"
            >
              View All
            </button>
          </div>

          {/* Provider cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {LOCAL_PROVIDERS.map((p) => (
              <div
                key={p.id}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/${lang}/discover`)}
              >
                {/* Top — avatar + badge */}
                <div className="flex items-start gap-4 p-5 pb-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 border-slate-200 group-hover:border-emerald-400 transition-colors">
                    <LocalImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-slate-900 font-bold text-sm truncate">{p.name}</h3>
                      <span
                        className={`shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                          p.badge === "Elite"
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : p.badge === "New"
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        }`}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">{p.role}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1">
                      <Icon name="map-pin" className="w-2.5 h-2.5" />
                      {p.location}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 px-5 pb-4 flex-wrap">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-bold uppercase text-slate-500 border border-slate-200 rounded-lg px-2 py-0.5 tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Bottom — rating + CTA */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
                  <div className="flex items-center gap-1.5">
                    <Icon name="star" filled className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-900 text-xs font-bold">{p.rating}</span>
                    <span className="text-slate-400 text-[10px]">({p.reviews})</span>
                  </div>
                  <button className="h-8 px-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all active:scale-95">
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em] block mb-3">
              Simple Process
            </span>
            <h2 className="text-slate-900 text-2xl sm:text-4xl font-black tracking-tight">
              How Local Connect Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-200">
                {/* Connector line on desktop */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-4 w-8 h-px bg-slate-200 z-10" />
                )}
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                  <Icon name={step.icon} className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-emerald-600 text-[9px] font-black uppercase tracking-widest mb-2">
                  Step {step.step}
                </span>
                <h3 className="text-slate-900 font-bold text-sm mb-2">{step.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
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
                  Are you a local?
                </span>
              </div>

              <h2 className="text-white text-2xl sm:text-4xl font-black tracking-tight mb-4 leading-tight">
                Grow Your Income.<br />
                <span className="text-emerald-50">Join the Network.</span>
              </h2>
              <p className="text-emerald-50/90 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
                List your service — free to join. Get discovered by thousands of travellers looking for real, local experiences.
              </p>

              {/* Two short CTA buttons side by side */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  id="cta-list-service-btn"
                  onClick={() => router.push(`/${lang}/vendor/onboarding`)}
                  className="w-full sm:w-auto h-11 px-7 rounded-xl bg-white text-emerald-700 font-bold text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg hover:bg-emerald-50"
                >
                  Join Free
                </button>
                <button
                  id="cta-learn-more-btn"
                  onClick={() => router.push(`/${lang}/about`)}
                  className="w-full sm:w-auto h-11 px-7 rounded-xl border border-white/40 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all active:scale-95"
                >
                  Learn More
                </button>
              </div>

              <p className="text-emerald-50/80 text-[10px] mt-5 uppercase tracking-wider">
                Free listing · No commission on first 3 bookings · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST FOOTER STRIP ─────────────────────────────────────── */}
      <section className="py-10 px-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          {TRUST.map((t) => (
            <div key={t.label} className="flex items-center gap-2.5 text-slate-600">
              <Icon name={t.icon} filled={t.icon === "star"} className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{t.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
