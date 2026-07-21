import React from "react";
import Link from "next/link";

interface DocInfo {
  slug: string;
  title: string;
  description: string;
  icon: string;
  topics: string[];
}

const DOCS: DocInfo[] = [
  {
    slug: "architecture",
    title: "System Architecture",
    description: "Deep dive into our application structure, client state (Context vs Zustand), i18n routing, and backend request lifecycle.",
    icon: "🏗️",
    topics: ["Layered view", "Routing & i18n", "Request lifecycle", "Zustand vs Context"],
  },
  {
    slug: "user-flows",
    title: "User Flows & Journeys",
    description: "Flowcharts detailing traveler planning, multi-step route customization, OTP/PIN authentication, and vendor onboarding.",
    icon: "🗺️",
    topics: ["Trip planner wizard", "OTP/PIN Authentication", "Booking & Payment", "Isolated Communities"],
  },
  {
    slug: "design-system",
    title: "Design System & UI Rules",
    description: "Atomic design pattern breakdown, Tailwind brand color tokens, accessibility standards, and core UX rules.",
    icon: "🎨",
    topics: ["Atomic components", "Color tokens", "UX rules & flow", "A11y standards"],
  },
];

interface PageParams {
  lang: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export default async function DocsPage({ params }: PageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-slate-900 py-20 text-center">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-950"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 mb-4">
            System Docs
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight mb-6">
            Developer <span className="text-emerald-400">Knowledge Hub</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 font-medium text-sm leading-relaxed">
            Understand the architectural layers, user flows, and design rules powering the Local Connect platform.
          </p>
        </div>
      </div>

      {/* Docs Grid */}
      <main className="max-w-5xl mx-auto px-6 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DOCS.map((doc) => (
            <div
              key={doc.slug}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col h-full group"
            >
              <div className="text-4xl mb-6">{doc.icon}</div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                {doc.title}
              </h2>
              <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 flex-grow">
                {doc.description}
              </p>

              <div className="mb-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Key Topics</h4>
                <div className="flex flex-wrap gap-1.5">
                  {doc.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-600 border border-slate-100"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={`/${lang}/docs/${doc.slug}`}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center transition-all duration-200 shadow-md shadow-slate-900/10 hover:shadow-emerald-600/20"
              >
                Read Document →
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
