"use client";

import { usePathname } from "next/navigation";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import Header from "./components/organisms/Header";
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
    /^\/[^/]+\/(bookings|admin|sitemap|results)(\/|$)/.test(pathname) ||
    /^\/[^/]+\/vendor\/(?!dashboard|bookings|calendar|contracts|onboarding|partnerships|payouts|services)[^/]+(\/|$)/.test(pathname);

  const showBottomNav = !isAuthRoute && !isBuilderRoute;

  return (
    <div
      dir={lang === "he" ? "rtl" : "ltr"}
      className="bg-white min-h-screen overflow-x-hidden flex flex-col justify-between"
    >
      {!isAuthRoute && !hasOwnTopNav && <Header />}
      {/* BottomNavigation is `fixed bottom-0` and overlays page content on
          mobile — without this, its ~80px bar (incl. safe-area-inset-bottom
          on notched phones) hides the last row of any page that ends in
          <PublicFooter> (copyright/tagline) or otherwise abuts the bottom. */}
      <div className={`page-fade-in ${showBottomNav ? "pb-24 md:pb-0" : ""}`}>{children}</div>
      {showBottomNav && (
        <BottomNavigation onToggleLanguage={(l) => switchLanguage(l as any)} />
      )}
    </div>
  );
}