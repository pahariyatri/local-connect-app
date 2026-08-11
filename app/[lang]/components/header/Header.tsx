'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from '../atoms/Icon';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Extract lang prefix from pathname (e.g. /en, /hi)
  const lang = pathname?.split('/')[1] || 'en';

  const navLinks = [
    { href: `/${lang}/explore`, label: 'Explore' },
    { href: `/${lang}/builder`, label: 'Plan a Trip' },
    { href: `/${lang}/vendor/onboarding`, label: 'Become a Partner' },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3.5">
        {/* Logo */}
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2.5 text-slate-900 hover:text-emerald-600 transition-colors"
        >
          <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-[11px] flex-shrink-0">
            PY
          </span>
          <span className="font-black text-[13px] uppercase tracking-[0.15em]">
            Pahari Yatri
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1 items-center" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-colors ${
                isActive(link.href)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={`/${lang}/auth/login`}
            className="text-[12px] font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            href={`/${lang}/auth/register`}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-black uppercase tracking-wider px-5 py-2.5 rounded-full transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          id="header-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          id="header-mobile-nav"
          className="md:hidden bg-white border-t border-slate-100 pt-2 pb-6 px-5"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl my-0.5 text-sm font-semibold transition-colors ${
                isActive(link.href)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href={`/${lang}/auth/login`}
              onClick={() => setMenuOpen(false)}
              className="text-center py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={`/${lang}/auth/register`}
              onClick={() => setMenuOpen(false)}
              className="text-center bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[12px] uppercase tracking-wider py-3.5 rounded-xl transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
