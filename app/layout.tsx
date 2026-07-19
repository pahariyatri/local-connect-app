import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { i18n, Locale } from "@/i18n-config";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
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

export const metadata: Metadata = {
  title: 'Local Connect Portal - Authentic Travel Experiences',
  description: 'Connect with local vendors for authentic travel experiences. Book trips, stays, and adventures directly with locals.',
  openGraph: {
    title: 'Local Connect Portal',
    description: 'Authentic Travel Experiences with Local Vendors',
    type: 'website',
  },
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { children } = props;
  return (
    <html lang={params.lang} dir={params.lang === "he" ? "rtl" : "ltr"}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <TripPlannerProvider>
              <CartProvider>
                <LocalizationProvider>
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
