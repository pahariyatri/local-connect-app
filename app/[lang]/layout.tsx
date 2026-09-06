import { headers } from "next/headers";
import Header from "./components/organisms/Header";
import BottomNavigation from "./components/organisms/BottomNavigation";

// Converted from a client component (2026-09): it only ever used
// usePathname() for these route-shape checks and useLocalizationContext()
// for `lang` (available directly as a param here) and `switchLanguage`
// (passed to BottomNavigation's onToggleLanguage prop, which that
// component has never actually read — see BottomNavigation.tsx). Being
// "use client" put a client-component boundary directly under the [lang]
// segment, above EVERY page in the app.
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const pathname = (await headers()).get("x-pathname") ?? "";

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
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}