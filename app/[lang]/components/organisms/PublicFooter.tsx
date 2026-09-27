import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PublicFooter() {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || 'en';
  const p = (path: string) => `/${lang}${path}`;

  const supportLinks = [
    { label: 'pahariyatri@gmail.com', href: 'mailto:pahariyatri@gmail.com?subject=Pahari%20Yatri%20support' },
  ];

  const columns = [
    {
      title: 'Support',
      links: supportLinks,
    },
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
        { label: 'Parent Website ↗', href: 'https://www.pahariyatri.com/', external: true },
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
    <footer className="bg-slate-950 text-white border-t border-slate-900 px-6 pt-14 pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-black text-xs text-white shadow-lg shadow-emerald-500/20">
                PY
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-white">
                  Travel Platform
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                  by Pahari Yatri
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-base font-medium text-slate-100">
                Travel like you know someone there.
              </p>
              <p className="text-sm leading-6 text-slate-400">
                Built by Pahari Yatri for travellers who want local context, not package noise.
              </p>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-3 text-sm text-slate-300">
              <p>
                Support:{' '}
                <a href="mailto:pahariyatri@gmail.com" className="text-white transition-colors hover:text-emerald-400">
                  pahariyatri@gmail.com
                </a>
              </p>
              <p>
                Parent Company:{' '}
                <a href="https://www.pahariyatri.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white transition-colors hover:text-emerald-400">
                  Pahari Yatri (www.pahariyatri.com) ↗
                </a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('http') || link.href.startsWith('mailto:') ? (
                        <a
                          href={link.href}
                          target={link.href.startsWith('http') ? '_blank' : undefined}
                          rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-sm text-slate-400 transition-colors hover:text-emerald-400"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-emerald-400">
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

        <div className="flex flex-col items-start justify-between gap-3 pt-6 text-[11px] text-slate-500 sm:flex-row sm:items-center">
          <p>© 2026 Pahari Yatri. All rights reserved. • Travel Platform by Pahari Yatri</p>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
              Early Access
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Made for the mountains
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
