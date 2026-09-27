"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Icon, type IconName } from "../components/atoms/Icon";
import LocalImage from "../components/atoms/Image";
import PublicFooter from "../components/organisms/PublicFooter";
import { searchDiscoveryServices, type DiscoveryService } from "@/services/searchService";
import { sessionTracker } from "@/services/sessionService";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import english from "@/dictionaries/en.json";
import styles from "./explore.module.css";

type Category = { id: string; label: string; icon: IconName };
const CATEGORY_ALIASES: Record<string, string> = { accommodation: "stay", stays: "stay", hotel: "stay", transportation: "transport", adventures: "trek", adventure: "trek", food: "restaurant", "food & beverage": "restaurant" };
const normalizeCategory = (value: string) => CATEGORY_ALIASES[value.toLowerCase()] || value.toLowerCase();
const cleanLabel = (value: string) => value.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").trim();
const PAGE_SIZE = 12;

export default function ExplorePage() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const searchParams = useSearchParams();
  const { dict } = useLocalizationContext();
  const copy: typeof english.page.explore.portal = { ...english.page.explore.portal, ...dict?.page?.explore?.portal };
  // The URL is the source of truth from the first render, including Back/Forward.
  const query = searchParams.get("q") || searchParams.get("location") || "";
  const activeCategory = normalizeCategory(searchParams.get("category") || "all");
  const rawPage = Number(searchParams.get("page") || 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [draft, setDraft] = useState(query);
  const [services, setServices] = useState<DiscoveryService[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categories: Category[] = [
    { id: "all", label: copy.all, icon: "compass" },
    { id: "stay", label: copy.stays, icon: "home" },
    { id: "transport", label: copy.rides, icon: "car" },
    { id: "trek", label: copy.guides, icon: "mountain" },
    { id: "restaurant", label: copy.food, icon: "utensils" },
  ];
  const selected = categories.find(c => c.id === activeCategory);
  const categoryLabel = selected?.label || cleanLabel(activeCategory);
  const title = activeCategory === "transport" ? copy.transport_title : activeCategory === "stay" ? copy.stay_title : activeCategory === "trek" ? copy.guide_title : copy.title;
  const subtitle = activeCategory === "transport" ? copy.transport_subtitle : copy.subtitle;
  const hasFilters = Boolean(query) || activeCategory !== "all";

  const updateUrl = useCallback((updates: Record<string, string | null>, replace = false) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => { if (value === null || value === "") params.delete(key); else params.set(key, value); });
    const url = `/${lang}/explore${params.size ? `?${params}` : ""}`;
    if (replace) router.replace(url, { scroll: false }); else router.push(url, { scroll: false });
  }, [searchParams, lang, router]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setDraft(query);
  }, [query]);
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(false);
    // Do not hold up discovery while an analytics session is being initialized.
    searchDiscoveryServices({ q: query.trim() || undefined, category: activeCategory === "all" ? undefined : activeCategory, page, limit: PAGE_SIZE })
      .then(result => {
        if (cancelled) return;
        setServices(result.services);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        sessionTracker.track("search_performed", { metadata: { q: query.trim() || undefined, category: activeCategory === "all" ? undefined : activeCategory, resultsCount: result.total } });
      })
      .catch(() => { if (!cancelled) { setServices([]); setError(true); } })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [query, activeCategory, page, retry]);

  const changeQuery = (value: string) => {
    setDraft(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateUrl({ q: value.trim(), location: null, page: null }, true), 350);
  };
  const reset = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setDraft("");
    router.push(`/${lang}/explore`, { scroll: false });
  };
  const price = (service: DiscoveryService) => {
    const p = service.pricing;
    if (!Number.isFinite(p.unitPrice) || !p.currency) return copy.view_pricing;
    const amount = `${p.currency === "INR" ? "₹" : `${p.currency} `}${p.unitPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    return `${amount}${p.priceUnit ? ` / ${p.priceUnit === "night" ? copy.night : copy.service}` : ""}`;
  };

  return <div className={styles.page}>
    <main className={styles.main}>
      <header className={styles.intro}>
        <div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{title}</h1><p className={styles.subtitle}>{subtitle}</p></div>
        <Link href={`/${lang}/builder`} className={styles.planLink}><Icon name="compass" className="w-4 h-4" />{copy.plan_trip}<Icon name="arrow-right" className="w-4 h-4" /></Link>
      </header>
      <section className={styles.toolbar} aria-label={copy.filters}>
        <form role="search" onSubmit={e => { e.preventDefault(); if (debounceRef.current) clearTimeout(debounceRef.current); updateUrl({ q: draft.trim(), location: null, page: null }); if (draft.trim() === query && page === 1) setRetry(n => n + 1); }} className={styles.searchForm}>
          <div className={styles.searchField}><Icon name="search" className="w-5 h-5" /><label className="sr-only" htmlFor="explore-search">{copy.search_label}</label><input id="explore-search" type="search" placeholder={copy.search_placeholder} value={draft} onChange={e => changeQuery(e.target.value)} />{draft && <button type="button" aria-label={copy.clear_search} onClick={() => { if (debounceRef.current) clearTimeout(debounceRef.current); setDraft(""); updateUrl({ q: null, location: null, page: null }); }}><Icon name="close" className="w-4 h-4" /></button>}</div>
          <button className={styles.searchButton} type="submit"><span>{copy.search}</span><Icon name="arrow-right" className="w-4 h-4" /></button>
        </form>
      </section>
      <section className={styles.results} aria-label={copy.results} aria-busy={isLoading}>
        <div className={styles.resultsHeading}><div><h2>{categoryLabel}</h2><p role="status" aria-live="polite">{isLoading ? copy.searching : error ? copy.try_again_short : `${total} ${total === 1 ? copy.result : copy.results_label}${query ? ` · ${query}` : ""}`}</p></div>{hasFilters && <button type="button" className={styles.reset} onClick={reset}><Icon name="close" className="w-3.5 h-3.5" />{copy.reset}</button>}</div>
        {isLoading ? <div className={styles.grid} data-testid="explore-results-grid" aria-hidden="true">{Array.from({length:6},(_,i)=><div key={i} className={styles.skeleton}><div /><span /><span /></div>)}</div> : error ? <div className={styles.empty} data-testid="explore-error-state"><span className={styles.stateIcon}><Icon name="alert-circle" className="w-6 h-6" /></span><h3>{copy.error_title}</h3><p>{copy.error_subtitle}</p><button type="button" className={styles.primary} onClick={() => setRetry(n=>n+1)}>{copy.retry}<Icon name="arrow-right" className="w-4 h-4" /></button></div> : services.length === 0 ? <div className={styles.empty} data-testid="explore-zero-result"><span className={styles.stateIcon}><Icon name={activeCategory === "transport" ? "car" : "search"} className="w-6 h-6" /></span><h3>{copy.empty_title}</h3><p>{copy.empty_subtitle}</p>{hasFilters && <button type="button" className={styles.primary} onClick={reset}>{copy.clear_filters}<Icon name="arrow-right" className="w-4 h-4" /></button>}</div> : <><div className={styles.grid} data-testid="explore-results-grid">{services.map(service => <Link key={service.id} href={`/${lang}/vendor/${service.vendor.id}`} className={styles.card} data-testid="explore-result-card"><div className={styles.cardImage}>{service.thumbnail ? <LocalImage src={service.thumbnail} alt="" className={styles.photo} /> : <Icon name={activeCategory === "transport" ? "car" : "compass"} className="w-12 h-12" />}<span className={styles.categoryBadge}>{cleanLabel(service.category)}</span>{service.vendor.verified && <span className={styles.verified} aria-label={copy.verified}><Icon name="check-circle" className="w-4 h-4" /></span>}</div><div className={styles.cardBody}><p className={styles.vendorName}>{service.vendor.publicName}</p><h3>{service.name}</h3><p className={styles.location} data-testid="explore-result-location"><Icon name="map-pin" className="w-3.5 h-3.5" />{service.location.city}</p><div className={styles.cardBottom}><strong>{price(service)}</strong><Icon name="arrow-right" className="w-4 h-4" /></div></div></Link>)}</div>{totalPages>1 && <nav aria-label={copy.pagination} className={styles.pagination}><button type="button" disabled={page<=1} onClick={()=>updateUrl({page:String(page-1)})}><Icon name="arrow-left" className="w-4 h-4" />{copy.previous}</button><span>{page} / {totalPages}</span><button type="button" disabled={page>=totalPages} onClick={()=>updateUrl({page:String(page+1)})}>{copy.next}<Icon name="arrow-right" className="w-4 h-4" /></button></nav>}</>}
      </section>
      <aside className={styles.plannerBanner}><div><span className={styles.bannerIcon}><Icon name="compass" className="w-6 h-6" /></span><h2>{copy.banner_title}</h2></div><Link id="explore-plan-cta" href={`/${lang}/builder`}>{copy.plan_trip}<Icon name="arrow-right" className="w-4 h-4" /></Link></aside>
    </main>
    <PublicFooter />
  </div>;
}
