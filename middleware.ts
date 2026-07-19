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

    if (/\.(?:png|jpg|jpeg|svg|webp|ico|json|css|js|txt)(?:\?.*)?$/.test(pathname)) {
        return;
    }

    const locale = getLocale(request);

    // Define protected routes that require authentication
    const protectedRoutes = [`/${locale}/profile`, `/${locale}/dashboard`, `/${locale}/vendor`];

    // Check if the user is trying to access a protected route
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        const token = request.cookies.get('accessToken'); // Check for the access token
        console.log("Middleware Token:", token);

        if (!token) {
            // Redirect to the login page if no token is found
            return NextResponse.redirect(new URL(`/${locale}/auth/send-otp`, request.url));
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