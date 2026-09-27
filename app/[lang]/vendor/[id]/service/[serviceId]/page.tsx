"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LocalImage from "../../../../components/atoms/Image";
import StarRating from "../../../../components/atoms/StarRating";
import TopNavigation from "../../../../components/organisms/TopNavigation";
import VerifiedBadge from "../../../../components/atoms/VerifiedBadge";
import { Icon } from "../../../../components/atoms/Icon";
import {
  searchDiscoveryServices,
  type DiscoveryService,
} from "@/services/searchService";
import { ApiClientError } from "@/lib/apiClient";
import { sessionTracker } from "@/services/sessionService";
import { addRecentView } from "@/lib/recentlyViewed";

export default function ServiceDetailsPage() {
  const { id: vendorId, serviceId, lang } = useParams<{
    id: string;
    serviceId: string;
    lang: string;
  }>();
  const [service, setService] = useState<DiscoveryService | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadService = async () => {
      setLoading(true);
      setFailed(false);
      setNotFound(false);

      try {
        const result = await searchDiscoveryServices({ vendorId, limit: 50 });
        const match = result.services.find(
          (item) => String(item.id) === serviceId,
        );
        if (cancelled) return;
        if (!match) {
          setNotFound(true);
          return;
        }

        setService(match);
        sessionTracker.track("service_viewed", {
          entityType: "service",
          entityId: String(match.id),
        });
        addRecentView({
          type: "service",
          id: String(match.id),
          title: match.name,
          image: match.thumbnail,
          href: `/${lang}/vendor/${vendorId}/service/${match.id}`,
        });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiClientError && error.statusCode === 404) {
          setNotFound(true);
        } else {
          setFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadService();
    return () => {
      cancelled = true;
    };
  }, [vendorId, serviceId, lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <TopNavigation title="Service details" />
        <main className="mx-auto max-w-3xl px-4 pt-24 sm:px-6">
          <div className="h-56 animate-pulse rounded-2xl bg-slate-100 sm:h-80" />
          <div className="mt-6 h-7 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        </main>
      </div>
    );
  }

  if (failed || notFound || !service) {
    return (
      <div className="min-h-screen bg-white">
        <TopNavigation title="Service details" />
        <main className="mx-auto max-w-xl px-4 pt-28 text-center sm:px-6">
          <h1 className="text-xl font-bold text-slate-900">
            {notFound ? "This service is no longer available." : "Could not load this service."}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Return to the partner profile to see current listings.
          </p>
          <Link
            href={`/${lang}/vendor/${vendorId}`}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white"
          >
            Back to partner
          </Link>
        </main>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: service.pricing.currency || "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(service.pricing.unitPrice);
  const priceUnit = service.pricing.priceUnit === "night" ? "per night" : "per service";

  return (
    <div className="min-h-screen bg-white pb-10">
      <TopNavigation title="Service details" />

      <main className="mx-auto max-w-3xl px-4 pb-10 pt-24 sm:px-6 sm:pt-28">
        <Link
          href={`/${lang}/vendor/${vendorId}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <Icon name="arrow-left" className="h-4 w-4" />
          {service.vendor.publicName}
        </Link>

        <div className="mt-3 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 sm:aspect-[2/1]">
          <LocalImage
            src={service.thumbnail}
            alt={service.name}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>

        <section className="pt-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-xs font-semibold text-emerald-800">
              {service.category}
            </span>
            {service.vendor.verified && <VerifiedBadge label="Verified partner" />}
            {typeof service.vendor.rating === "number" && (
              <StarRating rating={service.vendor.rating} size="small" />
            )}
          </div>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
            {service.name}
          </h1>

          {service.location.city && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
              <Icon name="map-pin" className="h-4 w-4 shrink-0" />
              <span className="capitalize">{service.location.city}</span>
              {service.location.state && <span>· {service.location.state}</span>}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-y border-slate-200 py-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Price</p>
              <p className="mt-0.5 text-xl font-bold text-slate-950">
                {formattedPrice}
                <span className="ml-1.5 text-xs font-medium text-slate-500">
                  {priceUnit}
                </span>
              </p>
            </div>
            {service.capacity > 0 && (
              <p className="text-sm text-slate-600">
                Up to {service.capacity} guests
              </p>
            )}
          </div>

          {service.description && (
            <section className="pt-5">
              <h2 className="text-sm font-semibold text-slate-900">About this service</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {service.shortDescription || service.description}
              </p>
            </section>
          )}

          <Link
            id="service-details-book-cta"
            href={`/${lang}/vendor/${vendorId}/book/${service.id}`}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 sm:w-auto sm:min-w-56"
          >
            Choose dates
          </Link>
        </section>
      </main>
    </div>
  );
}