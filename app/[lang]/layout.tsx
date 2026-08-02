"use client";

import { usePathname } from "next/navigation";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import TopNavigation from "./components/organisms/TopNavigation";
import BottomNavigation from "./components/organisms/BottomNavigation";

export default function LangLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { switchLanguage } = useLocalizationContext();
  const pathname = usePathname();
  // Auth screens (login/pin/verify-otp) are a focused, standalone flow —
  // the marketing site chrome (nav links, language switcher, "Login" button
  // sitting on the login page itself) doesn't belong there.
  const isAuthRoute = /^\/[^/]+\/auth(\/|$)/.test(pathname || "");
  // Bookings and Admin each render their own customized TopNavigation
  // (title, back button) — rendering the default one here too stacked a
  // second <nav> exactly on top of it at the same fixed position.
  const hasOwnTopNav = /^\/[^/]+\/(bookings|admin)(\/|$)/.test(pathname || "");

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {!isAuthRoute && !hasOwnTopNav && <TopNavigation onToggleLanguage={(l) => switchLanguage(l as any)} />}
      <div className="page-fade-in">
        {children}
      </div>
      {!isAuthRoute && <BottomNavigation onToggleLanguage={(l) => switchLanguage(l as any)} />}
    </div>
  );
}