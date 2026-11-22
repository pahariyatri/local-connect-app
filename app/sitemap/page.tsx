import Link from "next/link";
import type { Metadata } from "next";

// Human sitemap: only pages that exist and work today. The old version listed
// internal or unbuilt features ("Agency Dashboard", "Lead Manager", "Peak AI
// Assistant", "Live Tracking") and fake booking ids. The crawler sitemap is
// app/sitemap.ts (sitemap.xml) and is unchanged.
export const metadata: Metadata = {
  title: "Sitemap",
  robots: { index: false, follow: true },
};

const SECTIONS: { title: string; links: { name: string; path: string }[] }[] = [
  {
    title: "Travel",
    links: [
      { name: "Home", path: "/" },
      { name: "Explore stays, rides & guides", path: "/explore" },
      { name: "Plan a trip", path: "/builder" },
      { name: "My bookings", path: "/bookings" },
      { name: "Profile", path: "/profile" },
    ],
  },
  {
    title: "Hosts",
    links: [
      { name: "List your stay, ride or guiding service", path: "/vendor/onboarding" },
      { name: "Host dashboard", path: "/vendor/dashboard" },
    ],
  },
  {
    title: "About",
    links: [
      { name: "About Pahari Yatri", path: "/about" },
      { name: "Terms & conditions", path: "/terms-conditions" },
      { name: "Privacy policy", path: "/privacy-policy" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <main className="max-w-md mx-auto px-4 pt-24 pb-32">
      <h1 className="text-2xl font-black text-slate-900">Sitemap</h1>
      <div className="mt-6 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">{s.title}</h2>
            <ul className="mt-2 divide-y divide-slate-100">
              {s.links.map((l) => (
                <li key={l.path}>
                  <Link href={l.path} className="flex min-h-[48px] items-center font-semibold text-slate-900">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
