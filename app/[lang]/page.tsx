"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n-config";
import LocalImage from "./components/atoms/Image";
import Typography from "./components/atoms/Typography";
import { Icon } from "./components/atoms/Icon";
import Reveal from "./components/atoms/Reveal";
import CountUp from "./components/atoms/CountUp";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Loading from "../loading";
import { getVendors } from "@/services/vendorService";
import { getLocations } from "@/services/catalogService";
import PublicFooter from "./components/organisms/PublicFooter";
import HeroSection from "./components/organisms/HeroSection";
import InteractiveRouteSection from "./components/organisms/InteractiveRouteSection";

type HomeProps = {
  params: Promise<{ lang: Locale }>;
};

// ─── Vendor mapping ──────────────────────────────────────────────────────────

const CATEGORY_IMAGES: Record<string, string> = {
  Stay: "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=900",
  Adventure: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=900",
  Transport: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=900",
  Food: "https://images.unsplash.com/photo-1574116504481-e06341e984e1?q=80&w=900",
};

// Curated destination photography — the Location entity has no image field
// (name/slug/type/lat/lng only, confirmed), so real destination *names*
// come from the API while the photo is decorative, same pattern as
// CATEGORY_IMAGES above. Deliberately excludes a "kasol" entry: that photo
// ID was confirmed broken (404s) in an earlier live check this session —
// unlisted slugs fall through to the verified-working default instead of
// risking a second broken image.
const DESTINATION_IMAGES: Record<string, string> = {
  manali: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=70&w=900",
  shimla: "https://images.unsplash.com/photo-1626621340754-3f836c0a55c3?q=70&w=900",
  spiti: "https://images.unsplash.com/photo-1518623001395-125242310d0c?q=70&w=900",
  dharamshala: "https://images.unsplash.com/photo-1653853572809-ea537274c7f5?q=70&w=900",
};
const DEFAULT_DESTINATION_IMAGE = "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=70&w=900";

