"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import LocalImage from "../atoms/Image";
import Typography from "../atoms/Typography";
import Reveal from "../atoms/Reveal";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { Icon } from "../atoms/Icon";

interface RoutePreset {
  id: string;
  title: string;
  region: string;
  image: string;
  builderUrlParams: string;
}

// Beachhead-only (CLAUDE.md §2: Kasol, Tosh, Kalga/Pulga, Barshaini; Malana
// & Manikaran secondary — Manali/Dharamshala/Spiti are later-phase expansion
// and must not be promoted here). Origin varies for real, since Origin now
// supports any India-wide city (Google Places) — Destination stays fixed to
// Kasol, the one destination the Builder's tile picker actually supports
// today; the other beachhead villages named below all resolve to that same
// tile (see DESTINATION_ID_MAP in builder/page.tsx).
const ROUTE_PRESETS: RoutePreset[] = [
  {
    id: "parvati-from-delhi",
    title: "Kasol & Parvati Valley",
    region: "From Delhi",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=65&w=900",
    builderUrlParams: "origin=Delhi&destinations=Kasol",
  },
  {
    id: "parvati-from-chandigarh",
    title: "Kasol, Malana & Tosh",
    region: "From Chandigarh",
    image: "https://images.unsplash.com/photo-1653853572809-ea537274c7f5?q=65&w=900",
    builderUrlParams: "origin=Chandigarh&destinations=Kasol,Malana,Tosh",
  },
  {
    id: "parvati-from-shimla",
    title: "Kalga, Pulga & Barshaini",
    region: "From Shimla",
    image: "https://images.unsplash.com/photo-1518623001395-125242310d0c?q=65&w=900",
    builderUrlParams: "origin=Shimla&destinations=Kasol,Kalga,Pulga,Barshaini",
  },
];

export default function InteractiveRouteSection({ lang }: { lang: string }) {
  const router = useRouter();
  const { dict } = useLocalizationContext();
  const t = dict?.page?.home?.routes || {};
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const openInBuilder = (preset: RoutePreset) => {
    router.push(`/${lang}/builder?${preset.builderUrlParams}`);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-emerald-50/40 via-slate-50 to-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
        <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left justify-between gap-4">
          <div className="space-y-1 flex flex-col items-center sm:items-start">
            <Typography variant="eyebrow">
              {t.eyebrow || "Curated Routes"}
            </Typography>
            <Typography variant="h2">
              {t.title || "Ready-made journeys."}
            </Typography>
          </div>

          {/* Left / Right Scroll Controls */}
          <div className="flex items-center gap-2 self-center sm:self-auto">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:border-slate-400 flex items-center justify-center transition-all active:scale-95"
            >
              <Icon name="arrow-left" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:border-slate-400 flex items-center justify-center transition-all active:scale-95"
            >
              <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
        </Reveal>

        {/* Horizontal Carousel & Grid — large photo, short title + one region
            tag only. Distance/altitude stats intentionally dropped (filler
            metadata, not part of "See → Feel → Explore"); still a single
            tap into the real Trip Builder with real presets. */}
        <div
          ref={scrollContainerRef}
          className="flex sm:grid sm:grid-cols-3 gap-5 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide no-scrollbar hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0"
        >
          {ROUTE_PRESETS.map((preset, i) => (
            <Reveal key={preset.id} delayMs={i * 80} className="min-w-[290px] sm:min-w-0 shrink-0 snap-center">
              <button
                type="button"
                onClick={() => openInBuilder(preset)}
                aria-label={`${preset.title}, ${preset.region}`}
                className="group relative w-full text-left rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-15px_rgba(16,185,129,0.35)] transition-all duration-300 h-80 sm:h-[26rem]"
              >
                {/* alt="" — decorative here: the visible h3 below already
                    names this route, and the whole card is one button whose
                    accessible name comes from aria-label above. A real alt
                    would otherwise get announced twice (image + title). */}
                <LocalImage
                  src={preset.image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />

                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
                  {preset.region}
                </span>

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white flex items-end justify-between gap-3">
                  <h3 className="font-black text-xl sm:text-2xl leading-snug drop-shadow-sm">{preset.title}</h3>
                  <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md group-hover:bg-emerald-600 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 shrink-0">
                    <Icon name="arrow-right" className="w-4 h-4" />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
