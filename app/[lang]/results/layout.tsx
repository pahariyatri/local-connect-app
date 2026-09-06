import type { Metadata } from "next";

// /results renders a specific traveller's plan — read from a packageId query
// param or from client-side trip-planner state. It is never the same content
// twice and carries no independent search intent of its own (nobody searches
// for someone else's itinerary), so it must not be indexed. The page itself
// is a client component and can't export metadata directly — this server
// layout is the minimal way to attach robots rules to the route segment
// without converting the page to a server component.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
