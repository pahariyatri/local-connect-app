import { MetadataRoute } from 'next'

// Must match metadataBase in app/layout.tsx — the live production frontend.
const BASE_URL = 'https://app.pahariyatri.com';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: `${BASE_URL}/en`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            // The core direct-search surface (real inventory, changes as
            // vendors/services are added) — higher priority and crawl
            // frequency than the static marketing pages below it.
            url: `${BASE_URL}/en/explore`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/en/builder`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/en/community`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/en/about`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/en/vendor/onboarding`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/en/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${BASE_URL}/en/terms-conditions`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        // /en/blog omitted — the page has no content yet (see robots.ts,
        // which also disallows it). Add it back once real posts exist.
    ]

    // const siteUrl = siteMetadata.siteUrl

    // const blogRoutes = allBlogs
    //     .filter((post) => !post.draft)
    //     .map((post) => ({
    //         url: `${siteUrl}/${post.path}`,
    //         lastModified: post.lastmod || post.date,
    //     }))

    // const routes = ['', 'blog', 'projects', 'tags'].map((route) => ({
    //     url: `${siteUrl}/${route}`,
    //     lastModified: new Date().toISOString().split('T')[0],
    // }))

    // return [...routes, ...blogRoutes]
}