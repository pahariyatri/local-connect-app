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
            url: `${BASE_URL}/en/builder`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/en/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/en/about`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        }
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