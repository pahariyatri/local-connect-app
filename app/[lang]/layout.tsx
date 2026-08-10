"use client";

import { usePathname } from "next/navigation";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Header from "./components/header/Header";
import BottomNavigation from "./components/organisms/BottomNavigation";

export default function LangLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { switchLanguage, lang } = useLocalizationContext();
  const pathname = usePathname();
  // Auth screens (login/pin/verify-otp) are a focused, standalone flow —
  // the marketing site chrome (nav links, language switcher, "Login" button
  // sitting on the login page itself) doesn't belong there.
  const isAuthRoute = /^\/[^/]+\/auth(\/|$)/.test(pathname || "");
  // These routes each render their own customized TopNavigation (title,
  // back button) — rendering the default one here too stacked a second
  // <nav> exactly on top of it at the same fixed position. The vendor
  // public-profile page (/vendor/[id]) is the same case, but nested under
  // /vendor alongside dashboard/services/etc. which rely on the default
  // nav — so it needs its own pattern rather than a plain segment match.
  const hasOwnTopNav = /^\/[^/]+\/(bookings|admin|privacy-policy|sitemap|results|journey|terms-conditions)(\/|$)/.test(pathname || "")
    || /^\/[^/]+\/vendor\/(?!dashboard|bookings|calendar|community|contracts|onboarding|partnerships|payouts|services)[^/]+(\/|$)/.test(pathname || "");
  // Discover and Journey also render their own BottomNavigation.
  const hasOwnBottomNav = /^\/[^/]+\/(discover|journey)(\/|$)/.test(pathname || "");

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {!isAuthRoute && !hasOwnTopNav && <Header />}
      <div className="page-fade-in">
        {children}
      </div>
      {!isAuthRoute && !hasOwnBottomNav && <BottomNavigation onToggleLanguage={(l) => switchLanguage(l as any)} />}
    </div>
  );
}