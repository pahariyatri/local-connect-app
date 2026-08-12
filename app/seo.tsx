import { Metadata } from 'next';
import { BRAND_CONFIG } from '@/config/brandConfig';

interface PageSEOProps {
    title: string;
    description?: string;
    image?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

const defaultSEO = {
    title: `${BRAND_CONFIG.productDisplayName} by ${BRAND_CONFIG.parentBrandName}`,
    description: 'Build your whole Himachal journey — stays, transport, food, activities and trusted local services.',
};

export async function genPageMetadata({
    title,
    description,
    image,
    ...rest
}: PageSEOProps): Promise<Metadata> {
    return {
        title: `${title} | ${BRAND_CONFIG.compactProductName}`,
        description: description || defaultSEO.description,
        openGraph: {
            title: `${title} | ${BRAND_CONFIG.compactProductName}`,
            description: description || defaultSEO.description,
            url: './',
            siteName: BRAND_CONFIG.fullProductName,
            images: [
                image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200',
            ],
            locale: 'en-US',
            type: 'website',
        },
        twitter: {
            title: `${title} | ${BRAND_CONFIG.compactProductName}`,
            card: 'summary_large_image',
            images: [
                image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200',
            ],
        },
        ...rest,
    };
}
