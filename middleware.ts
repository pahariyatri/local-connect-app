import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

    // Next.js metadata-route conventions (app/opengraph-image.tsx, app/icon.tsx,
    // etc.) are served at extensionless paths like /opengraph-image?<hash> —
    // the extension check above doesn't catch them, so they fell through to
    // the locale-redirect logic and 404'd under /en/opengraph-image instead
    // of resolving directly (og:image/twitter:image tags pointed at a dead URL).
    if (/^\/(opengraph-image|twitter-image|icon|apple-icon)(\d+)?(?:\?.*)?$/.test(pathname)) {
        return;
    }

    // English-only (2026-10-10): the app no longer has locale-prefixed
    // routes. Old links (/en/..., /hi/..., etc.) still circulate in Instagram
    // bios, the content site and shared booking links — permanently redirect
    // them to the unprefixed path, keeping the query string.
    const legacyLocale = pathname.match(/^\/(en|hi|he|de|fr|es)(?=\/|$)/);
    if (legacyLocale) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = pathname.slice(legacyLocale[0].length) || "/";
        return NextResponse.redirect(redirectUrl, 308);
    }

    // Define protected routes that require authentication.
    // 'onboarding' is deliberately NOT here — sitemap.ts and robots.ts both
    // already treat /vendor/onboarding as public (anyone can apply without
    // an account first); this used to contradict that by redirecting it to
    // login anyway. Founder decision (2026-09): keep it public.
    const reservedVendorSubroutes = [
        'bookings', 'calendar', 'contracts', 'dashboard', 'partnerships', 'payouts', 'services'
    ];

    const isProtectedVendorRoute = pathname.startsWith(`/vendor`) && (
        pathname === `/vendor` ||
        reservedVendorSubroutes.some(sub => pathname.startsWith(`/vendor/${sub}`))
    );

    const isProtected = (
                        pathname.startsWith(`/profile`) ||
                        pathname.startsWith(`/dashboard`) ||
                        pathname.startsWith(`/admin`) ||
                        // Payment surfaces — previously robots-disallowed only
                        // (an indexing directive, not access control) with no
                        // server-side check at all.
                        pathname.startsWith(`/bookings`) ||
                        pathname.startsWith(`/checkout`) ||
                        isProtectedVendorRoute
                        );

    // Check if the user is trying to access a protected route
    if (isProtected) {
        // SECURITY: never log the token — it is a bearer credential.
        const token = request.cookies.get('accessToken');

        if (!token) {
            // Redirect to the login page if no token is found
            const loginUrl = new URL(`/auth/login`, request.url);
            loginUrl.searchParams.set("redirectTo", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    const response = NextResponse.next();

    // Partner Tracking Persistence
    const ref = request.nextUrl.searchParams.get('ref');
    const utmSource = request.nextUrl.searchParams.get('utm_source');
    
    if (ref) {
        response.cookies.set('partner_ref', ref, { path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7 days
    }
    if (utmSource) {
        response.cookies.set('utm_source', utmSource, { path: '/', maxAge: 60 * 60 * 24 * 7 });
    }

    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], 
};