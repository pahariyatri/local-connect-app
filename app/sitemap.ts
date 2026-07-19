import { MetadataRoute } from 'next'


export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://pahariyatri.com/',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: 'https://pahariyatri.com/package',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://pahariyatri.com/blog',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        {
            url: 'https://pahariyatri.com/about',
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