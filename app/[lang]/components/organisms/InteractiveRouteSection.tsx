"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import LocalImage from "../atoms/Image";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { Icon } from "../atoms/Icon";

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
    title: "Dharamshala & Bir",
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
    <section className="py-14 sm:py-20 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-emerald-600 text-xs font-black uppercase tracking-widest block">
              {t.eyebrow || "Curated Routes"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {t.title || "Ready-made journeys."}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl">
              {t.subtitle || "Real multi-day routes across Himachal — open one in the builder and make it yours."}
            </p>
          </div>

          {/* Left / Right Scroll Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
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

        {/* Horizontal Carousel & Grid */}
        <div
          ref={scrollContainerRef}
          className="flex sm:grid sm:grid-cols-3 gap-5 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide no-scrollbar hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0"
        >
          {ROUTE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => openInBuilder(preset)}
              className="group text-left bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-1.5 transition-all duration-300 min-w-[290px] sm:min-w-0 shrink-0 snap-center flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 sm:h-60 overflow-hidden">
                  <LocalImage
                    src={preset.image}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
                      {preset.durationDays} {t.days_unit || "days"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-950/70 backdrop-blur-md text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                      {preset.region}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-black text-lg sm:text-xl leading-snug drop-shadow-sm">{preset.title}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl">
                    <span>Distance <strong className="text-slate-900 font-bold ml-1">{preset.totalDistance}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Altitude <strong className="text-slate-900 font-bold ml-1">{preset.maxAltitude}</strong></span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 flex items-center justify-between">
                <span className="text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors">
                  {t.cta || "Plan this route"}
                </span>
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
                  <Icon name="arrow-right" className="w-4 h-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
