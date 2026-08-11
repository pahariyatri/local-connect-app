"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n-config";
import Button from "./components/atoms/Button";
import LocalImage from "./components/atoms/Image";
import VerifiedBadge from "./components/atoms/VerifiedBadge";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "../loading";
import { getVendors } from "@/services/vendorService";
import { Icon, type IconName } from "./components/atoms/Icon";
import PublicFooter from "./components/organisms/PublicFooter";
import HeroSection from "./components/hero/HeroSection";

type HomeProps = {
  params: Promise<{ lang: Locale }>;
};




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
            <span className="relative">
              <span
                className={`absolute inset-0 rounded-full ${ROUTE_DAY_COLORS[i % ROUTE_DAY_COLORS.length]} blur-lg transition-opacity duration-700 ease-out ${visible ? "opacity-30" : "opacity-0"}`}
                style={{ transitionDelay: visible ? `${i * 180 + 100}ms` : "0ms" }}
                aria-hidden="true"
              />
              <span
                className={`relative w-9 h-9 rounded-full ${ROUTE_DAY_COLORS[i % ROUTE_DAY_COLORS.length]} text-white flex items-center justify-center transition-all duration-500 ease-out shadow-lg ${visible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
                style={{ transitionDelay: visible ? `${i * 180}ms` : "0ms" }}
              >
                <Icon name={d.icon} className="w-4 h-4" />
              </span>
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
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Day {d.day}</span>
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

// Per-day accent colours for the route timeline — cycles through the same
// small palette used for category selection elsewhere in the app (indigo /
// emerald / blue / amber), so a 3-5 day route doesn't read as monotone.
const ROUTE_DAY_COLORS = ["bg-indigo-500", "bg-emerald-500", "bg-blue-500", "bg-amber-500"];

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
        const response = await getVendors();
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
  const providersDict = pageDict?.providers || {};
  const joinDict = pageDict?.join || {};
  const trustDict = pageDict?.trust || {};

  const trustBadges = [trustDict.verified, trustDict.escrow, trustDict.messaging, trustDict.reviews].filter(Boolean);

  const builderHref = `/${lang}/builder`;
  const vendorHref = `/${lang}/vendor/onboarding`;
  const exploreHref = `/${lang}/explore`;
  const aboutHref = `/${lang}/about`;
  const communityHref = `/${lang}/community`;
  const termsHref = `/${lang}/terms-conditions`;
  const privacyHref = `/${lang}/privacy-policy`;

  return (
    <main className="bg-white min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-900 overflow-x-hidden">
      {/* ── 1 · HERO ─────────────────────────────────────────────────────── */}
      <HeroSection onSearch={() => router.push(exploreHref)} onPlan={() => router.push(builderHref)} />

      {/* ── 2 · ROUTE, DAY BY DAY ────────────────────────────────────────── */}
      <section className="px-6 py-24 md:py-32 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between gap-4 mb-12">
              <SectionHeading eyebrow="Your route" title="The journey, day by day." subtitle="Every stop planned in advance, not figured out on arrival." />
              <span className="hidden sm:inline-block flex-shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-300">Example</span>
            </div>
          </Reveal>
          <Reveal delayMs={80}>
            <div className="bg-white rounded-panel border border-slate-100 shadow-float overflow-hidden">
              {/* Route overview strip: origin → destination, with the day/stop
                  count derived from the itinerary itself, not fabricated. */}
              <div className="relative bg-slate-50/80 bg-grid-pattern border-b border-slate-100 px-8 sm:px-10 py-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0"><Icon name="map-pin" className="w-4 h-4" /></span>
                    <span className="text-slate-900 text-xs font-black uppercase tracking-tight">{ROUTE_DAYS[0].from}</span>
                  </div>
                  <RouteLine className="flex-1 h-2 text-emerald-300" delayMs={200} />
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-slate-900 text-xs font-black uppercase tracking-tight">{ROUTE_DAYS[ROUTE_DAYS.length - 1].to}</span>
                    <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0"><Icon name="flag" className="w-4 h-4" /></span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ROUTE_DAYS.length} Days</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ROUTE_DAYS.length - 1} Stops</span>
                </div>
              </div>

              <div className="p-8 sm:p-10">
                <RouteTimeline days={ROUTE_DAYS} />
                <div className="mt-2 pt-8 border-t border-slate-100">
                  <Button onClick={() => router.push(builderHref)} variant="primary" iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group btn-primary w-full sm:w-auto h-control rounded-2xl text-xs px-8">
                    {heroDict?.cta_plan || "Start Planning"}
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 3 · LOCAL VENDORS ────────────────────────────────────────────── */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between gap-4 mb-12">
              <SectionHeading eyebrow={providersDict?.eyebrow || "Verified locals"} title={providersDict?.title || "People, not packages."} />
              <button onClick={() => router.push(exploreHref)} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b-2 border-emerald-500/20 pb-1 hover:text-emerald-700 hover:border-emerald-700 transition-all">
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

      {/* ── 4 · JOIN AS A LOCAL PROVIDER ─────────────────────────────────── */}
      {joinDict?.title && (
        <section className="px-6 py-24 md:py-32 bg-slate-50">
          <Reveal>
            <div className="relative max-w-4xl mx-auto bg-slate-900 rounded-panel p-12 sm:p-16 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
              <div className="relative">
                {joinDict?.badge && <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] block mb-5">{joinDict.badge}</span>}
                <h2 className="text-white text-4xl sm:text-5xl font-black leading-[1.02] tracking-tight [text-wrap:balance]" dangerouslySetInnerHTML={{ __html: joinDict.title }} />
                {joinDict?.subtitle && <p className="text-slate-300 text-base mt-5 max-w-md mx-auto leading-relaxed">{joinDict.subtitle}</p>}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button onClick={() => router.push(vendorHref)} variant="primary" iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group bg-emerald-500 hover:bg-emerald-600 text-white h-control rounded-full px-9 text-xs w-full sm:w-auto shadow-none">
                    {joinDict?.cta_join || "Join free"}
                  </Button>
                  {joinDict?.cta_learn && (
                    <Button onClick={() => router.push(aboutHref)} className="bg-transparent border border-white/25 text-white hover:bg-white/10 shadow-none h-control rounded-full px-9 text-xs w-full sm:w-auto">
                      {joinDict.cta_learn}
                    </Button>
                  )}
                </div>
                {joinDict?.note && (
                  <div className="mt-8 inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"><Icon name="check" className="w-2.5 h-2.5 text-emerald-400" /></span>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{joinDict.note}</span>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ── 5 · TRUST ─────────────────────────────────────────────────────── */}
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

      {/* ── 6 · FINAL CTA ─────────────────────────────────────────────────── */}
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

      <PublicFooter />
    </main>
  );
}
