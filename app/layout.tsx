import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { i18n, Locale } from "@/i18n-config";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
import { getDictionary } from "@/get-dictionary";
import { CartProvider } from "@/contexts/CartContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TripPlannerProvider } from "@/contexts/TripPlannerContext";
import { NotificationContainer } from "./[lang]/components/atoms/Toast";


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

// params.lang can be missing for internal/non-page requests that still
// render through the root layout — fall back to the configured default
// rather than letting the dictionary import (or metadata) blow up on
// `undefined`. Shared by generateMetadata and RootLayout below.
function resolveLang(paramsLang: string | undefined): Locale {
  return (i18n.locales as readonly string[]).includes(paramsLang as string)
    ? (paramsLang as Locale)
    : (i18n.defaultLocale as Locale);
}

import { BRAND_CONFIG } from "@/config/brandConfig";

const SITE_URL = BRAND_CONFIG.appUrl;

export async function generateMetadata(props: {
  params?: Promise<{ lang?: Locale }>;
}): Promise<Metadata> {
  const params = props.params ? await props.params : undefined;
  const lang = resolveLang(params?.lang);

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
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: Object.fromEntries(i18n.locales.map((l) => [l, `${SITE_URL}/${l}`])),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/${lang}`,
      siteName: BRAND_CONFIG.fullProductName,
    },
    twitter: {
      // No OG/share image asset exists yet (public/ has no og-image) —
      // 'summary' degrades cleanly without one; switch to
      // 'summary_large_image' once a real 1200x630 image is added.
      card: 'summary',
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params?: Promise<{ lang?: Locale }>;
}) {
  const params = props.params ? await props.params : undefined;
  const lang = resolveLang(params?.lang);
  const dict = await getDictionary(lang);

  const { children } = props;
  return (
    // suppressHydrationWarning on html/body only: browser extensions (e.g.
    // Storylane, LocatorJS) inject attributes like class="js-storylane-extension"
    // or __processed_<uuid>__="true" onto these two elements before React
    // hydrates, which React then reports as a mismatch even though nothing
    // in our render output actually differs. Scoped to just these two tags
    // so a real mismatch anywhere else in the tree still warns normally.
    <html lang={lang} dir={lang === "he" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <NotificationProvider>
            <TripPlannerProvider>
              <CartProvider>
                <LocalizationProvider initialDict={dict} initialLang={lang}>
                  {children}
                  <NotificationContainer />
                </LocalizationProvider>
              </CartProvider>
            </TripPlannerProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
