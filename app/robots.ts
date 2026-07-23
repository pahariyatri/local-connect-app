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
                '/*/vendor/onboarding',
                '/*/vendor/dashboard',
                '/*/vendor/payouts',
                '/*/vendor/calendar',
                '/*/vendor/contracts',
                '/*/vendor/partnerships',
                '/*/vendor/services',
                '/*/vendor/bookings',
                '/*/journey/view',
            ],
        },
        sitemap: `https://pahariyatri.com/sitemap.xml`,
        host: 'https://pahariyatri.com',
    }
}