interface DestinationItem {
  name: string;
  slug: string;
  image: string;
}

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
  const [verifiedCount, setVerifiedCount] = useState<number | null>(null);
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [isDestinationsLoading, setIsDestinationsLoading] = useState(true);

  useEffect(() => {
    if (!dict) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await getVendors();
        // A large-card showcase reads best curated to a few — 3, not the
        // whole directory. Explore is where someone browses all of them.
        if (!cancelled && Array.isArray(response) && response.length > 0) {
          setProvidersList(response.slice(0, 3).map(mapBackendVendor));
          // Real count from the same response, not a separate/guessed number —
          // GET /vendors returns the full unpaginated list, so this is the
          // actual number of verified vendor accounts right now, not a
          // fabricated "growing community" stat.
          setVerifiedCount(response.filter((v: any) => v.isVerified).length);
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
      {/* ── 1 · HERO — gradient ground, short headline, one line, one search,
             one secondary "plan a whole trip" path into the Builder ──────── */}
      <HeroSection
        onSearch={(query) => router.push(query ? `${exploreHref}?q=${encodeURIComponent(query)}` : exploreHref)}
        onPlan={() => router.push(builderHref)}
      />

      {/* ── 2 · DISCOVER — a few real places, large portrait photo cards,
             minimal text (name only). Real Location data (GET /locations,
             filtered to type=DESTINATION) — replaces the removed "How It
             Works" product explainer with an actual discovery moment
             instead. Sized up (4:5 portrait, not a small square) for real
             visual weight right after the Hero. ───────────────────────── */}
      {(isDestinationsLoading || destinations.length > 0) && (
        <section className="py-14 sm:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
                <Typography variant="eyebrow">Discover</Typography>
                <Typography variant="h2" className="mt-1">Real places worth the drive.</Typography>
              </div>
            </Reveal>

            <div className="flex sm:grid sm:grid-cols-3 gap-5 sm:gap-6 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
              {isDestinationsLoading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="aspect-[4/5] w-[280px] sm:w-auto shrink-0 rounded-3xl bg-slate-100 animate-pulse" />
                  ))
                : destinations.map((d, i) => (
                    <Reveal key={d.slug} delayMs={i * 80} className="w-[280px] sm:w-auto shrink-0 snap-center">
                      <button
                        type="button"
                        onClick={() => router.push(`${exploreHref}?location=${encodeURIComponent(d.name)}`)}
                        aria-label={d.name}
                        className="group relative w-full aspect-[4/5] rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.3)] transition-all duration-300"
                      >
                        <LocalImage src={d.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                        <h3 className="absolute bottom-6 left-6 right-6 text-white font-black text-2xl sm:text-3xl drop-shadow-sm">{d.name}</h3>
                      </button>
                    </Reveal>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 3 · FULL-BLEED MOMENT — one large cinematic photo as a rhythm
             break between the card grids, the classic premium-editorial
             technique (Airbnb/travel-editorial pattern: pause on one big
             image rather than another row of cards). Real, already-verified
             Unsplash photo used elsewhere at small scale — reused larger
             here, not a new/unvetted asset. Minimal text: a place name and
             nothing else. ─────────────────────────────────────────────── */}
      <section className="relative h-[55vh] sm:h-[65vh] overflow-hidden">
        <LocalImage
          src="https://images.unsplash.com/photo-1518623001395-125242310d0c?q=65&w=1600&auto=format&fit=crop"
          alt="A quiet highway winding through the golden high-altitude desert of Spiti Valley, Himachal Pradesh"
          width={1600}
          height={1000}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <Reveal className="absolute bottom-8 sm:bottom-12 left-0 right-0 text-center">
          <Typography variant="h2" className="text-white text-2xl sm:text-4xl drop-shadow-sm">Spiti Valley.</Typography>
        </Reveal>
      </section>

      {/* ── 4 · LOCAL CONNECTION — a quiet trust signal, not a marketplace
             grid: a few real verified hosts, small format, one line in and
             out. Real vendor data (GET /vendors); an honest empty state
             when there is none, never a placeholder listing. ──────────── */}
      <section className="py-14 sm:py-20 bg-gradient-to-b from-white via-white to-emerald-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col items-center text-center gap-2 mb-8 sm:mb-10">
              <Typography variant="eyebrow">Local Connection</Typography>
              <Typography variant="h2" className="text-xl sm:text-2xl">A few of the real people behind it.</Typography>
              {/* Real, present-tense count from the same fetch above — no
                  "growing community" framing, since that implies a claim
                  (trend over time) this single snapshot can't back up. */}
              {!!verifiedCount && (
                <p className="text-slate-500 text-sm font-semibold">
                  <CountUp target={verifiedCount} className="text-emerald-600 font-black tabular-nums" /> verified locals on the ground right now.
                </p>
              )}
            </div>
          </Reveal>

          {isProvidersLoading ? (
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : providersList.length > 0 ? (
            <>
              {/* Deliberately small/quiet — round portraits, not a
                  marketplace grid. A trust signal, not the pitch. */}
              <div className="flex items-start justify-center gap-6 sm:gap-10">
                {providersList.map((p, i) => (
                  <Reveal key={p.id} delayMs={i * 80}>
                    <button
                      type="button"
                      onClick={() => router.push(`/${lang}/vendor/${p.id}`)}
                      aria-label={[p.name, p.category, p.isVerified ? "Verified" : null].filter(Boolean).join(", ")}
                      className="group flex flex-col items-center gap-2 w-20 sm:w-28"
                    >
                      <span className="relative block w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-2 ring-white shadow-md group-hover:shadow-lg transition-shadow">
                        <LocalImage src={p.image} alt="" rounded className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {p.isVerified && (
                          <span className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white">
                            <Icon name="check" className="w-3 h-3" />
                          </span>
                        )}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 text-center leading-tight line-clamp-2">{p.name}</span>
                    </button>
                  </Reveal>
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => router.push(exploreHref)}
                  className="group/link text-xs font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
                >
                  <span className="relative pb-0.5">
                    Meet more local hosts
                    <span className="absolute left-0 -bottom-px h-px w-full bg-current origin-left scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300" />
                  </span>
                  <Icon name="arrow-right" className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
                </button>
              </div>
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm font-bold text-slate-800">Direct Local Marketplace</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Explore native guides, 4x4 mountain drivers, and homestays across Himachal Pradesh.</p>
              <button
                onClick={() => router.push(exploreHref)}
                className="mt-5 h-10 px-6 rounded-full bg-slate-900 hover:bg-emerald-600 text-white text-sm font-semibold mx-auto flex items-center gap-2 transition-colors"
              >
                <span>Browse services directory</span>
                <Icon name="arrow-right" className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 5 · CURATED JOURNEYS — visual storytelling. Real editorial routes
             (no Book/Chapter/Story API exists in this codebase, confirmed;
             this is the one real, honest content source for that role) ── */}
      <InteractiveRouteSection lang={lang} />

      {/* ── 6 · BRAND STATEMENT — one real claim, already used verbatim
             elsewhere on this site (Hero subtitle, Verified Hosts copy):
             verified locals, direct payment, zero agency markup. No new
             claims invented here. ──────────────────────────────────────── */}
      <section className="relative py-20 sm:py-32 overflow-hidden bg-slate-950">
        {/* Same multi-tone gradient system as the Hero — indigo→slate→
            emerald, no flat solid fill, for visual consistency across the page. */}
        <div className="absolute inset-0 gradient-mountain-dusk" />
        <div className="absolute -top-16 left-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] animate-drift-slow" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <Typography variant="h2" className="text-white text-3xl sm:text-5xl leading-tight mb-10">
              Verified locals. Direct booking.<br className="hidden sm:block" /> Zero agency markup.
            </Typography>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-bold">
              <button
                onClick={() => router.push(builderHref)}
                className="group/link w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <span>Plan a Trip</span>
                <Icon name="arrow-right" className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
              </button>
              <button
                onClick={() => router.push(vendorHref)}
                className="group/link w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/30 hover:border-emerald-400 hover:bg-emerald-500/10 text-white transition-all active:scale-[0.98]"
              >
                <span>Become a Local Partner</span>
                <Icon name="arrow-right" className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
