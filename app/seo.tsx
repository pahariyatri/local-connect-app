import { Metadata } from 'next';

interface PageSEOProps {
    title: string;
    description?: string;
    image?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

const defaultSEO = {
    title: 'LocalConnect',
    description: 'Connecting travelers with local vendors seamlessly.',
};

export async function genPageMetadata({
    title,
    description,
    image,
    ...rest
}: PageSEOProps): Promise<Metadata> {
    return {
        title,
        description: description || defaultSEO.description,
        openGraph: {
            title: `${title} | ${defaultSEO.title}`,
            description: description || defaultSEO.description,
            url: './',
            siteName: defaultSEO.title,
            images: [
                image || 'https://i.pinimg.com/736x/63/27/9d/63279d93bdd63862256bb4c7e500e10b.jpg',
            ],
            locale: 'en-US',
            type: 'website',
        },
        twitter: {
            title: `${title} | ${defaultSEO.title}`,
            card: 'summary_large_image',
            images: [
                image || 'https://i.pinimg.com/736x/63/27/9d/63279d93bdd63862256bb4c7e500e10b.jpg',
            ],
        },
        ...rest,
    };
}
