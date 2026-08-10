'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PublicFooter() {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || 'en';
  const p = (path: string) => `/${lang}${path}`;

  const columns = [
    {
      title: 'Explore',
      links: [
        { label: 'Destinations', href: p('/explore') },
        { label: 'Local Services', href: p('/discover') },
        { label: 'Plan a Trip', href: p('/builder') },
        { label: 'Community', href: p('/community') },
      ],
    },
    {
      title: 'Partners',
      links: [
        { label: 'Become a Partner', href: p('/vendor/onboarding') },
        { label: 'Partner Login', href: p('/auth/login') },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: p('/about') },
        { label: 'Blog', href: p('/blog') },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: p('/privacy-policy') },
        { label: 'Terms', href: p('/terms-conditions') },
      ],
    },
  ];

  return (
    <footer className="bg-slate-950 text-white px-6 pt-16 pb-10">
      <div className="max-w-6xl mx-auto">
        {/* Brand row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 pb-12 border-b border-white/10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-[11px]">
                PY
              </span>
              <span className="font-black text-[13px] uppercase tracking-[0.15em]">
                Pahari Yatri
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed italic">
              Wherever you go in the mountains,<br />know a local.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-[10px]">
            © {new Date().getFullYear()} Pahari Yatri. All rights reserved.
          </p>
          <p className="text-slate-700 text-[10px] uppercase tracking-wider font-black">
            Made for the mountains.
          </p>
        </div>
      </div>
    </footer>
  );
}
