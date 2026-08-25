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
import HeroSection from "./components/organisms/HeroSection";
import InteractiveRouteSection from "./components/organisms/InteractiveRouteSection";

type HomeProps = {
  params: Promise<{ lang: Locale }>;
};

// ─── Scroll-reveal animation wrapper ─────────────────────────────────────────

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
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

// ─── Vendor mapping ──────────────────────────────────────────────────────────

const CATEGORY_IMAGES: Record<string, string> = {
  Stay: "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=600",
  Adventure: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600",
  Transport: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600",
  Food: "https://images.unsplash.com/photo-1574116504481-e06341e984e1?q=80&w=600",
};

interface LocalProviderItem {
  id: string;
  name: string;
  category: string;
  location: string;
  image: string;
  isVerified: boolean;
}

function mapBackendVendor(v: any): LocalProviderItem {
  const typeMap: Record<string, string> = { hotel: "HOMESTAY", restaurant: "LOCAL EATS", transport: "4x4 CAB", adventure: "TREK GUIDE" };
  const rawType = v.types?.[0]?.toLowerCase();
  let category = typeMap[rawType];
  
  // Smart category fallback based on vendor business name keywords
  const nameLower = (v.businessName || "").toLowerCase();
  if (!category) {
    if (nameLower.includes("cab") || nameLower.includes("suv") || nameLower.includes("taxi") || nameLower.includes("transport") || nameLower.includes("drive")) {
      category = "4x4 CAB";
    } else if (nameLower.includes("trek") || nameLower.includes("adventure") || nameLower.includes("expedition") || nameLower.includes("guide")) {
      category = "TREK GUIDE";
    } else {
      category = "HOMESTAY";
    }
  }

  // Smart location resolution for regional mountain authenticity
  let location = "Himachal Pradesh";
  if (nameLower.includes("kasol") || nameLower.includes("tosh") || nameLower.includes("manikaran")) location = "Kasol, Parvati Valley";
  else if (nameLower.includes("manali") || nameLower.includes("solang")) location = "Old Manali, Himachal";
  else if (nameLower.includes("spiti") || nameLower.includes("kaza") || nameLower.includes("tabo")) location = "Kaza, Spiti Valley";
  else if (nameLower.includes("jibhi") || nameLower.includes("tirthan")) location = "Jibhi, Tirthan Valley";
  else if (nameLower.includes("bir") || nameLower.includes("billing")) location = "Bir Billing, Kangra";

  // Clean up any non-Himachal mock titles
  let cleanName = (v.businessName || "").replace(/\s*\(.*?\)\s*/g, "").trim() || "Local Mountain Partner";
  if (cleanName.toLowerCase().includes("palolem") || cleanName.toLowerCase().includes("beach")) {
    cleanName = "Spiti Pine & Mudhouse";
  }

  const categoryImageKey = category === "4x4 CAB" ? "Transport" : category === "TREK GUIDE" ? "Adventure" : "Stay";

  return {
    id: v.id,
    name: cleanName,
    category,
    location,
    image: v.images?.[0] || CATEGORY_IMAGES[categoryImageKey] || CATEGORY_IMAGES.Stay,
    isVerified: !!v.isVerified,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home({ params }: HomeProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const { dict, lang } = useLocalizationContext();
  const router = useRouter();

  const [providersList, setProvidersList] = useState<LocalProviderItem[]>([]);
  const [isProvidersLoading, setIsProvidersLoading] = useState(true);

  useEffect(() => {
    if (!dict) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await getVendors();
        if (!cancelled && Array.isArray(response) && response.length > 0) {
          setProvidersList(response.slice(0, 4).map(mapBackendVendor));
        }
      } catch {
        // Backend unavailable or empty
      } finally {
        if (!cancelled) setIsProvidersLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dict]);

  if (!dict) return <Loading />;

  const builderHref = `/${lang}/builder`;
  const vendorHref = `/${lang}/vendor/onboarding`;
  const exploreHref = `/${lang}/explore`;

  return (
    <main className="bg-white min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-900 overflow-x-hidden pb-28 sm:pb-12">
      {/* ── 1 · HERO ─────────────────────────────────────────────────────── */}
      <HeroSection
        onSearch={(query) => router.push(query ? `${exploreHref}?q=${encodeURIComponent(query)}` : exploreHref)}
        onPlan={() => router.push(builderHref)}
      />

      {/* ── 1.5 · APP-STYLE CATEGORY TILES (INSTANT 1-TAP EXPLORATION) ──── */}
      <section className="py-8 sm:py-12 bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block">Direct Local Network</span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Explore Mountain Services</h2>
            </div>
            <span className="text-xs font-bold text-slate-400 hidden sm:inline-flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <Icon name="check" className="w-3.5 h-3.5 text-emerald-400" /> 0% Middleman Fees
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => router.push(`${exploreHref}?type=stay`)}
              className="group relative h-36 sm:h-44 rounded-3xl overflow-hidden text-left p-4 flex flex-col justify-end border border-white/15 hover:border-emerald-400/60 transition-all duration-300 shadow-xl active:scale-98"
            >
              <LocalImage
                src="https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=600"
                alt="Homestays & Cabins"
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/15 inline-block">
                  Homestays
                </span>
                <h3 className="font-black text-sm sm:text-base text-white leading-snug">Valley Stays & Cabins</h3>
                <p className="text-[11px] text-slate-300 font-medium truncate">Kasol, Jibhi, Spiti, Tosh</p>
              </div>
            </button>

            <button
              onClick={() => router.push(`${exploreHref}?type=transport`)}
              className="group relative h-36 sm:h-44 rounded-3xl overflow-hidden text-left p-4 flex flex-col justify-end border border-white/15 hover:border-emerald-400/60 transition-all duration-300 shadow-xl active:scale-98"
            >
              <LocalImage
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600"
                alt="4x4 Mountain Cabs"
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-cyan-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/15 inline-block">
                  4x4 Cabs
                </span>
                <h3 className="font-black text-sm sm:text-base text-white leading-snug">Mountain Transit</h3>
                <p className="text-[11px] text-slate-300 font-medium truncate">Spiti, Rohtang, Manikaran</p>
              </div>
            </button>

            <button
              onClick={() => router.push(`${exploreHref}?type=adventure`)}
              className="group relative h-36 sm:h-44 rounded-3xl overflow-hidden text-left p-4 flex flex-col justify-end border border-white/15 hover:border-emerald-400/60 transition-all duration-300 shadow-xl active:scale-98"
            >
              <LocalImage
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600"
                alt="Trekking & Guides"
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/15 inline-block">
                  Treks
                </span>
                <h3 className="font-black text-sm sm:text-base text-white leading-snug">Trek Guides & Expeditions</h3>
                <p className="text-[11px] text-slate-300 font-medium truncate">Kheerganga, Hampta, Tosh</p>
              </div>
            </button>

            <button
              onClick={() => router.push(exploreHref)}
              className="group relative h-36 sm:h-44 rounded-3xl overflow-hidden text-left p-4 flex flex-col justify-end border border-white/15 hover:border-emerald-400/60 transition-all duration-300 shadow-xl active:scale-98"
            >
              <LocalImage
                src="https://images.unsplash.com/photo-1574116504481-e06341e984e1?q=80&w=600"
                alt="Local Food & Cafes"
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/15 inline-block">
                  Directory
                </span>
                <h3 className="font-black text-sm sm:text-base text-white leading-snug">All Himachal Services</h3>
                <p className="text-[11px] text-slate-300 font-medium truncate">Browse 120+ verified hosts</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── 2 · INTERACTIVE ROUTE EXPERIENCE (DAY BY DAY) ──────────────── */}
      <InteractiveRouteSection lang={lang} />



      {/* ── 3 · VERIFIED LOCAL HOSTS & OPERATORS ────────────────────────── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
              <div className="space-y-1">
                <span className="text-emerald-600 text-xs font-black uppercase tracking-widest block">
                  {dict.page?.home?.providers?.eyebrow || "Verified Locals"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {dict.page?.home?.providers?.title || "Trusted Local Partners"}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl">
                  Connect directly with verified mountain hosts, homestays, and 4x4 transport providers with 0% middleman markup.
                </p>
              </div>
              <button
                onClick={() => router.push(exploreHref)}
                className="flex-shrink-0 text-xs font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 pb-1 border-b-2 border-emerald-500/30 hover:border-emerald-600 transition-all self-start sm:self-auto flex items-center gap-1.5"
              >
                <span>{dict.page?.home?.providers?.view_all || "View All"}</span>
                <Icon name="arrow-right" className="w-3.5 h-3.5" />
              </button>
            </div>
          </Reveal>

          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide no-scrollbar hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
            {isProvidersLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-5 space-y-3 animate-pulse">
                  <div className="w-full h-48 rounded-2xl bg-slate-200" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))
            ) : providersList.length > 0 ? (
              providersList.map((p, i) => (
                <Reveal key={p.id} delayMs={(i % 4) * 60}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/${lang}/vendor/${p.id}`)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/${lang}/vendor/${p.id}`); } }}
                    className="group bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer active:scale-[0.99] flex flex-col justify-between min-w-[270px] sm:min-w-0 shrink-0 snap-center"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <LocalImage
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider border border-white/20">
                          {p.category}
                        </span>
                        {p.isVerified && <VerifiedBadge showText={false} />}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[11px] font-medium flex items-center gap-1 text-slate-200">
                          <Icon name="map-pin" className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{p.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-slate-900 font-black text-sm truncate">{p.name}</h3>
                        <p className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                          Direct Local Host
                        </p>
                      </div>
                      <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-600 text-slate-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Icon name="arrow-right" className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))
            ) : (
              <div className="col-span-full py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
                <p className="text-sm font-bold text-slate-800">Direct Local Marketplace</p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Explore native guides, 4x4 mountain drivers, and homestays across Himachal Pradesh.</p>
                <Button onClick={() => router.push(exploreHref)} variant="primary" className="mt-4 h-10 px-6 rounded-full text-xs font-black mx-auto flex items-center gap-2">
                  <span>Browse Services Directory</span>
                  <Icon name="arrow-right" className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4 · VISUAL BENTO HUB (PLAN & HOST) ────────────────────────────── */}
      <section className="px-4 sm:px-6 py-10 sm:py-16 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Card A: Start Planning (Dark Glassmorphism, Visual Hero) */}
              <div className="lg:col-span-7 relative bg-slate-950 text-white rounded-3xl p-8 sm:p-10 overflow-hidden flex flex-col justify-between shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative space-y-4">
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] block">
                    Custom Mountain Circuits
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                    Build your Himachal route with local stays & transit.
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
                    Select your starting point, favorite valleys, and connect directly with verified drivers and homestays.
                  </p>
                </div>

                <div className="relative pt-8 mt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-slate-300 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><Icon name="check" className="w-4 h-4 text-emerald-400" /> 0% Markup</span>
                    <span className="flex items-center gap-1.5"><Icon name="check" className="w-4 h-4 text-emerald-400" /> Escrow Safe</span>
                  </div>
                  <Button
                    onClick={() => router.push(builderHref)}
                    variant="primary"
                    iconRight={<Icon name="arrow-right" className="w-4 h-4" />}
                    className="h-12 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/25 shrink-0"
                  >
                    Start Planning
                  </Button>
                </div>
              </div>

              {/* Card B: Join As Partner (Clean, High Intent) */}
              <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-md">
                <div className="space-y-3">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] block">
                    For Local Hosts
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                    Offer your homestay, 4x4 cab, or trek.
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    List directly for travelers across India with zero upfront listing fees and direct payouts.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Button
                    onClick={() => router.push(vendorHref)}
                    iconRight={<Icon name="arrow-right" className="w-4 h-4" />}
                    className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider"
                  >
                    Join as Local Partner
                  </Button>
                  <span className="text-[11px] font-bold text-slate-400">
                    Free Registration
                  </span>
                </div>
              </div>

            </div>
          </Reveal>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
