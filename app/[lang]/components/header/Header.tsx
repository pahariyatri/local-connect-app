'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '../atoms/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalizationContext } from '@/contexts/LocalizationContext';
import { Locale } from '@/i18n-config';
import { BRAND_CONFIG } from '@/config/brandConfig';

/** First letter of the display name, or a neutral fallback — never a fabricated name. */
function initialOf(name?: string, phone?: string) {
  const trimmed = (name || '').trim();
  if (trimmed && trimmed.toLowerCase() !== 'user') return trimmed[0].toUpperCase();
  const digits = (phone || '').replace(/\D/g, '');
  return digits ? digits.slice(-1) : 'Y';
}

const SUPPORTED_LANGUAGES: { code: Locale; label: string; flag: string; nativeName: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'he', label: 'Hebrew', flag: '🇮🇱', nativeName: 'עברית' },
  { code: 'de', label: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'fr', label: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { switchLanguage, lang, dict } = useLocalizationContext();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const navDict = dict?.nav || {};
  const commonDict = dict?.page?.common?.actions || {};

  const displayName = (user?.name || '').trim();
  const accountLabel = displayName && displayName.toLowerCase() !== 'user'
    ? displayName
    : 'My Account';

  const handleLogout = () => {
    logout();
    router.push(`/${lang}`);
  };

  // Close language dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: `/${lang}/explore`, label: navDict.explore || commonDict.explore || 'Explore' },
    { href: `/${lang}/community`, label: navDict.community || commonDict.community || 'Community' },
    { href: `/${lang}/vendor/onboarding`, label: navDict.partner || 'Become a Partner' },
  ];

  const planTripHref = `/${lang}/builder`;
  const isPlanActive = pathname?.startsWith(planTripHref);
  const isActive = (href: string) => pathname === href || (href !== `/${lang}` && pathname?.startsWith(href));

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3">
        {/* Brand Logo */}
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl shrink-0"
          aria-label={`${BRAND_CONFIG.fullProductName} Home`}
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            {BRAND_CONFIG.brandInitials}
          </span>
          <div className="flex flex-col">
            <span className="font-black text-[12px] sm:text-[13px] uppercase tracking-[0.18em] text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
              {BRAND_CONFIG.productDisplayName}
            </span>
            <span className="text-[9px] font-bold text-emerald-600 tracking-wider uppercase -mt-0.5">
              {BRAND_CONFIG.productDescriptor}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1.5 items-center" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive(link.href)
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Highlighted 'Plan a Trip' CTA in Nav */}
          <Link
            href={planTripHref}
            className={`ml-1 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
              isPlanActive
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 hover:border-emerald-300'
            }`}
          >
            <Icon name="mountain" className="w-3.5 h-3.5" />
            <span>{navDict.plan || 'Plan a Trip'}</span>
          </Link>
        </nav>

        {/* Right Section: Multi-Language Selector & Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Universal Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all border border-slate-200/60 shadow-2xs active:scale-95"
              aria-label="Select language"
              aria-expanded={langDropdownOpen}
            >
              <span className="text-sm leading-none">{currentLangObj.flag}</span>
              <span className="uppercase text-[11px] font-black tracking-wider">{currentLangObj.code}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                  langDropdownOpen ? 'rotate-180' : ''
                }`}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-slate-200/80 shadow-2xl shadow-slate-300/50 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {commonDict.language || 'Language / भाषा'}
                  </p>
                </div>
                {SUPPORTED_LANGUAGES.map((item) => {
                  const isCurrent = item.code === lang;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        switchLanguage(item.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.flag}</span>
                        <span>{item.nativeName}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-emerald-600 font-black text-xs">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 pl-1.5 pr-2 rounded-full border border-slate-200/70">
                <Link
                  href={`/${lang}/profile`}
                  data-testid="header-account"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black shadow-sm flex-shrink-0">
                    {initialOf(user.name, user.phone)}
                  </span>
                  <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                    {accountLabel}
                  </span>
                </Link>
                <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={handleLogout}
                  data-testid="header-logout"
                  className="text-[11px] font-bold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-full hover:bg-rose-50 transition-colors"
                  title={commonDict.log_out || 'Log out'}
                >
                  {commonDict.log_out || 'Log out'}
                </button>
              </div>
            ) : (
              <Link
                href={`/${lang}/auth/login`}
                className="bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <Icon name="user" className="w-3.5 h-3.5" />
                <span>{navDict.sign_in || 'Sign In'}</span>
              </Link>
            )}
          </div>

          {/* Mobile Profile Icon (If logged in) */}
          <div className="md:hidden flex items-center">
            {user ? (
              <Link
                href={`/${lang}/profile`}
                data-testid="header-account-mobile"
                aria-label="Your account"
                className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-sm active:scale-95 transition-transform"
              >
                {initialOf(user.name, user.phone)}
              </Link>
            ) : null}
          </div>

        </div>
      </div>
    </header>
  );
}
