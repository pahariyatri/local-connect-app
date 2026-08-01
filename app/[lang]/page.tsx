"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n-config";
import Button from "./components/atoms/Button";
import LocalImage from "./components/atoms/Image";
import VerifiedBadge from "./components/atoms/VerifiedBadge";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "../loading";
import api from "@/lib/apiClient";

type HomeProps = {
  params: Promise<{ lang: Locale }>;
};

// ─── Icon system — inline stroke SVGs, no external requests ──────────────────

type IconName = "map-pin" | "flag" | "home" | "car" | "utensils" | "mountain" | "compass" | "check" | "arrow-right";

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  "map-pin": <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></>,
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  car: <><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></>,
  utensils: <><path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  mountain: <path d="m8 3 4 8 5-5 5 15H2L8 3z" />,
  compass: <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  "arrow-right": <path d="M5 12h14M12 5l7 7-7 7" />,
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {ICON_PATHS[name]}
    </svg>
  );
}

// ─── Scroll-reveal animation wrapper (IntersectionObserver + CSS transition) ─

function Reveal({ children, className = "", delayMs = 0 }: { children: React.ReactNode; className?: string; delayMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-750 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/** A route line that draws in once when scrolled into view, then stays put — no looping motion. */
function RouteLine({ className = "", delayMs = 0 }: { className?: string; delayMs?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg ref={ref} className={className} viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true">
      <line
        x1="0" y1="1" x2="100" y2="1"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="100"
        strokeDashoffset={drawn ? 0 : 100}
        style={{ transition: `stroke-dashoffset 1.1s ease-out ${drawn ? delayMs : 0}ms` }}
      />
    </svg>
  );
}

/**
 * The day-by-day route timeline: icon markers pop in and the connecting
 * line grows to meet them, staggered top to bottom — a single, purposeful
 * reveal (not a loop) once the section enters view.
 */
function RouteTimeline({ days }: { days: typeof ROUTE_DAYS }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {days.map((d, i) => (
        <div key={d.day} className="flex gap-6">
          <div className="flex flex-col items-center flex-shrink-0">
            <span
              className={`w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center transition-all duration-500 ease-out ${visible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
              style={{ transitionDelay: visible ? `${i * 180}ms` : "0ms" }}
            >
              <Icon name={d.icon} className="w-4 h-4" />
            </span>
            {i < days.length - 1 && (
              <span className="w-0.5 flex-1 bg-slate-100 my-1 relative overflow-hidden">
                <span
                  className={`absolute inset-x-0 top-0 w-full bg-emerald-400 transition-all ease-out ${visible ? "h-full" : "h-0"}`}
                  style={{ transitionDuration: "600ms", transitionDelay: visible ? `${i * 180 + 150}ms` : "0ms" }}
                />
              </span>
            )}
          </div>
          <div
            className={`transition-all duration-500 ease-out ${i < days.length - 1 ? "pb-12" : ""} ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
            style={{ transitionDelay: visible ? `${i * 180 + 80}ms` : "0ms" }}
          >
            <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Day {d.day}</span>
            <p className="text-slate-900 font-black text-2xl sm:text-3xl mt-1.5 tracking-tight">{d.from} <span className="text-slate-300">&rarr;</span> {d.to}</p>
            <p className="text-slate-400 text-sm mt-1.5">{d.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Illustrative example content (labelled "Example" wherever shown) ───────

const ROUTE_DAYS: { day: number; from: string; to: string; note: string; icon: IconName }[] = [
  { day: 1, from: "Chandigarh", to: "Kasol", note: "Lunch stop", icon: "utensils" },
  { day: 2, from: "Kasol", to: "Kullu", note: "Local activity", icon: "mountain" },
  { day: 3, from: "Kullu", to: "Manali", note: "Stay", icon: "home" },
];

const PACKAGE_PREVIEW = {
  route: "Chandigarh → Kasol → Manali",
  total: 18500,
  days: [
    { day: 1, items: [{ icon: "home" as IconName, label: "Stay" }, { icon: "utensils" as IconName, label: "Meals" }] },
    { day: 2, items: [{ icon: "car" as IconName, label: "Taxi" }, { icon: "mountain" as IconName, label: "Adventure" }] },
    { day: 3, items: [{ icon: "home" as IconName, label: "Stay" }, { icon: "utensils" as IconName, label: "Meals" }] },
  ],
};

const CATEGORY_ICONS: Record<string, IconName> = {
  homestays: "home",
  food: "utensils",
  transport: "car",
  adventures: "mountain",
  camping: "mountain",
  guides: "compass",
  wellness: "compass",
  photography: "compass",
};
const CATEGORY_ORDER = ["homestays", "food", "transport", "adventures", "guides"];

// ─── Vendor mapping — mirrors the shape already used across the app; no
// fabricated ratings or review counts. ───────────────────────────────────────

const CATEGORY_IMAGES: Record<string, string> = {
  Stay: "https://images.unsplash.com/photo-1768490219497-94bcc4b78e52?q=80&w=600",
  Adventure: "https://images.unsplash.com/photo-1574116504481-e06341e984e1?q=80&w=600",
  Transport: "https://images.unsplash.com/photo-1772249491385-e9f6facf5be3?q=80&w=600",
  Food: "https://images.unsplash.com/photo-1727404679933-99daa2a7573a?q=80&w=600",
};

const LOCAL_PROVIDERS = [
  { id: "p1", name: "Priya Homestay", category: "Stay", location: "Old Manali", image: CATEGORY_IMAGES.Stay, isVerified: true },
  { id: "p2", name: "Rajan Chauhan", category: "Adventure", location: "Kullu, HP", image: CATEGORY_IMAGES.Adventure, isVerified: true },
  { id: "p3", name: "Sonam Wangchuk", category: "Transport", location: "Leh, Ladakh", image: CATEGORY_IMAGES.Transport, isVerified: true },
  { id: "p4", name: "Arjun Thakur", category: "Food", location: "Shimla, HP", image: CATEGORY_IMAGES.Food, isVerified: false },
];

function mapBackendVendor(v: any) {
  const typeMap: Record<string, string> = { hotel: "Stay", restaurant: "Food", transport: "Transport", adventure: "Adventure" };
  const category = typeMap[v.types?.[0]?.toLowerCase()] || "Stay";
  const lowerName = (v.businessName || "").toLowerCase();
  const knownTowns = ["dharamshala", "tirthan", "spiti", "leh", "rishikesh", "shimla", "manali"];
  const location = knownTowns.find((t) => lowerName.includes(t));
  return {
    id: v.id,
    name: (v.businessName || "").replace(/\s*\(.*?\)\s*/g, "").trim(),
    category,
    location: location ? location[0].toUpperCase() + location.slice(1) : "Himachal Pradesh",
    image: CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Stay,
    isVerified: !!v.isVerified,
  };
}

// ─── Section heading — matches the app's uppercase-eyebrow convention ───────

function SectionHeading({ eyebrow, title, subtitle, center = false, dark = false }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean; dark?: boolean }) {
  return (
    <div className={`${center ? "text-center mx-auto" : ""} max-w-2xl`}>
      {eyebrow && <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-4">{eyebrow}</span>}
      <h2 className={`text-4xl sm:text-5xl font-black leading-[1.02] tracking-tight [text-wrap:balance] ${dark ? "text-white" : "text-slate-900"}`}>{title}</h2>
      {subtitle && <p className={`text-base mt-4 leading-relaxed ${dark ? "text-slate-300" : "text-slate-500"}`}>{subtitle}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home({ params }: HomeProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const { dict, lang } = useLocalizationContext();
  const router = useRouter();

  const [providersList, setProvidersList] = useState(LOCAL_PROVIDERS);
  const [isProvidersLoading, setIsProvidersLoading] = useState(true);

  useEffect(() => {
    if (!dict) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await api.get("/vendors", { sessionCache: true });
        if (!cancelled && Array.isArray(response) && response.length) {
          setProvidersList(response.slice(0, 4).map(mapBackendVendor));
        }
      } catch {
        // No backend reachable (or vendors unavailable) — the curated
        // LOCAL_PROVIDERS fallback above already covers this, so this is
        // expected/handled, not worth surfacing as an error.
      } finally {
        if (!cancelled) setIsProvidersLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dict]);

  if (!dict) return <Loading />;

  const pageDict = (dict as any)?.page?.home || {};
  const heroDict = pageDict?.hero || {};
  const builderDict = pageDict?.builder || {};
  const categoriesDict = pageDict?.categories || {};
  const categoryItems: Record<string, string> = categoriesDict?.items || {};
  const providersDict = pageDict?.providers || {};
  const joinDict = pageDict?.join || {};
  const trustDict = pageDict?.trust || {};

  const categoryPills = CATEGORY_ORDER
    .filter((key) => categoryItems[key])
    .map((key) => ({ key, label: categoryItems[key], icon: CATEGORY_ICONS[key] || "compass" }));

  const trustBadges = [trustDict.verified, trustDict.escrow, trustDict.messaging, trustDict.reviews].filter(Boolean);

  const builderHref = `/${lang}/builder`;
  const vendorHref = `/${lang}/vendor/onboarding`;
  const discoverHref = `/${lang}/discover`;
  const aboutHref = `/${lang}/about`;
  const communityHref = `/${lang}/community`;
  const termsHref = `/${lang}/terms-conditions`;
  const privacyHref = `/${lang}/privacy-policy`;

  return (
    <main className="bg-white min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-900 overflow-x-hidden">
      {/* ── 1 · HERO ─────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-36 md:pt-48 pb-20 md:pb-28 border-b border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-20 items-center">
          <div>
            {pageDict?.badge && (
              <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-5 animate-fade-in">
                {pageDict.badge}
              </span>
            )}
            <h1
              className="text-5xl md:text-7xl font-black leading-[0.98] tracking-tight text-slate-900 animate-fade-in [text-wrap:balance]"
              dangerouslySetInnerHTML={{ __html: heroDict?.title || "Plan the whole <span class=\"text-emerald-600\">journey</span>." }}
            />
            <p className="mt-6 text-slate-500 font-normal text-base md:text-lg leading-relaxed max-w-md animate-fade-in" style={{ animationDelay: "80ms" }}>
              {heroDict?.subtitle || "One package for stays, food, transport and activities — planned stop by stop."}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: "160ms" }}>
              <Button onClick={() => router.push(builderHref)} variant="primary" iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group btn-primary rounded-full h-control px-9 text-xs">
                {heroDict?.cta_plan || "Start Planning"}
              </Button>
              <Button onClick={() => router.push(discoverHref)} className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 shadow-none rounded-full h-control px-9 text-xs">
                {heroDict?.cta_explore || "Explore Locals"}
              </Button>
            </div>
          </div>

          {/* Product visual: the route itself, not a stock photo. Markers pop in,
              the route line draws to connect them, then the services settle in —
              one purposeful sequence, not a loop. */}
          <div className="hidden sm:block relative animate-fade-in" style={{ animationDelay: "120ms" }}>
            <div className="relative rounded-panel border border-slate-100 shadow-float bg-white p-8 sm:p-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 animate-scale-in" style={{ animationDelay: "260ms", animationFillMode: "both" }}>
                  <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0"><Icon name="map-pin" className="w-4 h-4" /></span>
                  <span className="text-slate-900 text-xs font-black uppercase tracking-tight">Chandigarh</span>
                </div>
                <div className="flex items-center gap-3 animate-scale-in" style={{ animationDelay: "340ms", animationFillMode: "both" }}>
                  <span className="text-slate-900 text-xs font-black uppercase tracking-tight">Manali</span>
                  <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0"><Icon name="flag" className="w-4 h-4" /></span>
                </div>
              </div>

              <RouteLine className="w-full h-2 text-emerald-300 my-8" delayMs={420} />

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { icon: "home" as IconName, label: categoryItems.homestays || "Stay" },
                  { icon: "utensils" as IconName, label: categoryItems.food || "Food" },
                  { icon: "car" as IconName, label: categoryItems.transport || "Transport" },
                ].map((s, i) => (
                  <span
                    key={s.label}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 animate-fade-in"
                    style={{ animationDelay: `${1500 + i * 100}ms`, animationFillMode: "both" }}
                  >
                    <Icon name={s.icon} className="w-3.5 h-3.5 text-emerald-500" />{s.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · ROUTE, DAY BY DAY ────────────────────────────────────────── */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <SectionHeading eyebrow="Your route" title="The journey, day by day." subtitle="Every stop planned in advance, not figured out on arrival." center />
          </Reveal>
          <div className="mt-16">
            <RouteTimeline days={ROUTE_DAYS} />
          </div>
        </div>
      </section>

      {/* ── 3 · BUILD YOUR PACKAGE ───────────────────────────────────────── */}
      <section className="px-6 py-24 md:py-32 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionHeading
              title="Combine services into one package."
              subtitle={builderDict?.subtitle || "Route, dates and interests — turned into one bookable package."}
            />
          </Reveal>

          {categoryPills.length > 0 && (
            <Reveal delayMs={80} className="mt-12">
              <div className="flex flex-wrap gap-3">
                {categoryPills.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => router.push(builderHref)}
                    className="group inline-flex items-center gap-2.5 bg-white border border-slate-200 rounded-full pl-2.5 pr-5 py-2.5 hover:border-emerald-300 hover:bg-emerald-50 transition-colors active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-emerald-500 transition-colors"><Icon name={c.icon} className="w-4 h-4" /></span>
                    <span className="text-slate-900 text-sm font-bold">{c.label}</span>
                  </button>
                ))}
              </div>
            </Reveal>
          )}

          {/* One package summary: route, days, price, single action */}
          <Reveal delayMs={140} className="mt-12">
            <div className="bg-white rounded-panel shadow-float p-7 sm:p-9 max-w-md">
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-900 font-black text-sm uppercase tracking-tight">{PACKAGE_PREVIEW.route}</p>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Example</span>
              </div>
              <div className="space-y-5">
                {PACKAGE_PREVIEW.days.map((d) => (
                  <div key={d.day} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">D{d.day}</span>
                    <div className="flex gap-2 flex-wrap">
                      {d.items.map((it) => (
                        <span key={it.label} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                          <Icon name={it.icon} className="w-3 h-3 text-emerald-500" />{it.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-7 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated total</span>
                <span className="text-3xl font-black text-slate-900">₹{PACKAGE_PREVIEW.total.toLocaleString()}</span>
              </div>
              <Button onClick={() => router.push(builderHref)} variant="primary" iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group btn-primary mt-6 w-full h-control rounded-2xl text-xs">
                {builderDict?.cta || "Start building"}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 4 · LOCAL VENDORS ────────────────────────────────────────────── */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between gap-4 mb-12">
              <SectionHeading eyebrow={providersDict?.eyebrow || "Verified locals"} title={providersDict?.title || "People, not packages."} />
              <button onClick={() => router.push(discoverHref)} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b-2 border-emerald-500/20 pb-1 hover:text-emerald-700 hover:border-emerald-700 transition-all">
                {providersDict?.view_all || "View all"}
              </button>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isProvidersLoading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-card p-5 space-y-3 animate-pulse">
                    <div className="w-full h-40 rounded-2xl bg-slate-200" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                ))
              : providersList.map((p, i) => (
                  <Reveal key={p.id} delayMs={(i % 4) * 70}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/${lang}/vendor/${p.id}`)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/${lang}/vendor/${p.id}`); } }}
                      className="group bg-white border border-slate-100 rounded-card overflow-hidden hover:border-emerald-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      <div className="relative h-40 overflow-hidden">
                        <LocalImage src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {p.isVerified && (
                          <div className="absolute top-3 left-3">
                            <VerifiedBadge showText={false} />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-slate-900 font-bold text-sm truncate">{p.name}</h3>
                        <p className="text-slate-500 text-[9px] font-semibold uppercase tracking-wide mt-1.5">{p.category}</p>
                        <p className="text-slate-400 text-[10px] mt-2 flex items-center gap-1"><Icon name="map-pin" className="w-3 h-3 flex-shrink-0" /><span className="truncate">{p.location}</span></p>
                        <span className="mt-4 inline-flex items-center h-9 px-4 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest group-hover:bg-emerald-500 transition-colors duration-300">
                          {providersDict?.connect || "Connect"}
                        </span>
                      </div>
                    </div>
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      {/* ── 5 · JOIN AS A LOCAL PROVIDER ─────────────────────────────────── */}
      {joinDict?.title && (
        <section className="px-6 py-24 md:py-32 bg-slate-50">
          <Reveal>
            <div className="max-w-4xl mx-auto bg-slate-900 rounded-panel p-12 sm:p-16 text-center">
              {joinDict?.badge && <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] block mb-5">{joinDict.badge}</span>}
              <h2 className="text-white text-4xl sm:text-5xl font-black leading-[1.02] tracking-tight [text-wrap:balance]" dangerouslySetInnerHTML={{ __html: joinDict.title }} />
              {joinDict?.subtitle && <p className="text-slate-300 text-base mt-5 max-w-md mx-auto leading-relaxed">{joinDict.subtitle}</p>}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={() => router.push(vendorHref)} variant="primary" iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group bg-emerald-500 hover:bg-emerald-600 text-white h-control rounded-full px-9 text-xs w-full sm:w-auto">
                  {joinDict?.cta_join || "Join free"}
                </Button>
                {joinDict?.cta_learn && (
                  <Button onClick={() => router.push(aboutHref)} className="bg-transparent border border-white/25 text-white hover:bg-white/10 shadow-none h-control rounded-full px-9 text-xs w-full sm:w-auto">
                    {joinDict.cta_learn}
                  </Button>
                )}
              </div>
              {joinDict?.note && <p className="text-slate-500 text-[10px] font-medium mt-7 uppercase tracking-wider">{joinDict.note}</p>}
            </div>
          </Reveal>
        </section>
      )}

      {/* ── 6 · TRUST ─────────────────────────────────────────────────────── */}
      {trustBadges.length > 0 && (
        <section className="px-6 py-20">
          <Reveal>
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustBadges.map((b) => (
                <div key={b} className="flex flex-col items-center text-center gap-3 p-4">
                  <span className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Icon name="check" className="w-4 h-4" /></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 leading-snug">{b}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ── 7 · FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="px-6 py-28 md:py-40">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-slate-900 text-5xl sm:text-6xl font-black leading-[1.02] tracking-tight [text-wrap:balance]">Ready when you are.</h2>
            <p className="text-slate-500 text-base mt-5 max-w-md mx-auto leading-relaxed">
              One route, planned end to end, with local support at every stop.
            </p>
            <Button onClick={() => router.push(builderHref)} variant="primary" iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group btn-primary mt-10 rounded-full h-control px-9 text-xs mx-auto">
              {heroDict?.cta_plan || "Start Planning"}
            </Button>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="px-6 py-12 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">LC</span>
              <span className="text-slate-900 font-black text-xs uppercase tracking-[0.2em] italic">Local Connect</span>
            </div>
            <nav aria-label="Footer Navigation" className="flex flex-wrap gap-x-6 gap-y-2">
              <button onClick={() => router.push(aboutHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">About</button>
              <button onClick={() => router.push(discoverHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Discover</button>
              <button onClick={() => router.push(communityHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Community</button>
              <button onClick={() => router.push(vendorHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Become a Vendor</button>
              <button onClick={() => router.push(termsHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Terms</button>
              <button onClick={() => router.push(privacyHref)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Privacy</button>
            </nav>
          </div>
          <p className="text-slate-400 text-[10px] font-medium mt-6 text-center sm:text-left">© 2026 Local Connect Portal. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
