"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n-config";
import Button from "./components/atoms/Button";
import LocalImage from "./components/atoms/Image";
import Typography from "./components/atoms/Typography";
import Card from "./components/molecules/Card";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "./components/atoms/Loading";
import { getVendors } from "@/services/vendorService";
import { getLocations } from "@/services/catalogService";
import { Icon, IconName } from "./components/atoms/Icon";
import PublicFooter from "./components/organisms/PublicFooter";
import HeroSection from "./components/organisms/HeroSection";
import InteractiveRouteSection from "./components/organisms/InteractiveRouteSection";
import { trackAppLandingView, trackPortalCtaClick } from "@/lib/analytics";

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

// Curated destination photography — the Location entity has no image field
// (confirmed: name/slug/type/lat/lng only), so real destination *names* come
// from the API while the photo is decorative, same pattern as CATEGORY_IMAGES
// above. Falls back to a generic mountain photo for any real destination not
// in this small curated set.
const DESTINATION_IMAGES: Record<string, string> = {
  manali: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
  kasol: "https://images.unsplash.com/photo-1626016909671-13a2f16bb318?q=80&w=800",
  shimla: "https://images.unsplash.com/photo-1626621340754-3f836c0a55c3?q=80&w=800",
  spiti: "https://images.unsplash.com/photo-1518623001395-125242310d0c?q=80&w=800",
  dharamshala: "https://images.unsplash.com/photo-1653853572809-ea537274c7f5?q=80&w=800",
  tirthan: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800",
};
const DEFAULT_DESTINATION_IMAGE = "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=800";

interface DestinationItem {
  name: string;
  slug: string;
  image: string;
}

// Category icon row — keyed to real, already-localized dict.page.home.categories.items
// entries (built but previously unwired). Picking a representative 4 rather
// than all 8 to match a compact icon row.
const CATEGORY_ROW: { key: string; icon: IconName }[] = [
  { key: "homestays", icon: "home" },
  { key: "transport", icon: "car" },
  { key: "guides", icon: "users" },
  { key: "adventures", icon: "compass" },
];

interface LocalProviderItem {
  id: string;
  name: string;
  /** Undefined when the real `types[0]` value doesn't map to a known label — omit the badge, never guess one. */
  category?: string;
  image: string;
  isVerified: boolean;
}

