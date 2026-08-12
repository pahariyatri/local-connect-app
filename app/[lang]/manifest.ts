import type { MetadataRoute } from 'next';
import { BRAND_CONFIG } from '@/config/brandConfig';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: BRAND_CONFIG.fullProductName,
        short_name: BRAND_CONFIG.compactProductName,
        description: 'Plan stays, transport, food, activities and trusted local services across your complete Himachal route.',
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
