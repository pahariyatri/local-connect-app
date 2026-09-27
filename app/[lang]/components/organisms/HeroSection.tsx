"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../atoms/Icon";
import Link from "next/link";
import styles from "./HeroSection.module.css";
import english from "@/dictionaries/en.json";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { searchLocations } from "@/services/catalogService";
import type { SelectedLocation } from "@/contexts/TripPlannerContext";

// Matches the debounce used by the Trip Builder's origin typeahead
// (DestinationSelector.tsx) — same backend endpoint, same convention.
const SEARCH_DEBOUNCE_MS = 250;

export default function HeroSection({
  onSearch,
  onPlan,
}: {
  onSearch: (query?: string) => void;
  onPlan?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SelectedLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { dict, lang } = useLocalizationContext();
  const hero = dict?.page?.home?.hero;
  const copy: typeof english.page.home.landing = {
    ...english.page.home.landing,
    ...dict?.page?.home?.landing,
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeqRef = useRef(0);

  useEffect(
    () => () => {
      ++requestSeqRef.current;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );
  const submitSearch = (value?: string) => {
    setOpen(false);
    onSearch((value ?? query).trim());
  };
  const handleChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    setSuggestions([]);
    const seq = ++requestSeqRef.current;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setOpen(false);
      setSearching(false);
      return;
    }
    setOpen(true);
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(value.trim(), 6);
        if (seq === requestSeqRef.current)
          setSuggestions(Array.isArray(results) ? results : []);
      } catch {
        if (seq === requestSeqRef.current) setSuggestions([]);
      } finally {
        if (seq === requestSeqRef.current) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
  };
  const pickSuggestion = (location: SelectedLocation) => {
    setQuery(location.name);
    setSuggestions([]);
    setActiveIndex(-1);
    inputRef.current?.blur();
    submitSearch(location.name);
  };
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroGrid}>
      <div className={styles.content}>
        <p className={styles.eyebrow}><span />{copy.hero_eyebrow}</p>
        <h1 id="hero-title">{copy.hero_title}<br /><span>{copy.hero_accent}</span></h1>
        <p className={styles.subtitle}>{copy.hero_subtitle}</p>
        <div className={styles.searchWrap}>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (activeIndex >= 0 && suggestions[activeIndex])
                pickSuggestion(suggestions[activeIndex]);
              else submitSearch();
            }}
            className={styles.search}
          >
            <Icon name="map-pin" className="w-5 h-5 shrink-0" />
            <div className={styles.field}>
              <label htmlFor="landing-destination">
                {copy.hero_search_label}
              </label>
              <input
                id="landing-destination"
                ref={inputRef}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open && query.trim().length >= 2}
                aria-controls={
                  open && query.trim().length >= 2
                    ? "landing-suggestions"
                    : undefined
                }
                aria-activedescendant={
                  open && activeIndex >= 0
                    ? `landing-suggestion-${activeIndex}`
                    : undefined
                }
                autoComplete="off"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => query.trim().length >= 2 && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                    setActiveIndex(-1);
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setOpen(true);
                    setActiveIndex((i) =>
                      Math.min(i + 1, suggestions.length - 1),
                    );
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(i - 1, -1));
                  }
                }}
                placeholder={
                  hero?.search_placeholder ||
                  "Try Kasol, Tosh or Parvati Valley"
                }
              />
            </div>
            <button type="submit" aria-label="Explore destinations">
              <span>{copy.explore}</span>
              <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          </form>
          {open && query.trim().length >= 2 && (
            <div className={styles.suggestions}>
              <div
                id="landing-suggestions"
                role="listbox"
                aria-label="Destinations"
              >
                {suggestions.map((loc, i) => (
                  <div
                    id={`landing-suggestion-${i}`}
                    role="option"
                    aria-selected={activeIndex === i}
                    key={loc.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(loc)}
                    className={activeIndex === i ? styles.activeOption : ""}
                  >
                    {loc.name}
                    <span aria-hidden="true">↗</span>
                  </div>
                ))}
              </div>
              {searching && !suggestions.length ? (
                <p role="status">{copy.searching}</p>
              ) : (
                !suggestions.length && (
                  <p role="status">
                    {copy.no_matching_locations_press_explore_to_search}
                  </p>
                )
              )}
            </div>
          )}
        </div>
        <div className={styles.belowSearch}>
          {onPlan && <button type="button" onClick={onPlan}>{copy.hero_plan}<Icon name="arrow-right" className="w-4 h-4" /></button>}
          <a href="#find-your-stay">{copy.hero_scroll}<span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <div className={styles.visual}>
        <div className={styles.visualGlow} aria-hidden="true" />
        <div className={styles.visualHeading}><span className={styles.visualDot} />{copy.hero_visual_label}</div>
        <h2>{copy.hero_visual_title}</h2>
        <div className={styles.routeScene}>
          <svg className={styles.contours} viewBox="0 0 440 320" fill="none" aria-hidden="true">
            <path d="M-80 290C-10 110 100 280 160 110S310 10 520-60M-70 315C0 135 125 305 185 135S335 35 545-35M-60 340C10 160 150 330 210 160S360 60 570-10M-50 365C20 185 175 355 235 185S385 85 595 15M-40 390C30 210 200 380 260 210S410 110 620 40" />
          </svg>
          <svg className={styles.routeLine} viewBox="0 0 440 320" fill="none" aria-hidden="true">
            <path className={styles.routeTrack} d="M88 75C330 35 75 240 300 175S385 265 225 285" />
            <path className={styles.routeTrace} pathLength="1" d="M88 75C330 35 75 240 300 175S385 265 225 285" />
            <circle cx="225" cy="285" r="5" fill="#94d1c2" />
          </svg>
          {[{label:copy.hero_visual_stay,icon:'home',category:'stay'}, {label:copy.hero_visual_ride,icon:'car',category:'transport'}, {label:copy.hero_visual_guide,icon:'compass',category:'trek'}].map((item,i) => <Link key={item.category} href={`/${lang}/explore?category=${item.category}`} className={`${styles.sceneCard} ${styles[`sceneCard${i}`]}`}><span className={styles.sceneIcon}><Icon name={item.icon as IconName} className="w-5 h-5" /></span><strong>{item.label}</strong><span className={styles.sceneArrow} aria-hidden="true">↗</span></Link>)}
        </div>
        <div className={styles.visualFooter}><span>01 — 02 — 03</span><span aria-hidden="true">↗</span></div>
      </div>
      </div>
    </section>
  );
}
