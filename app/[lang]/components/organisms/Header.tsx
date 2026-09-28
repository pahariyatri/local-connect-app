'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '../atoms/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalizationContext } from '@/contexts/LocalizationContext';
import { BRAND_CONFIG } from '@/config/brandConfig';
import { userAvatarInitial } from '@/utils/text';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { lang, dict } = useLocalizationContext();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  // Close the mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close the mobile menu on route change, so it never sits open over a new page.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isVendor = !!user && /vendor|host|broker/i.test(user.role || '');

  const navLinks = isVendor
    ? [
        { href: `/${lang}/vendor/dashboard`, label: 'Dashboard' },
        { href: `/${lang}/vendor/services`, label: 'Services' },
        { href: `/${lang}/vendor/bookings`, label: 'Bookings' },
      ]
    : [
        { href: `/${lang}/explore`, label: 'Book directly' },
        { href: `/${lang}/vendor/onboarding`, label: navDict.partner || 'Become a Partner' },
      ];

  const planTripHref = isVendor ? `/${lang}/vendor/services/new` : `/${lang}/builder`;
  const isPlanActive = pathname?.startsWith(planTripHref);
  const isActive = (href: string) => pathname === href || (href !== `/${lang}` && pathname?.startsWith(href));

  return (
    <header data-site-header onKeyDown={(event) => { if (event.key === "Escape") { setMobileMenuOpen(false); } }} className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.03)] transition-all">
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
        <nav className="hidden lg:flex gap-1.5 items-center" aria-label="Main navigation">
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

          {/* Contextual CTA in Nav */}
          <Link
            href={planTripHref}
            className={`ml-1 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
              isPlanActive
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 hover:border-emerald-300'
            }`}
          >
            <span>{isVendor ? 'Add Service' : (navDict.plan || 'Plan a Trip')}</span>
          </Link>
        </nav>

        {/* Account and mobile navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Desktop User Section */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 pl-1.5 pr-2 rounded-full border border-slate-200/70">
                <Link
                  href={`/${lang}/profile`}
                  data-testid="header-account"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black shadow-sm flex-shrink-0">
                    {userAvatarInitial(user.name, user.phone)}
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

          {/* Mobile: Profile Icon (if logged in) + hamburger menu.
              Logged-in users also get the full BottomNavigation bar, so the
              avatar here stays a quick shortcut. Guests previously had
              NOTHING here — no way to reach Explore/Become a Partner/Plan a
              Trip/Sign In from the header at all on mobile (AUDIT-056). */}
          <div className="lg:hidden flex items-center gap-2">
            {user && (
              <Link
                href={`/${lang}/profile`}
                data-testid="header-account-mobile"
                aria-label="Your account"
                className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-sm active:scale-95 transition-transform"
              >
                {userAvatarInitial(user.name, user.phone)}
              </Link>
            )}

            <div className="relative" ref={mobileMenuRef}>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                data-testid="header-mobile-menu-button"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60 active:scale-95 transition-all"
              >
                <Icon name={mobileMenuOpen ? 'close' : 'menu'} className="w-4 h-4" />
              </button>

              {mobileMenuOpen && (
                <div
                  data-testid="header-mobile-menu"
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200/80 shadow-2xl shadow-slate-300/50 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2.5 text-sm font-semibold transition-colors ${
                        isActive(link.href) ? 'bg-slate-50 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <Link
                    href={planTripHref}
                    className="block mx-3 my-1.5 px-3 py-2 rounded-xl text-center text-sm font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                  >
                    {isVendor ? 'Add Service' : (navDict.plan || 'Plan a Trip')}
                  </Link>

                  <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                    {user ? (
                      <>
                        <Link
                          href={`/${lang}/profile`}
                          className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {accountLabel}
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          {commonDict.log_out || 'Log out'}
                        </button>
                      </>
                    ) : (
                      <Link
                        href={`/${lang}/auth/login`}
                        data-testid="header-mobile-sign-in"
                        className="flex items-center gap-1.5 mx-3 my-1 px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold justify-center"
                      >
                        <Icon name="user" className="w-3.5 h-3.5" />
                        <span>{navDict.sign_in || 'Sign In'}</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
