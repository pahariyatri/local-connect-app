import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TripPlannerProvider } from "@/contexts/TripPlannerContext";
import { NotificationContainer } from "./components/atoms/Toast";
import RouteChrome from "./RouteChrome";


// Re-theme (2026-08-30): switched the app's primary typeface from Geist
// Sans to Poppins to match the approved design reference — a rounder,
// friendlier geometric sans that reads calmer at the app's existing bold
// weights than Geist did. The CSS variable is renamed --font-sans (was
// --font-geist-sans) so the name doesn't lie about which font it is;
// tailwind.config.ts and globals.css are updated to match.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

import { BRAND_CONFIG } from "@/config/brandConfig";

const SITE_URL = BRAND_CONFIG.appUrl;

export function generateMetadata(): Metadata {

  // The old copy here ("Himachal Journey Planner") framed the whole product
  // as a trip-planning tool, which undersells the direct-search path (a
  // traveler who just needs "taxi in Kasol" shouldn't read this as a
  // planner-only product) — this is the same tagline already live in the
  // footer and now the hero, kept as one consistent line rather than a
  // third, different pitch.
  const title = `${BRAND_CONFIG.tagline} | ${BRAND_CONFIG.fullProductName}`;
  const description =
    'Search real homestays, 4x4 drivers, and local guides across Himachal Pradesh — verified locals, direct and with no agency markup. Or build a full multi-stop route with stays and transit in one place.';

  return {
    // Absolute base for OG/Twitter/canonical URL resolution (production frontend).
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: SITE_URL,
      siteName: BRAND_CONFIG.fullProductName,
    },
    twitter: {
      // app/opengraph-image.tsx (server-rendered via next/og) supplies the
      // actual 1200x630 image Next.js injects into both og:image and
      // twitter:image automatically — summary_large_image is safe now.
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    // suppressHydrationWarning on html/body only: browser extensions (e.g.
    // Storylane, LocatorJS) inject attributes like class="js-storylane-extension"
    // or __processed_<uuid>__="true" onto these two elements before React
    // hydrates, which React then reports as a mismatch even though nothing
    // in our render output actually differs. Scoped to just these two tags
    // so a real mismatch anywhere else in the tree still warns normally.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* GTM — loads only when NEXT_PUBLIC_GTM_ID is set. GTM owns GA4 pageviews
            once a Configuration tag exists in the container; app code only ever
            pushes named events to window.dataLayer via lib/analytics.ts, never a
            raw page_view — see lib/analytics.ts for why. */}
        {gtmId && (
          <>
            <Script id="gtm-loader" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
                title="gtm-fallback"
              />
            </noscript>
          </>
        )}
        <AuthProvider>
          <NotificationProvider>
            <TripPlannerProvider>
              <CartProvider>
                <div className="bg-white min-h-screen overflow-x-clip flex flex-col justify-between">
                  <RouteChrome>{children}</RouteChrome>
                </div>
                <NotificationContainer />
              </CartProvider>
            </TripPlannerProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
