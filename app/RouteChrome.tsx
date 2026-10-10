"use client";

import { usePathname } from "next/navigation";
import Header from "./components/organisms/Header";
import BottomNavigation from "./components/organisms/BottomNavigation";

export default function RouteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isAuthRoute = /^\/auth(\/|$)/.test(pathname);
  const isBuilderRoute = /^\/builder(\/|$)/.test(pathname);
  const hasOwnTopNav =
    /^\/(bookings|admin|sitemap|results)(\/|$)/.test(pathname) ||
    /^\/vendor\/(?!dashboard|bookings|calendar|contracts|onboarding|partnerships|payouts|services)[^/]+(\/|$)/.test(
      pathname,
    );
  const showBottomNav = !isAuthRoute && !isBuilderRoute;

  return (
    <>
      {!isAuthRoute && !hasOwnTopNav && <Header />}
      <div className={`page-fade-in ${showBottomNav ? "pb-24 md:pb-0" : ""}`}>
        {children}
      </div>
      {showBottomNav && <BottomNavigation />}
    </>
  );
}