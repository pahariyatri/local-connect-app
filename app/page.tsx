import type { Metadata } from "next";
import { BRAND_CONFIG } from "@/config/brandConfig";
import LandingPage from "./LandingPage";

const title = `Kasol & Parvati Valley Stays, Rides & Guides | ${BRAND_CONFIG.parentBrandName}`;
const description =
  "Find local homestays, mountain rides and guides around Kasol and the Parvati Valley. Explore individual services or bring your journey together in a trip planner.";
export async function generateMetadata(): Promise<Metadata> {
  const url = BRAND_CONFIG.appUrl;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: BRAND_CONFIG.fullProductName,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: BRAND_CONFIG.fullProductName,
            url: BRAND_CONFIG.appUrl,
            description,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <LandingPage />
    </>
  );
}
