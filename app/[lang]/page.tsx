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
import { Icon } from "./components/atoms/Icon";
import PublicFooter from "./components/organisms/PublicFooter";
import HeroSection from "./components/hero/HeroSection";
import InteractiveRouteSection from "./components/home/InteractiveRouteSection";

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
      <HeroSection
        onSearch={(query) => router.push(query ? `${exploreHref}?q=${encodeURIComponent(query)}` : exploreHref)}
        onPlan={() => router.push(builderHref)}
      />

      {/* ── 2 · INTERACTIVE ROUTE EXPERIENCE (DAY BY DAY) ──────────────── */}
      <InteractiveRouteSection lang={lang} />

      {/* ── 3 · LOCAL VENDORS ────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
              <SectionHeading eyebrow={providersDict?.eyebrow || "Verified locals"} title={providersDict?.title || "People, not packages."} />
              <button onClick={() => router.push(exploreHref)} className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b-2 border-emerald-500/20 pb-1 hover:text-emerald-700 hover:border-emerald-700 transition-all">
                {providersDict?.view_all || "View all"}
              </button>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
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
        <section className="px-4 sm:px-6 py-14 sm:py-20 bg-slate-50">
          <Reveal>
            <div className="relative max-w-4xl mx-auto bg-slate-900 rounded-panel p-8 sm:p-14 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
              <div className="relative">
                {joinDict?.badge && <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] block mb-4">{joinDict.badge}</span>}
                <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] tracking-tight [text-wrap:balance]" dangerouslySetInnerHTML={{ __html: joinDict.title }} />
                {joinDict?.subtitle && <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-md mx-auto leading-relaxed">{joinDict.subtitle}</p>}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <Button onClick={() => router.push(vendorHref)} variant="primary" iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-full px-8 text-xs w-full sm:w-auto shadow-none">
                    {joinDict?.cta_join || "Join free"}
                  </Button>
                  {joinDict?.cta_learn && (
                    <Button onClick={() => router.push(aboutHref)} className="bg-transparent border border-white/25 text-white hover:bg-white/10 shadow-none h-12 rounded-full px-8 text-xs w-full sm:w-auto">
                      {joinDict.cta_learn}
                    </Button>
                  )}
                </div>
                {joinDict?.note && (
                  <div className="mt-6 inline-flex items-center gap-2">
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
        <section className="px-4 sm:px-6 py-10 sm:py-14">
          <Reveal>
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {trustBadges.map((b) => (
                <div key={b} className="flex flex-col items-center text-center gap-2 p-3 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <span className="w-10 h-10 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center"><Icon name="check" className="w-4 h-4" /></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 leading-snug">{b}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ── 6 · FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-t from-slate-50 to-white">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-slate-900 text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight [text-wrap:balance]">Ready when you are.</h2>
            <p className="text-slate-500 text-sm sm:text-base mt-4 max-w-md mx-auto leading-relaxed">
              One route, planned end to end, with local support at every stop.
            </p>
            <Button onClick={() => router.push(builderHref)} variant="primary" iconRight={<Icon name="arrow-right" className="w-4 h-4" />} className="group btn-primary mt-8 rounded-full h-12 px-8 text-xs mx-auto shadow-lg shadow-emerald-600/20">
              {heroDict?.cta_plan || "Start Planning"}
            </Button>
          </div>
        </Reveal>
      </section>

      <PublicFooter />
    </main>
  );
}
