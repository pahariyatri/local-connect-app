import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SupportContact from '../molecules/SupportContact';
import { BRAND_CONFIG } from '@/config/brandConfig';

export default function PublicFooter() {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || 'en';
  const p = (path: string) => `/${lang}${path}`;

  const columns = [
    {
      title: 'Explore',
      links: [
        { label: 'Explore Directory', href: p('/explore') },
        { label: 'Trip Builder', href: p('/builder') },
      ],
    },
    {
      title: 'Partners',
      links: [
        { label: 'Become a Partner', href: p('/vendor/onboarding') },
        { label: 'Partner Portal', href: p('/auth/login') },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Platform', href: p('/about') },
        { label: 'Parent Website ↗', href: BRAND_CONFIG.parentBrandUrl, external: true },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: p('/privacy-policy') },
        { label: 'Terms & Conditions', href: p('/terms-conditions') },
      ],
    },
  ];

  return (
    <footer className="bg-slate-950 text-white px-6 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Brand & Parent Company Identification */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 pb-12 border-b border-white/10">
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-emerald-500/20">
                {BRAND_CONFIG.brandInitials}
              </span>
              <div className="flex flex-col">
                <span className="font-black text-sm uppercase tracking-[0.18em] text-white">
                  {BRAND_CONFIG.productDisplayName}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  {BRAND_CONFIG.productDescriptor}
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              {BRAND_CONFIG.tagline}
            </p>

            <div className="pt-2 text-xs space-y-1.5 border-t border-white/5">
              <p className="text-slate-500 text-[11px]">
                Support:{" "}
                <a
                  href={`mailto:${BRAND_CONFIG.supportEmail}`}
                  className="text-slate-300 hover:text-emerald-400 transition-colors font-medium"
                >
                  {BRAND_CONFIG.supportEmail}
                </a>
              </p>
              <p className="text-slate-500 text-[11px]">
                Parent Company:{" "}
                <a
                  href={BRAND_CONFIG.parentBrandUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-emerald-400 transition-colors font-medium inline-flex items-center gap-1"
                >
                  {BRAND_CONFIG.parentBrandName} ({BRAND_CONFIG.parentBrandUrl.replace("https://", "")}) ↗
                </a>
              </p>
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-8">
            <SupportContact variant="footer" />
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>
            {BRAND_CONFIG.parentBrandCopyright} • {BRAND_CONFIG.fullProductName}
          </p>
          <div className="flex items-center gap-4">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-wider text-slate-400">
              {BRAND_CONFIG.productStage}
            </span>
            <p className="uppercase tracking-wider font-bold text-slate-400">
              Made for the mountains
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
