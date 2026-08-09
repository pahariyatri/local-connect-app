import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { i18n, Locale } from "@/i18n-config";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
import { getDictionary } from "@/get-dictionary";
import { CartProvider } from "@/contexts/CartContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TripPlannerProvider } from "@/contexts/TripPlannerContext";
import { NotificationContainer } from "./[lang]/components/atoms/Toast";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
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

const SITE_URL = 'https://app.pahariyatri.com';

export async function generateMetadata(props: {
  params?: Promise<{ lang?: Locale }>;
}): Promise<Metadata> {
  const params = props.params ? await props.params : undefined;
  const lang = resolveLang(params?.lang);

  return {
    // Absolute base for OG/Twitter/canonical URL resolution (production frontend).
    metadataBase: new URL(SITE_URL),
    title: 'Pahari Yatri | Build Your Himachal Journey',
    description:
      'Plan stays, transport, food, activities and trusted local services across your complete Himachal route.',
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: Object.fromEntries(i18n.locales.map((l) => [l, `${SITE_URL}/${l}`])),
    },
    openGraph: {
      title: 'Pahari Yatri',
      description: 'Build your whole Himachal journey — stays, transport, food, activities and trusted local services.',
      type: 'website',
      url: `${SITE_URL}/${lang}`,
    },
    twitter: {
      // No OG/share image asset exists yet (public/ has no og-image) —
      // 'summary' degrades cleanly without one; switch to
      // 'summary_large_image' once a real 1200x630 image is added.
      card: 'summary',
      title: 'Pahari Yatri | Build Your Himachal Journey',
      description: 'Plan stays, transport, food, activities and trusted local services across your complete Himachal route.',
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
    <html lang={lang} dir={lang === "he" ? "rtl" : "ltr"}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <TripPlannerProvider>
              <CartProvider>
                <LocalizationProvider initialDict={dict} initialLang={lang}>
                  <div className="pb-16">{children}</div>
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