// GET /vendors (VendorService.findAll()) returns id/businessName/types/
// isVerified/trustScore/etc. with NO relations loaded — there is no
// location/address field on this response at all (Address belongs to
// Service, not Vendor). Previously this function filled that gap by
// guessing category and location from businessName keyword matching, with
// a literal branch that renamed any vendor whose name matched "palolem"/
// "beach" (leftover seed data) to a fabricated "Spiti Pine & Mudhouse" —
// a fake identity overlaid on a real, possibly-verified vendor record.
// Fixed: only ever show fields traceable to real data; omit what isn't.
function mapBackendVendor(v: any): LocalProviderItem {
  const typeMap: Record<string, string> = { hotel: "HOMESTAY", restaurant: "LOCAL EATS", transport: "4x4 CAB", adventure: "TREK GUIDE" };
  const rawType = v.types?.[0]?.toLowerCase();
  const category = typeMap[rawType]; // undefined if unset/unrecognized — the card omits the badge rather than guess one

  const cleanName = (v.businessName || "").replace(/\s*\(.*?\)\s*/g, "").trim() || "Local Mountain Partner";

  const categoryImageKey = category === "4x4 CAB" ? "Transport" : category === "TREK GUIDE" ? "Adventure" : "Stay";

  return {
    id: v.id,
    name: cleanName,
    category,
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
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [isDestinationsLoading, setIsDestinationsLoading] = useState(true);

  useEffect(() => {
    trackAppLandingView();
  }, []);

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

  useEffect(() => {
    if (!dict) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await getLocations();
        if (!cancelled && Array.isArray(response)) {
          const realDestinations = response
            .filter((loc: any) => loc.type === "DESTINATION")
            .slice(0, 3)
            .map((loc: any) => ({
              name: loc.name,
              slug: loc.slug,
              image: DESTINATION_IMAGES[loc.slug] || DEFAULT_DESTINATION_IMAGE,
            }));
          setDestinations(realDestinations);
        }
      } catch {
        // Backend unavailable or empty
      } finally {
        if (!cancelled) setIsDestinationsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dict]);

  if (!dict) return <Loading />;

  const builderHref = `/${lang}/builder`;
  const vendorHref = `/${lang}/vendor/onboarding`;
  const exploreHref = `/${lang}/explore`;

  return (
    <main className="bg-white min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-900 overflow-x-hidden">
      {/* ── 1 · HERO ─────────────────────────────────────────────────────── */}
      <HeroSection
        onSearch={(query) => router.push(query ? `${exploreHref}?q=${encodeURIComponent(query)}` : exploreHref)}
        onPlan={() => { trackPortalCtaClick("hero_plan", builderHref); router.push(builderHref); }}
      />

      {/* ── 1b · CATEGORIES ──────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <Typography variant="h3" className="text-sm mb-3">
            {dict.page?.home?.categories?.title || "Browse by Category"}
          </Typography>
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
            {CATEGORY_ROW.map(({ key, icon }) => {
              const label = dict.page?.home?.categories?.items?.[key] || key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => router.push(`${exploreHref}?q=${encodeURIComponent(label)}`)}
                  className="flex flex-col items-center gap-1.5 shrink-0 w-16 group"
                >
                  <span className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                    <Icon name={icon} className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 1c · POPULAR DESTINATIONS ────────────────────────────────────── */}
      {(isDestinationsLoading || destinations.length > 0) && (
        <section className="px-4 sm:px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <Typography variant="h3" className="text-sm">
                {dict.page?.home?.destinations?.title || "Popular Destinations"}
              </Typography>
              <button
                onClick={() => router.push(exploreHref)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                {dict.page?.home?.providers?.view_all || "View All"}
              </button>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
              {isDestinationsLoading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="w-32 sm:w-40 h-24 sm:h-28 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
                  ))
                : destinations.map((d) => (
                    <button
                      key={d.slug}
                      type="button"
                      onClick={() => router.push(`${exploreHref}?location=${encodeURIComponent(d.name)}`)}
                      className="relative w-32 sm:w-40 h-24 sm:h-28 rounded-2xl overflow-hidden shrink-0 group"
                    >
                      <LocalImage
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-3 text-white text-sm font-bold drop-shadow-sm">{d.name}</span>
                    </button>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 2 · INTERACTIVE ROUTE EXPERIENCE (DAY BY DAY) ──────────────── */}
      <InteractiveRouteSection lang={lang} />



      {/* ── 3 · VERIFIED LOCAL HOSTS & OPERATORS ────────────────────────── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
              <div className="space-y-1">
                <Typography variant="eyebrow">
                  {dict.page?.home?.providers?.eyebrow || "Verified Locals"}
                </Typography>
                <Typography variant="h2">
                  {dict.page?.home?.providers?.title || "Trusted Local Partners"}
                </Typography>
                <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl">
                  Connect directly with verified mountain hosts, homestays, and 4x4 transport providers with 0% middleman markup.
                </p>
              </div>
              <button
                onClick={() => { trackPortalCtaClick("view_all_operators", exploreHref); router.push(exploreHref); }}
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
                <Reveal key={p.id} delayMs={(i % 4) * 60} className="min-w-[270px] sm:min-w-0 shrink-0 snap-center">
                  <Card
                    onClick={() => router.push(`/${lang}/vendor/${p.id}`)}
                    imageSrc={p.image}
                    imageAlt={p.name}
                    badgeText={p.category}
                    verified={p.isVerified}
                    title={p.name}
                    className="hover:border-emerald-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <p className="text-emerald-700 text-xs font-semibold">
                      Direct Local Host
                    </p>
                  </Card>
                </Reveal>
              ))
            ) : (
              <div className="col-span-full py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
                <p className="text-sm font-bold text-slate-800">Direct Local Marketplace</p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Explore native guides, 4x4 mountain drivers, and homestays across Himachal Pradesh.</p>
                <Button onClick={() => { trackPortalCtaClick("browse_services_directory", exploreHref); router.push(exploreHref); }} variant="primary" className="mt-4 h-10 px-6 rounded-full text-sm font-semibold mx-auto flex items-center gap-2">
                  <span>Browse services directory</span>
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
                  <Typography variant="eyebrow" className="text-emerald-400">
                    Custom Mountain Circuits
                  </Typography>
                  <Typography variant="h2" className="text-white leading-tight">
                    Build your Himachal route with local stays & transit.
                  </Typography>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
                    Select your starting point, favorite valleys, and connect directly with verified drivers and homestays.
                  </p>
                </div>

                <div className="relative pt-8 mt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-slate-300 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><Icon name="check" className="w-4 h-4 text-emerald-400" /> 0% Markup</span>
                    {/* Corrected 2026-08: was "Escrow Safe" — the platform doesn't hold
                        trip funds in escrow (a Razorpay reservation fee, paid directly
                        to partners for the rest), so the word doesn't apply here. */}
                    <span className="flex items-center gap-1.5"><Icon name="check" className="w-4 h-4 text-emerald-400" /> Reserve, Pay Direct</span>
                  </div>
                  <Button
                    onClick={() => { trackPortalCtaClick("start_planning", builderHref); router.push(builderHref); }}
                    variant="primary"
                    iconRight={<Icon name="arrow-right" className="w-4 h-4" />}
                    className="h-12 px-7 rounded-2xl text-sm font-semibold shrink-0"
                  >
                    Start planning
                  </Button>
                </div>
              </div>

              {/* Card B: Join As Partner (Clean, High Intent) */}
              <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-md">
                <div className="space-y-3">
                  <Typography variant="eyebrow" className="text-slate-400">
                    For Local Hosts
                  </Typography>
                  <Typography variant="h2" className="leading-snug">
                    Offer your homestay, 4x4 cab, or trek.
                  </Typography>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    List directly for travelers across India with zero upfront listing fees and direct payouts.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Button
                    onClick={() => { trackPortalCtaClick("join_as_local_partner", vendorHref); router.push(vendorHref); }}
                    variant="dark"
                    iconRight={<Icon name="arrow-right" className="w-4 h-4" />}
                    className="h-11 px-6 rounded-xl text-sm font-semibold"
                  >
                    Join as local partner
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
