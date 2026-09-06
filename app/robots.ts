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
                // Internal engineering docs (architecture, state management,
                // component conventions) served on the public frontend for
                // the team, not traveler-facing content.
                '/*/docs',
            ],
        },
        sitemap: `https://app.pahariyatri.com/sitemap.xml`,
        host: 'https://app.pahariyatri.com',
    }
}