import React from "react";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { marked } from "marked";
import { notFound } from "next/navigation";

interface PageParams {
  lang: string;
  slug: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

const SLUG_MAP: Record<string, string> = {
  "architecture": "ARCHITECTURE.md",
  "user-flows": "USER_FLOWS.md",
  "design-system": "DESIGN_SYSTEM.md",
};

export async function generateStaticParams() {
  return [
    { slug: "architecture" },
    { slug: "user-flows" },
    { slug: "design-system" },
  ];
}

export default async function DocDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const fileName = SLUG_MAP[slug];

  if (!fileName) {
    notFound();
  }

  // Load content from docs folder
  const docsDir = path.join(process.cwd(), "docs");
  const filePath = path.join(docsDir, fileName);

  let rawContent = "";
  try {
    rawContent = await fs.readFile(filePath, "utf-8");
  } catch (error) {
    console.error("Failed to read document:", error);
    notFound();
  }

  // Parse markdown
  const htmlContent = await marked.parse(rawContent);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <main className="max-w-4xl mx-auto px-6 pt-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Link href={`/${lang}`} className="hover:text-slate-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/${lang}/docs`} className="hover:text-slate-600 transition-colors">Docs</Link>
          <span>/</span>
          <span className="text-slate-800">{slug.replace("-", " ")}</span>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-12 shadow-sm">
          {/* Custom style wrapper for parsed HTML */}
          <article 
            className="prose prose-slate max-w-none 
              prose-headings:uppercase prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
              prose-h1:text-3xl prose-h1:mb-8 prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4
              prose-p:text-slate-600 prose-p:font-medium prose-p:leading-[1.8] prose-p:text-sm prose-p:mb-6
              prose-li:text-slate-600 prose-li:font-medium prose-li:text-sm prose-li:mb-2
              prose-strong:text-slate-800 prose-strong:font-bold
              prose-code:text-emerald-600 prose-code:font-mono prose-code:text-xs prose-code:bg-slate-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-6 prose-pre:rounded-2xl prose-pre:overflow-x-auto prose-pre:font-mono prose-pre:text-xs prose-pre:leading-relaxed prose-pre:mb-6
              prose-table:w-full prose-table:text-left prose-table:text-xs prose-table:mb-6
              prose-th:font-black prose-th:uppercase prose-th:text-slate-400 prose-th:tracking-wider prose-th:pb-3 prose-th:border-b prose-th:border-slate-100
              prose-td:py-3 prose-td:border-b prose-td:border-slate-50 prose-td:text-slate-600 prose-td:font-medium
            "
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
          />
        </div>
      </main>
    </div>
  );
}
