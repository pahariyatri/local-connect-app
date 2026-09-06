import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { i18n } from "./i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

function getLocale(request: NextRequest): string | undefined {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    const locales = i18n.locales as unknown as string[];
    let languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);
    const locale = matchLocale(languages, locales, i18n.defaultLocale);

    return locale;
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // `html` added (2026-08-30): /offline.html — served by public/sw.js as
    // the fetch-failure fallback for a page navigation — was missing from
    // this bypass list, so it got caught by the locale-redirect logic below
    // and 307'd to the nonexistent /en/offline.html instead of being served
    // directly. A redirect needs a network round-trip, which is exactly
    // what isn't available in the scenario this file exists for.
    if (/\.(?:png|jpg|jpeg|svg|webp|ico|json|css|js|txt|xml|webmanifest|html)(?:\?.*)?$/.test(pathname)) {
        return;
    }

    // SECURITY: route protection must key off the locale actually present in
    // the URL path, never off Accept-Language / getLocale() (header
    // negotiation). Using the negotiated locale here meant a request for
    // /en/admin with `Accept-Language: hi` compared against `/hi/admin` —
    // never matched — and sailed through with no auth check at all.
    const pathLocale = (i18n.locales as unknown as string[]).find(
        (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
    );

    // Define protected routes that require authentication.
    // 'onboarding' is deliberately NOT here — sitemap.ts and robots.ts both
    // already treat /vendor/onboarding as public (anyone can apply without
    // an account first); this used to contradict that by redirecting it to
    // login anyway. Founder decision (2026-09): keep it public.
    const reservedVendorSubroutes = [
        'bookings', 'calendar', 'contracts', 'dashboard', 'partnerships', 'payouts', 'services'
    ];

    const isProtectedVendorRoute = !!pathLocale && pathname.startsWith(`/${pathLocale}/vendor`) && (
        pathname === `/${pathLocale}/vendor` ||
        reservedVendorSubroutes.some(sub => pathname.startsWith(`/${pathLocale}/vendor/${sub}`))
    );

    const isProtected = !!pathLocale && (
                        pathname.startsWith(`/${pathLocale}/profile`) ||
                        pathname.startsWith(`/${pathLocale}/dashboard`) ||
                        pathname.startsWith(`/${pathLocale}/admin`) ||
                        // Payment surfaces — previously robots-disallowed only
                        // (an indexing directive, not access control) with no
                        // server-side check at all.
                        pathname.startsWith(`/${pathLocale}/bookings`) ||
                        pathname.startsWith(`/${pathLocale}/checkout`) ||
                        isProtectedVendorRoute
                        );

    // Check if the user is trying to access a protected route
    if (isProtected) {
        // SECURITY: never log the token — it is a bearer credential.
        const token = request.cookies.get('accessToken');

        if (!token) {
            // Redirect to the login page if no token is found
            const loginUrl = new URL(`/${pathLocale}/auth/login`, request.url);
            loginUrl.searchParams.set("redirectTo", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // The root layout (app/layout.tsx) sits ABOVE the [lang] dynamic segment,
    // so Next.js never passes it a `lang` param — its generateMetadata always
    // saw undefined and fell back to the default locale, which is why every
    // page's canonical/hreflang/OG resolved to /en regardless of the actual
    // URL. [lang]/layout.tsx can't fix this itself (it's a client component,
    // "use client" for usePathname(), so it can't export generateMetadata).
    // Forwarding the real path via a request header lets the root layout's
    // generateMetadata read it with next/headers instead.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    const response = NextResponse.next({ request: { headers: requestHeaders } });

    // Partner Tracking Persistence
    const ref = request.nextUrl.searchParams.get('ref');
    const utmSource = request.nextUrl.searchParams.get('utm_source');
    
    if (ref) {
        response.cookies.set('partner_ref', ref, { path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7 days
    }
    if (utmSource) {
        response.cookies.set('utm_source', utmSource, { path: '/', maxAge: 60 * 60 * 24 * 7 });
    }

    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) =>
            !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );

    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);

        const redirectResponse = NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
                request.url,
            ),
        );
        
        // Ensure cookies are passed to the redirect
        if (ref) redirectResponse.cookies.set('partner_ref', ref, { path: '/', maxAge: 60 * 60 * 24 * 7 });
        if (utmSource) redirectResponse.cookies.set('utm_source', utmSource, { path: '/', maxAge: 60 * 60 * 24 * 7 });
        
        return redirectResponse;
    }

    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], 
};