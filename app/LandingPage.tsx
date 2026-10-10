"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LocalImage from "./components/atoms/Image";
import Reveal from "./components/atoms/Reveal";
import Link from "next/link";
import styles from "./landing.module.css";
import english from "@/dictionaries/en.json";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { getVendors } from "@/services/vendorService";
import { getLocations } from "@/services/catalogService";
import PublicFooter from "./components/organisms/PublicFooter";
import HeroSection from "./components/organisms/HeroSection";
import { trackAppLandingView, trackPortalCtaClick } from "@/lib/analytics";
import { sessionTracker } from "@/services/sessionService";
import { addRecentView } from "@/lib/recentlyViewed";

// ─── Vendor mapping ──────────────────────────────────────────────────────────

const DESTINATION_IMAGES: Record<string, string> = {
  manali:
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=70&w=900",
  shimla:
    "https://images.unsplash.com/photo-1626621340754-3f836c0a55c3?q=70&w=900",
  spiti:
    "https://images.unsplash.com/photo-1518623001395-125242310d0c?q=70&w=900",
  dharamshala:
    "https://images.unsplash.com/photo-1653853572809-ea537274c7f5?q=70&w=900",
  kasol:
    "https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?q=70&w=900",
  barshaini:
    "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=70&w=900",
};
const DEFAULT_DESTINATION_IMAGE =
  "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=70&w=900";

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
  const typeMap: Record<string, string> = {
    hotel: "STAY",
    restaurant: "LOCAL EATS",
    transport: "TRANSPORT",
    adventure: "ADVENTURE",
  };
  const rawType = v.types?.[0]?.toLowerCase();
  const category = typeMap[rawType]; // undefined if unset/unrecognized — the card omits the badge rather than guess one

  const cleanName = (v.businessName || "").trim() || "Local Mountain Partner";

  return {
    id: v.id,
    name: cleanName,
    category,
    image: v.images?.[0] || "",
    isVerified: !!v.isVerified,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { dict } = useLocalizationContext();
  const router = useRouter();
  const copy: typeof english.page.home.landing = {
    ...english.page.home.landing,
    ...dict?.page?.home?.landing,
  };

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
        // A large-card showcase reads best curated to a few — 3, not the
        // whole directory. Explore is where someone browses all of them.
        if (!cancelled && Array.isArray(response) && response.length > 0) {
          // GET /vendors returns every vendor regardless of verification
          // status (admin needs that full list) — this section is a public
          // trust showcase, so it must filter to isVerified itself rather
          // than blindly taking whichever 3 come first (AUDIT-056: this
          // previously showed unverified/test vendors whenever they
          // happened to sort earliest).
          const verifiedOnly = response.filter((v: any) => v.isVerified);
          setProvidersList(verifiedOnly.slice(0, 3).map(mapBackendVendor));
        }
      } catch {
        // Backend unavailable or empty
      } finally {
        if (!cancelled) setIsProvidersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dict]);

  useEffect(() => {
    if (!dict) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await getLocations();
        if (!cancelled && Array.isArray(response)) {
          const realDestinations = response
            .filter(
              (loc: any) =>
                loc.type === "DESTINATION" &&
                [
                  "kasol",
                  "tosh",
                  "kalga",
                  "pulga",
                  "barshaini",
                  "malana",
                  "manikaran",
                ].includes(loc.slug?.toLowerCase()),
            )
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
    return () => {
      cancelled = true;
    };
  }, [dict]);

  const builderHref = `/builder`;
  const categories = copy.categories;
  const exploreHref = `/explore`;

  return (
    <div className={styles.landing}>
      <main id="main-content">
        <a className={styles.skip} href="#find-your-stay">
          {copy.skip_to_explore}
        </a>
        <HeroSection
          onSearch={(query) =>
            router.push(
              query
                ? `${exploreHref}?q=${encodeURIComponent(query)}`
                : exploreHref,
            )
          }
          onPlan={() => {
            trackPortalCtaClick("hero_plan", builderHref);
          }}
        />
        <section
          id="find-your-stay"
          className={`${styles.container} ${styles.section}`}
        >
          <Reveal>
            <div className={styles.sectionHead}>
              <div>
                <h2>{copy.section_services}</h2>
                <p className={styles.sectionDescription}>Choose a service, check the details and send a booking request.</p>
              </div>
              <Link className={styles.textLink} href={exploreHref}>
                {copy.all_services}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </Reveal>
          <div className={styles.categoryGrid}>
            {categories.map((c, i) => (
              <Reveal key={c.category} delayMs={i * 90}>
                <Link
                  href={`${exploreHref}?category=${c.category}`}
                  className={`${styles.categoryCard} ${styles[`category${i}`]}`}
                >
                  <span className={styles.cardNumber}>
                    {c.detail}
                  </span>
                  <div className={styles.categoryArt} aria-hidden="true">
                    {i === 0 ? (
                      <svg viewBox="0 0 300 180">
                        <path d="M35 145 105 60l70 85M80 92V55h15v18" />
                        <path d="M58 120v45h95v-45M92 165v-38h25v38M175 164l40-105 40 105M190 130h50M205 96h20M215 165v-20" />
                        <circle cx="243" cy="39" r="16" />
                      </svg>
                    ) : i === 1 ? (
                      <svg viewBox="0 0 300 180">
                        <path d="m15 115 68-71 65 65 65-80 75 85M0 168c85-90 135 70 300-15" />
                        <path d="m105 118 10-28h57l15 28v30h-82zM110 118h72M143 93v24" />
                        <circle cx="122" cy="149" r="10" />
                        <circle cx="174" cy="149" r="10" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 300 180">
                        <path d="m25 164 88-133 84 133M80 82l32 15 23-27M155 97l35-50 87 117" />
                        <path
                          d="m123 164 20-26-25-17 21-18"
                          strokeDasharray="5 7"
                        />
                        <circle cx="242" cy="36" r="15" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.cardBottom}>
                    <h3>{c.label}</h3>
                    <span className={styles.circleArrow} aria-hidden="true">
                      ↗
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.plannerSection}`} id="your-journey">
          <Reveal><div className={styles.plannerPanel}>
            <div><p className={styles.eyebrow}>{copy.hero_visual_label}</p><h2>{copy.section_planner}</h2><p className={styles.plannerSubtitle}>{copy.planner_subtitle}</p><Link className={styles.primary} href={builderHref} onClick={() => trackPortalCtaClick("journey_plan", builderHref)}>{copy.planner_action}<span aria-hidden="true">↗</span></Link></div>
            <ol className={styles.plannerSteps}>{copy.planner_steps.map((step,i)=><li key={step}><span>0{i+1}</span><strong>{step}</strong><span aria-hidden="true">{i===2?'✓':'→'}</span></li>)}</ol>
          </div></Reveal>
        </section>

        <section className={`${styles.container} ${styles.section}`}>
          <Reveal>
            <div className={styles.sectionHead}>
              <div>
                <h2>{copy.section_places}</h2>
              </div>
              <Link className={styles.textLink} href={exploreHref}>{copy.all_places}<span aria-hidden="true">↗</span></Link>
            </div>
          </Reveal>
          {isDestinationsLoading ? (
            <p role="status" className={styles.empty}>
              {copy.finding_places_to_explore}
            </p>
          ) : destinations.length > 0 ? (
            <div className={styles.destinationGrid}>
              {destinations.map((d, i) => (
                <Reveal key={d.slug} delayMs={i * 90}>
                  <Link
                    href={`${exploreHref}?location=${encodeURIComponent(d.name)}`}
                    className={styles.destinationCard}
                    onClick={() => {
                      sessionTracker.track("destination_view", {
                        entityType: "destination",
                        entityId: d.slug,
                        metadata: { destinations: [d.name] },
                      });
                      addRecentView({
                        type: "destination",
                        id: d.slug,
                        title: d.name,
                        image: d.image,
                        href: `${exploreHref}?location=${encodeURIComponent(d.name)}`,
                      });
                    }}
                  >
                    <LocalImage
                      src={d.image}
                      alt=""
                      className={styles.destinationPhoto}
                    />
                    <span className={styles.destinationLabel}>
                      <small>{copy.explore_the_area}</small>
                      <strong>{d.name}</strong>
                    </span>
                    <span
                      className={styles.destinationArrow}
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>{copy.places_unavailable}</p>
              <Link className={styles.textLink} href={exploreHref}>
                {copy.check_the_directory}
              </Link>
            </div>
          )}
        </section>

        <section className={`${styles.container} ${styles.section}`} aria-labelledby="booking-help-title">
          <div className={styles.sectionHead}><h2 id="booking-help-title">Before you book</h2></div>
          <div className={styles.faqs}>
            {copy.faqs.slice(0, 2).map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.localSection}`}>
          <Reveal>
            <div className={styles.localGrid}>
              <div className={styles.localIntro}>
                <h2>{copy.section_locals}</h2>
                <p>{copy.local_short}</p>

              </div>
              <div className={styles.localCopy}>
                <div className={styles.providers}>
                  {isProvidersLoading ? (
                    <p role="status">{copy.finding_local_partners}</p>
                  ) : providersList.length > 0 ? (
                    providersList.map((p) => (
                      <Link
                        href={`/vendor/${p.id}`}
                        key={p.id}
                        className={styles.provider}
                      >
                        {p.image ? (
                          <LocalImage
                            src={p.image}
                            alt=""
                            className={styles.avatar}
                          />
                        ) : (
                          <span className={styles.initial} aria-hidden="true">
                            {p.name.charAt(0)}
                          </span>
                        )}
                        <span>
                          <strong>{p.name}</strong>
                          <small>
                            {copy.verified_partner}
                            {p.category ? ` · ${p.category}` : ""}
                          </small>
                        </span>
                        <span aria-hidden="true">↗</span>
                      </Link>
                    ))
                  ) : (
                    <p>
                      {copy.locals_unavailable}
                    </p>
                  )}
                </div>
                <Link href={exploreHref} className={styles.textLink}>
                  {copy.meet_local_partners}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

      </main>
      <PublicFooter />
    </div>
  );
}
