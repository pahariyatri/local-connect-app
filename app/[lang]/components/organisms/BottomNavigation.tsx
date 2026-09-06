"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { Locale } from "@/i18n-config";
import { userAvatarInitial } from "@/utils/text";

/**
 * Mobile Bottom Navigation Bar
 * Standardized 5-tab mobile UX, authenticated users only (see the `!user`
 * early return below) — logged-out visitors get no bottom nav at all:
 * 1. Logged-in Travelers (Explore | My Trips | Plan Trip | Partner | Account)
 * 2. Logged-in Vendors (Overview | Services | Add Service | Bookings | Profile)
 */
export default function BottomNavigation({
  onToggleLanguage, // eslint-disable-line @typescript-eslint/no-unused-vars
}: {
  onToggleLanguage?: (lang?: Locale) => void;
}) {
  const params = useParams();
  const pathname = usePathname() || "";
  const lang = (params?.lang as string) || "en";
  const { user } = useAuth();
  const { dict } = useLocalizationContext();

  const isVendor = !!user && /vendor|host|broker/i.test(user.role || "");

  // Hide bottom navigation bar on transactional flows where a dedicated sticky footer action bar exists
  const isTransactionalFlow =
    pathname.startsWith(`/${lang}/builder`) ||
    pathname.startsWith(`/${lang}/results`) ||
    pathname.startsWith(`/${lang}/journey`);

  if (isTransactionalFlow) {
    return null;
  }

  // Logged-out visitors get no bottom nav — the guest-facing Explore/Plan/
  // Sign-in tabs this bar used to show for `!user` are gone; those actions
  // live in the top Header for anonymous visitors instead.
  if (!user) {
    return null;
  }

  const navDict = dict?.nav || {};
  const commonDict = dict?.page?.common?.actions || {};

  // Same rule as Header.tsx's avatar — one shared helper for both.
  const userInitial = userAvatarInitial(user.name, user.phone);

  // Check route active statuses
  const isExploreActive =
    pathname === `/${lang}` ||
    pathname.startsWith(`/${lang}/explore`) ||
    pathname.startsWith(`/${lang}/search`) ||
    (pathname.startsWith(`/${lang}/vendor/`) &&
      !pathname.includes("/vendor/dashboard") &&
      !pathname.includes("/vendor/services") &&
      !pathname.includes("/vendor/onboarding") &&
      !pathname.includes("/vendor/bookings") &&
      !pathname.includes("/vendor/community"));

  const isPlanActive =
    pathname.startsWith(`/${lang}/builder`) ||
    pathname.startsWith(`/${lang}/journey`);

  const isPartnerActive = pathname.startsWith(`/${lang}/vendor/onboarding`);
  const isBookingsActive = pathname.startsWith(`/${lang}/bookings`);
  const isProfileActive = pathname.startsWith(`/${lang}/profile`);

  // Vendor routes
  const isVendorDashboardActive = pathname === `/${lang}/vendor/dashboard`;
  const isVendorServicesActive = pathname.startsWith(`/${lang}/vendor/services`);
  const isVendorBookingsActive = pathname.startsWith(`/${lang}/vendor/bookings`);

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-6px_25px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-all"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center h-14">
        
        {/* ─── CASE 1: VENDOR / HOST LOGGED IN ─── */}
        {isVendor ? (
          <>
            {/* Tab 1: Dashboard */}
            <Link
              href={`/${lang}/vendor/dashboard`}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-90 ${
                isVendorDashboardActive ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isVendorDashboardActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
                {isVendorDashboardActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none font-medium">
                Overview
              </span>
            </Link>

            {/* Tab 2: Services */}
            <Link
              href={`/${lang}/vendor/services`}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-90 ${
                isVendorServicesActive ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isVendorServicesActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                {isVendorServicesActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none font-medium">
                Services
              </span>
            </Link>

            {/* Tab 3: Add Service (Center Action) */}
            <Link
              href={`/${lang}/vendor/services/new`}
              className="flex flex-col items-center justify-center -mt-4 group active:scale-95 transition-transform"
              aria-label="Add New Service"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-emerald-600 text-white shadow-emerald-600/30 group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span className="text-[10px] font-black tracking-wider uppercase mt-1 leading-none text-emerald-700">
                Add
              </span>
            </Link>

            {/* Tab 4: Bookings */}
            <Link
              href={`/${lang}/vendor/bookings`}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-90 ${
                isVendorBookingsActive ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isVendorBookingsActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {isVendorBookingsActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none font-medium">
                Bookings
              </span>
            </Link>

            {/* Tab 5: Profile */}
            <Link
              href={`/${lang}/profile`}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-90 ${
                isProfileActive ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black leading-none ${
                  isProfileActive ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {userInitial}
                </span>
                {isProfileActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none font-medium">
                Profile
              </span>
            </Link>
          </>
        ) : (
          /* ─── CASE 2: LOGGED-IN TRAVELER (guests never reach this component) ─── */
          <>
            {/* Tab 1: Explore */}
            <Link
              href={`/${lang}/explore`}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-90 ${
                isExploreActive ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isExploreActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={isExploreActive ? "currentColor" : "none"} fillOpacity="0.2" />
                </svg>
                {isExploreActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none font-medium">
                {lang === "en" ? "Explore" : (navDict.explore || commonDict.explore || "Explore")}
              </span>
            </Link>

            {/* Tab 2: My Trips / Bookings */}
            <Link
              href={`/${lang}/bookings`}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-90 ${
                isBookingsActive ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isBookingsActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {isBookingsActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none font-medium">
                {commonDict.my_bookings || "My Trips"}
              </span>
            </Link>

            {/* Tab 3: Plan Trip (Center Hero Button) */}
            <Link
              href={`/${lang}/builder`}
              className="flex flex-col items-center justify-center -mt-4 group active:scale-95 transition-transform"
              aria-label="Plan a Trip"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  isPlanActive
                    ? "bg-slate-900 text-white shadow-emerald-500/25 ring-2 ring-emerald-500 ring-offset-2"
                    : "bg-emerald-600 text-white shadow-emerald-600/30 group-hover:scale-105"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                </svg>
              </div>
              <span
                className={`text-[10px] font-black tracking-wider uppercase mt-1 leading-none ${
                  isPlanActive ? "text-slate-900" : "text-emerald-700"
                }`}
              >
                {navDict.plan || "Plan"}
              </span>
            </Link>

            {/* Tab 4: Partner */}
            <Link
              href={`/${lang}/vendor/onboarding`}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-90 ${
                isPartnerActive ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isPartnerActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                {isPartnerActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none font-medium">
                {navDict.partner || "Partner"}
              </span>
            </Link>

            {/* Tab 5: Account */}
            <Link
              href={`/${lang}/profile`}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all active:scale-90 ${
                isProfileActive ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black leading-none ${
                  isProfileActive ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {userInitial}
                </span>
                {isProfileActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none font-medium">
                {commonDict.profile || "Account"}
              </span>
            </Link>
          </>
        )}

      </div>
    </nav>
  );
}
