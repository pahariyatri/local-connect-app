"use client";

import React, { useState } from "react";
import { Icon } from "../atoms/Icon";
import Image from "next/image";

// Real supply only — circuits with actual live inventory (verified against
// production, 2026-08-11). Kalga/Pulga/Tosh/Kheerganga have zero services
// today, so they're left out of "popular" rather than promising a search
// that dead-ends.
const POPULAR_DESTINATIONS = ["Kasol", "Manali", "Shimla", "Tirthan", "Spiti", "Dharamshala"];

const CATEGORIES: { label: string; icon: "home" | "car" | "mountain" | "users" | "utensils" | "flag" }[] = [
  { label: "Stay", icon: "home" },
  { label: "Taxi", icon: "car" },
  { label: "Camp", icon: "flag" },
  { label: "Trek", icon: "mountain" },
  { label: "Guide", icon: "users" },
  { label: "Food", icon: "utensils" },
];

export default function HeroSection({ onSearch, onPlan }: { onSearch: (query?: string) => void; onPlan: () => void }) {
  const [query, setQuery] = useState("");

  const submitSearch = (value?: string) => {
    onSearch(value ?? query);
  };

  return (
    <section className="relative">
      <div className="relative h-[640px] sm:h-[680px] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1600"
          alt="Manali, Himachal Pradesh"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Flat dark scrim for text legibility — no color glow, no gradient overload. */}
        <div className="absolute inset-0 bg-primary/55" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-primary-foreground">
          <h1 className="max-w-2xl text-[2.25rem] sm:text-5xl md:text-[3.5rem] font-bold leading-[1.08] tracking-tight text-balance">
            Find trusted locals for your Himachal trip.
          </h1>
          <p className="mt-4 max-w-md text-base sm:text-lg text-primary-foreground/85">
            Stays, taxis, camps, guides and experiences from local partners.
          </p>

          {/* Real destination search — not a CTA button standing in for one. */}
          <form
            onSubmit={(e) => { e.preventDefault(); submitSearch(); }}
            className="mt-8 w-full max-w-md"
          >
            <div className="flex items-center gap-2 rounded-control bg-white p-1.5 shadow-card">
              <Icon name="search" className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Where are you going?"
                aria-label="Search destination"
                className="h-11 w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular destinations — real supply only. */}
          {/* Each link carries a 44px-tall touch area via padding — the label
              itself stays text-xs, so the row reads the same but stops being
              a 16px-tall mis-tap trap on mobile (PY-016). */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-1 text-xs text-primary-foreground/70">
            <span className="px-1 text-primary-foreground/50">Popular:</span>
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <React.Fragment key={dest}>
                {i > 0 && <span className="text-primary-foreground/30">·</span>}
                <button
                  type="button"
                  onClick={() => submitSearch(dest)}
                  // 46px, not 44: the page wrapper's `.page-fade-in` entrance
                  // runs a scale(0.98) transform, so a 44px box measures 43.1px
                  // on screen. 46 clears the 44px guidance either way.
                  className="inline-flex min-h-[46px] min-w-[46px] items-center justify-center px-3 hover:text-primary-foreground hover:underline underline-offset-2 transition-colors"
                >
                  {dest}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Category shortcuts */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => onSearch(cat.label)}
                className="flex items-center gap-1.5 rounded-control border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-medium text-primary-foreground backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Icon name={cat.icon} className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Secondary action — text-weight, not a second equal button. */}
          <button
            type="button"
            onClick={onPlan}
            className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground transition-colors"
          >
            Plan the whole trip instead
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </button>

          <p className="mt-6 text-[11px] uppercase tracking-wide text-primary-foreground/55">
            Verified local partners · Real services · Booking support
          </p>
        </div>
      </div>
    </section>
  );
}
