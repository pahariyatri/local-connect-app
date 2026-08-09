"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Service } from "./types";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import { getMyVendor } from "@/services/vendorService";
import { getServicesByVendor } from "@/services/catalogService";
import { toApiUiError } from "@/utils/apiErrors";
import Loading from "@/app/loading";

// ─── Icon system — same inline-stroke-SVG convention used across the app ───

type IconName = "plus" | "map-pin" | "users" | "package" | "image-off";

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  "map-pin": <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  package: <><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>,
  "image-off": <><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" /><path d="m13.5 13.5-1.5-1.5" /><path d="M2 2l20 20" /><path d="M21 15V6a2 2 0 0 0-2-2H9" /><path d="M3.59 3.59A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.41-.59" /></>,
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {ICON_PATHS[name]}
    </svg>
  );
}

function basePrice(service: Service): number | null {
  const prices = service.prices || [];
  if (prices.length === 0) return null;
  return Math.min(...prices.map((p: any) => Number(p.price)));
}

function ServiceCardSkeleton() {
  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white overflow-hidden animate-pulse">
      <div className="h-56 bg-slate-100" />
      <div className="p-8 flex justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="h-4 w-16 bg-slate-100 rounded" />
        </div>
        <div className="h-3 w-20 bg-slate-100 rounded self-end" />
      </div>
    </div>
  );
}

export default function ServiceListPage() {
  const router = useRouter();
  const { lang } = useParams();

  const [vendorId, setVendorId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try { return window.localStorage.getItem("vendorId"); } catch { return null; }
  });
  const [resolvingVendor, setResolvingVendor] = useState(() => {
    if (typeof window === "undefined") return true;
    try { return !window.localStorage.getItem("vendorId"); } catch { return true; }
  });

  useEffect(() => {
    if (vendorId) return;
    let cancelled = false;
    getMyVendor()
      .then((vendor) => {
        if (cancelled || !vendor?.id) return;
        setVendorId(vendor.id);
        try { window.localStorage.setItem("vendorId", vendor.id); } catch { /* non-fatal */ }
      })
      .catch(() => { /* no vendor for this user — handled by the empty state below */ })
      .finally(() => { if (!cancelled) setResolvingVendor(false); });
    return () => { cancelled = true; };
  }, [vendorId]);

  const [services, setServices] = useState<Service[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!vendorId) return;
    setState("loading");
    setErrorMessage(null);
    try {
      const result = await getServicesByVendor(vendorId);
      setServices(Array.isArray(result) ? result : []);
      setState("ready");
    } catch (err) {
      setErrorMessage(toApiUiError(err, "We could not load your services.").message);
      setState("error");
    }
  }, [vendorId]);

  useEffect(() => { load(); }, [load]);

  if (resolvingVendor) return <Loading />;

  if (vendorId === null) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <Typography variant="h1" className="text-2xl font-black text-slate-900 mb-2">No vendor profile yet</Typography>
        <p className="text-slate-400 text-sm mb-8">Complete vendor onboarding to start adding services.</p>
        <Link href={`/${lang}/vendor/onboarding`}>
          <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-bold text-sm">Start onboarding</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <header className="pt-8 pb-10 flex justify-between items-start">
        <div>
          <Typography variant="h1" className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Your services
          </Typography>
          <p className="text-slate-400 font-semibold text-xs mt-2">{services.length} listed</p>
        </div>
        <button
          onClick={() => router.push(`/${lang}/vendor/services/new`)}
          aria-label="Add a service"
          className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform hover:bg-black"
        >
          <Icon name="plus" className="w-6 h-6" />
        </button>
      </header>

      {state === "loading" && (
        <div className="space-y-6">
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </div>
      )}

      {state === "error" && (
        <div className="text-center py-16 bg-white rounded-[2.5rem] border border-red-100">
          <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
          <Button onClick={load} variant="outline" className="h-11 px-6 rounded-xl text-xs font-bold">Try again</Button>
        </div>
      )}

      {state === "ready" && services.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
          <Typography variant="h3" className="text-xl font-black text-slate-900 mb-2">No services yet</Typography>
          <p className="text-slate-400 text-sm mb-8">Add your first service so travelers can find and book it.</p>
          <Button onClick={() => router.push(`/${lang}/vendor/services/new`)} className="h-12 px-6 rounded-xl bg-slate-900 text-white font-bold text-sm">
            Add a service
          </Button>
        </div>
      )}

      {state === "ready" && services.length > 0 && (
        <div className="space-y-8 pb-16">
          {services.map((service) => {
            const image = service.additionalData?.images?.[0];
            const primaryAddress = service.addresses?.find((a) => a.isPrimary) || service.addresses?.[0];
            const price = basePrice(service);
            return (
              <div
                key={service.id}
                onClick={() => router.push(`/${lang}/vendor/services/${service.id}/edit`)}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-500 cursor-pointer"
              >
                <div className="relative h-56 w-full overflow-hidden bg-slate-50">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <Icon name="image-off" className="w-8 h-8 mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">No image yet</span>
                    </div>
                  )}
                  <div className="absolute top-5 left-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${
                      service.isAvailable ? "bg-emerald-500 text-white" : "bg-slate-900/80 text-white"
                    }`}>
                      {service.isAvailable ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-slate-900 leading-tight truncate">{service.name}</h3>
                      <div className="flex items-center gap-2 text-slate-400 mt-1.5 text-xs font-semibold">
                        {primaryAddress && (
                          <span className="flex items-center gap-1">
                            <Icon name="map-pin" className="w-3.5 h-3.5" />
                            {primaryAddress.city}
                          </span>
                        )}
                        {service.subcategory && (
                          <>
                            {primaryAddress && <span className="w-1 h-1 bg-slate-200 rounded-full" />}
                            <span>{service.subcategory.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {price !== null && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">From</p>
                        <p className="text-lg font-black text-slate-900">₹{price.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Icon name="users" className="w-4 h-4" />
                      {service.capacity} guest{service.capacity === 1 ? "" : "s"} capacity
                    </span>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                      Edit →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
