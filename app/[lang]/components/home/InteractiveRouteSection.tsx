"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LocalImage from "../atoms/Image";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

// Real multi-day routes across real Himachal places. Kept to route-level
// facts (region, distance, duration, max altitude) only — an earlier version
// of this section invented specific named "local partners" (fake people,
// stock avatar photos) presented as verified hosts for each day, which is
// exactly the fabricated-trust-signal pattern CORE.md §4 forbids. The real,
// live itinerary experience (actual stays/transit/guides) lives in the
// builder; this section's job is just to hand off into it.
interface RoutePreset {
  id: string;
  title: string;
  region: string;
  durationDays: number;
  totalDistance: string;
  maxAltitude: string;
  image: string;
  builderUrlParams: string;
}

const ROUTE_PRESETS: RoutePreset[] = [
  {
    id: "parvati-manali",
    title: "Parvati & Manali Valley",
    region: "Kullu & Parvati",
    durationDays: 3,
    totalDistance: "285 km",
    maxAltitude: "2,050 m",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200",
    builderUrlParams: "origin=Chandigarh&destinations=Kasol,Kullu,Manali",
  },
  {
    id: "kangra-bir",
    title: "Dharamshala & Bir Trail",
    region: "Kangra Valley",
    durationDays: 3,
    totalDistance: "220 km",
    maxAltitude: "2,400 m",
    image: "https://images.unsplash.com/photo-1653853572809-ea537274c7f5?q=80&w=1200",
    builderUrlParams: "origin=Pathankot&destinations=Dharamshala,Bir,Billing",
  },
  {
    id: "spiti-circuit",
    title: "Spiti Valley Explorer",
    region: "Lahaul & Spiti",
    durationDays: 3,
    totalDistance: "410 km",
    maxAltitude: "4,590 m",
    image: "https://images.unsplash.com/photo-1518623001395-125242310d0c?q=80&w=1200",
    builderUrlParams: "origin=Shimla&destinations=Sangla,Tabo,Kaza,Chandratal",
  },
];

export default function InteractiveRouteSection({ lang }: { lang: string }) {
  const router = useRouter();
  const { dict } = useLocalizationContext();
  const t = dict?.page?.home?.routes || {};

  const openInBuilder = (preset: RoutePreset) => {
    router.push(`/${lang}/builder?${preset.builderUrlParams}`);
  };

  return (
    <section className="py-14 sm:py-20 bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-8 sm:mb-10">
          <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-2">
            {t.eyebrow || "Curated Routes"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {t.title || "Ready-made journeys."}
          </h2>
          <p className="mt-2 text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
            {t.subtitle || "Real multi-day routes across Himachal — open one in the builder and make it yours."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          {ROUTE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => openInBuilder(preset)}
              className="group text-left bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:border-emerald-500/40 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <LocalImage
                  src={preset.image}
                  alt={preset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                  {preset.durationDays} {t.days_unit || "days"}
                </span>
              </div>

              <div className="p-5 space-y-1">
                <h3 className="text-slate-900 font-black text-base leading-snug">{preset.title}</h3>
                <p className="text-slate-400 text-xs font-medium">{preset.region}</p>
                <p className="text-slate-400 text-xs font-medium">
                  {preset.totalDistance} · {preset.maxAltitude}
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-emerald-700 text-xs font-black uppercase tracking-wider">
                  {t.cta || "Plan this route"}
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
