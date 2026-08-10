"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "../components/atoms/Icon";
import Button from "../components/atoms/Button";
import PublicFooter from "../components/organisms/PublicFooter";

// ─── Destination data ──────────────────────────────────────────────────────────

const DESTINATIONS = [
  {
    slug: "manali",
    label: "Manali",
    region: "Himachal Pradesh",
    elevation: "2,050 m",
    season: "Oct – Jun",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
    accent: "#10B981",
    tags: ["Trekking", "Camping", "Snow"],
    description: "Gateway to Rohtang Pass and the Kullu Valley.",
  },
  {
    slug: "spiti",
    label: "Spiti Valley",
    region: "Himachal Pradesh",
    elevation: "3,800 m",
    season: "Jun – Sep",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
    accent: "#6366F1",
    tags: ["Remote", "Monasteries", "Stargazing"],
    description: "A cold desert mountain valley unlike anywhere else.",
  },
  {
    slug: "kasol",
    label: "Kasol",
    region: "Parvati Valley",
    elevation: "1,640 m",
    season: "Year round",
    image: "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=800",
    accent: "#F59E0B",
    tags: ["Trekking", "Café Culture", "River"],
    description: "The bohemian hub of the Parvati Valley.",
  },
  {
    slug: "dharamshala",
    label: "Dharamshala",
    region: "Himachal Pradesh",
    elevation: "1,457 m",
    season: "Year round",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800",
    accent: "#EF4444",
    tags: ["Buddhism", "Cricket", "Tea Gardens"],
    description: "Home of the Dalai Lama and Tibetan culture.",
  },
  {
    slug: "chopta",
    label: "Chopta",
    region: "Uttarakhand",
    elevation: "2,680 m",
    season: "May – Nov",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
    accent: "#059669",
    tags: ["Tungnath Temple", "Trek", "Meadows"],
    description: "The mini-Switzerland of Uttarakhand.",
  },
  {
    slug: "tirthan",
    label: "Tirthan Valley",
    region: "Himachal Pradesh",
    elevation: "1,600 m",
    season: "Mar – Nov",
    image: "https://images.unsplash.com/photo-1518623001395-125242310d0c?q=80&w=800",
    accent: "#0EA5E9",
    tags: ["Fishing", "Quiet Retreat", "GHN Park"],
    description: "Off-grid valley on the edge of a national park.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: "compass" as const },
  { id: "trek", label: "Treks", icon: "mountain" as const },
  { id: "stay", label: "Homestays", icon: "home" as const },
  { id: "transport", label: "Transport", icon: "car" as const },
  { id: "food", label: "Food Trails", icon: "utensils" as const },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const filtered = DESTINATIONS.filter((d) => {
    const q = searchQuery.toLowerCase();
    return !q || d.label.toLowerCase().includes(q) || d.region.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO STRIP ──────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 text-white px-6 pt-12 pb-16">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">
            Circuit Discovery
          </p>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[0.9] mb-6">
            EXPLORE<br />
            <span className="italic text-slate-500">the hills.</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-10">
            Handpicked Pahari circuits with verified local services at every stop.
            No guesswork. No middlemen.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md">
            <input
              id="explore-search"
              type="text"
              placeholder="Search destination, region, or activity…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-4 rounded-2xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:bg-white/15 focus:border-emerald-500/50 transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" className="w-4 h-4" />
            </span>
          </div>
        </div>
      </section>

      {/* ── CATEGORY PILLS ──────────────────────────────────────────────────── */}
      <section className="sticky top-[var(--header-height,57px)] z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              id={`explore-cat-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${
                activeCategory === cat.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              <Icon name={cat.icon} className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── DESTINATION GRID ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest, i) => (
            <article
              key={dest.slug}
              id={`explore-card-${dest.slug}`}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setHoveredSlug(dest.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              onClick={() => router.push(`/${lang}/discover?location=${dest.label}`)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/${lang}/discover?location=${dest.label}`)}
              className="group relative rounded-3xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.label}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    hoveredSlug === dest.slug ? "scale-110" : "scale-100"
                  }`}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/95 text-[9px] font-black uppercase tracking-widest text-slate-900">
                    {dest.region}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1">
                    <Icon name="map-pin" className="w-2.5 h-2.5" />
                    {dest.elevation}
                  </span>
                </div>

                {/* Bottom text */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white leading-none">
                    {dest.label}
                  </h2>
                  <p className="text-white/60 text-[11px] mt-1">{dest.description}</p>
                </div>
              </div>

              {/* Card footer */}
              <div className="bg-white border border-t-0 border-slate-100 px-5 py-4 flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  {dest.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-50 text-[9px] font-black text-slate-500 uppercase rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-emerald-500 flex-shrink-0 ml-3">
                  <span className="text-[10px] font-black uppercase tracking-wider">Explore</span>
                  <Icon name="arrow-right" className="w-3.5 h-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm mb-2">No destinations match &ldquo;{searchQuery}&rdquo;</p>
            <p className="text-slate-300 text-xs mb-6">Try Manali, Kasol, Spiti, or a region name.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-emerald-600 text-xs font-black uppercase tracking-wider hover:text-emerald-700 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}

        {/* CTA bottom strip */}
        <div className="mt-16 rounded-3xl bg-emerald-950 text-white p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-2">
              Can&apos;t decide?
            </p>
            <h3 className="text-2xl font-black tracking-tight">Let us plan it for you.</h3>
            <p className="text-emerald-300/60 text-sm mt-1">Tell us your dates and we&apos;ll match local vendors.</p>
          </div>
          <Button
            id="explore-plan-cta"
            onClick={() => router.push(`/${lang}/builder`)}
            variant="primary"
            iconRight={<Icon name="arrow-right" className="w-4 h-4" />}
            className="bg-white text-emerald-950 hover:bg-emerald-50 rounded-full px-8 py-3 text-xs font-black uppercase tracking-widest flex-shrink-0"
          >
            Plan My Trip
          </Button>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
