"use client";

import { usePathname } from "next/navigation";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Header from "./components/header/Header";
import BottomNavigation from "./components/organisms/BottomNavigation";

export default function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { switchLanguage, lang } = useLocalizationContext();
  const pathname = usePathname() || "";

  // Auth screens (login/pin/verify-otp) are a focused flow
  const isAuthRoute = /^\/[^/]+\/auth(\/|$)/.test(pathname);

  // The builder screen has its own persistent floating action footer (Back / Continue)
  // so bottom nav should not overlap with the wizard actions.
  const isBuilderRoute = /^\/[^/]+\/builder(\/|$)/.test(pathname);

  // Routes that render their own custom TopNavigation
  const hasOwnTopNav =
    /^\/[^/]+\/(bookings|admin|sitemap|results|journey)(\/|$)/.test(pathname) ||
    /^\/[^/]+\/vendor\/(?!dashboard|bookings|calendar|community|contracts|onboarding|partnerships|payouts|services)[^/]+(\/|$)/.test(pathname);

  const showBottomNav = !isAuthRoute && !isBuilderRoute;

  return (
    <div
      dir={lang === "he" ? "rtl" : "ltr"}
      className={`bg-white min-h-screen overflow-x-hidden ${showBottomNav ? "pb-20 md:pb-0" : ""}`}
    >
      {!isAuthRoute && !hasOwnTopNav && <Header />}
      <div className="page-fade-in">{children}</div>
      {showBottomNav && (
        <BottomNavigation onToggleLanguage={(l) => switchLanguage(l as any)} />
      )}
    </div>
  );
}