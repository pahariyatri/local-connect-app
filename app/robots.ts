import type { MetadataRoute } from 'next'

// export default function robots(): MetadataRoute.Robots {
//     return {
//         rules: [
//             {
//                 userAgent: 'Googlebot',
//                 allow: ['/'],
//                 disallow: '/private/',
//             },
//             {
//                 userAgent: ['Applebot', 'Bingbot'],
//                 disallow: ['/'],
//             },
//         ],
//         sitemap: 'https://pahariyatri.com/sitemap.xml',
//     }
// }

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/api/og/*'],
            // Private/authenticated surfaces must never be indexed.
            // Locale-prefixed routes (/{lang}/...) are matched by the wildcard.
            disallow: [
                '/*/auth/',
                '/*/profile',
                '/*/admin',
                '/*/bookings',
                '/*/checkout',
                // NOTE: /*/vendor/onboarding is intentionally NOT disallowed
                // — it's the public "Become a Partner" signup page (linked
                // from the footer), the main organic-search entry point for
                // vendor acquisition. Only the authenticated dashboard
                // surfaces below stay blocked.
                '/*/vendor/dashboard',
                '/*/vendor/payouts',
                '/*/vendor/calendar',
                '/*/vendor/contracts',
                '/*/vendor/partnerships',
                '/*/vendor/services',
                '/*/vendor/bookings',
                '/*/journey/view',
                // "My Journeys" — the signed-in user's own trip drafts and
                // bookings, same category of private data as /bookings.
                '/*/journeys',
                // Internal engineering docs (architecture, state management,
                // component conventions) served on the public frontend for
                // the team, not traveler-facing content.
                '/*/docs',
                // Empty stub with no content yet — indexing a blank page
                // wastes crawl budget and reads as thin content. Remove this
                // line once /blog has real posts.
                '/*/blog',
            ],
        },
        sitemap: `https://app.pahariyatri.com/sitemap.xml`,
        host: 'https://app.pahariyatri.com',
    }
}