"use client";

/**
 * Central client-side analytics entry point for the portal.
 *
 * Every tracked interaction goes through `pushEvent` → window.dataLayer.
 * Do not call gtag()/fbq() directly anywhere else in the app — GTM (loaded
 * in app/layout.tsx via NEXT_PUBLIC_GTM_ID) reads window.dataLayer and is
 * responsible for firing GA4 or any other configured tag from it.
 *
 * This file never pushes a raw page_view — GTM's own "All Pages" trigger
 * already covers pageviews once a GA4 Configuration tag exists in the
 * container, so pushing one here would double-count. `app_landing_view` is a
 * distinct, named business event (did someone actually land on the portal
 * home screen), not a substitute for GTM's pageview tracking.
 *
 * This is separate from `lib/prepTracker.ts`, which sends events to the
 * existing first-party `/api/v1/sessions/event` backend pipeline. That
 * pipeline stays as-is; this file only feeds GTM/GA4/dataLayer.
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Attribution already captured by middleware.ts on every request (7-day
 * cookies). Attached to every event so a traveller/vendor lead is never
 * measured without knowing where it came from.
 */
function attribution(): Record<string, string | undefined> {
  return {
    partner_ref: readCookie("partner_ref"),
    utm_source: readCookie("utm_source"),
  };
}

export function pushEvent(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...attribution(),
    ...params,
  });
}

// ── Named events — the only vocabulary the app should use ──────────────────
// One function per required Stage 1 event. Call sites pass real values only;
// never fabricate an id, count or name to make an event look more complete.

export const trackAppLandingView = (): void => pushEvent("app_landing_view");

export const trackPortalCtaClick = (cta: string, destination?: string): void =>
  pushEvent("portal_cta_click", { cta, destination });

export const trackTravellerRequestStart = (): void => pushEvent("traveller_request_start");

export const trackTravellerDestinationSelect = (origin: string, destinations: string[]): void =>
  pushEvent("traveller_destination_select", { origin, destinations });

export const trackTravellerDateSelect = (startDate: string | null, endDate: string | null): void =>
  pushEvent("traveller_date_select", { start_date: startDate, end_date: endDate });

export const trackTravellerPeopleSelect = (guestCount: number): void =>
  pushEvent("traveller_people_select", { guest_count: guestCount });

export const trackTravellerNeedSelect = (servicePreferences: string[]): void =>
  pushEvent("traveller_need_select", { service_preferences: servicePreferences });

export const trackTravellerStopAdd = (stopName: string, stopCount: number): void =>
  pushEvent("traveller_stop_add", { stop_name: stopName, stop_count: stopCount });

export const trackTravellerPlanPreview = (destinations: string[], guestCount: number): void =>
  pushEvent("traveller_plan_preview", { destinations, guest_count: guestCount });

export const trackTravellerRequestSubmit = (
  packageId: string | number,
  totalPrice: number,
  destinations: string[],
): void => pushEvent("traveller_request_submit", { package_id: packageId, total_price: totalPrice, destinations });

export const trackVendorApplyStart = (): void => pushEvent("vendor_apply_start");

export const trackVendorApplySubmit = (vendorId: string, businessName?: string): void =>
  pushEvent("vendor_apply_submit", { vendor_id: vendorId, business_name: businessName });

export const trackWhatsappContactClick = (context?: string): void =>
  pushEvent("whatsapp_contact_click", { context });

export const trackPartnerProfileView = (vendorId: string, vendorName?: string): void =>
  pushEvent("partner_profile_view", { vendor_id: vendorId, vendor_name: vendorName });

export const trackPartnerContactClick = (
  vendorId: string,
  vendorName: string | undefined,
  channel: string,
): void => pushEvent("partner_contact_click", { vendor_id: vendorId, vendor_name: vendorName, channel });
