import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Pahari Yatri',
        short_name: 'Pahari Yatri',
        description: 'Build your whole Himachal journey — stays, transport, food, activities and trusted local services.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#007BFF',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
