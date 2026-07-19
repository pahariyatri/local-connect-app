import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

// Supported destinations and their canonical activity slugs
const DESTINATION_MAP: Record<string, { display: string; state: string }> = {
  manali: { display: 'Manali', state: 'Himachal Pradesh' },
  kullu: { display: 'Kullu', state: 'Himachal Pradesh' },
  kasol: { display: 'Kasol', state: 'Himachal Pradesh' },
  shimla: { display: 'Shimla', state: 'Himachal Pradesh' },
  dharamshala: { display: 'Dharamshala', state: 'Himachal Pradesh' },
  spiti: { display: 'Spiti Valley', state: 'Himachal Pradesh' },
  goa: { display: 'Goa', state: 'Goa' },
  rishikesh: { display: 'Rishikesh', state: 'Uttarakhand' },
  kedarnath: { display: 'Kedarnath', state: 'Uttarakhand' },
};

const ACTIVITY_MAP: Record<string, { display: string; category: string; keyword: string }> = {
  rafting: { display: 'River Rafting', category: 'Activities', keyword: 'rafting' },
  paragliding: { display: 'Paragliding', category: 'Activities', keyword: 'paragliding' },
  camping: { display: 'Camping', category: 'Activities', keyword: 'camping' },
  trekking: { display: 'Trekking', category: 'Activities', keyword: 'trekking' },
  'bike-rental': { display: 'Bike Rental', category: 'Transportation', keyword: 'bike rental' },
  'taxi': { display: 'Taxi & Cab', category: 'Transportation', keyword: 'taxi' },
  'local-guide': { display: 'Local Guide', category: 'Activities', keyword: 'local guide' },
  homestay: { display: 'Homestay', category: 'Accommodation', keyword: 'homestay' },
  hotel: { display: 'Hotel', category: 'Accommodation', keyword: 'hotel' },
  restaurants: { display: 'Restaurants', category: 'Food & Dining', keyword: 'restaurants' },
};

interface PageProps {
  params: { lang: string; destination: string; activity: string };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const dest = DESTINATION_MAP[params.destination];
  const act = ACTIVITY_MAP[params.activity];
  if (!dest || !act) return {};

  const title = `${act.display} in ${dest.display} | Book Instantly | Local Connect`;
  const description =
    `Find and book verified ${act.keyword} in ${dest.display}, ${dest.state}. ` +
    `Instant booking, transparent prices, local experts. No advance planning needed.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `https://localconnect.in/${params.lang}/explore/${params.destination}/${params.activity}`,
    },
  };
}

// Fetch services server-side for SEO
async function fetchServices(destination: string, category: string) {
  try {
    const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000') + '/api/v1';
    const params = new URLSearchParams({
      destinations: JSON.stringify([destination]),
      categories: JSON.stringify([category]),
    });
    const res = await fetch(`${API_BASE}/service/discover?${params}`, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.services || data?.services || [];
  } catch {
    return [];
  }
}

export default async function DestinationActivityPage({ params }: PageProps) {
  const dest = DESTINATION_MAP[params.destination];
  const act = ACTIVITY_MAP[params.activity];

  if (!dest || !act) notFound();

  const services = await fetchServices(dest.display, act.category);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: `${act.display} in ${dest.display}`,
    description: `Book verified ${act.keyword} in ${dest.display}, ${dest.state}`,
    touristType: ['Adventure', 'Nature'],
    geo: { '@type': 'GeoCoordinates' },
    areaServed: dest.display,
    offers: services.slice(0, 5).map((s: any) => ({
      '@type': 'Offer',
      name: s.name,
      price: s.prices?.[0]?.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    })),
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-slate-900 text-white px-6 pt-24 pb-16">
          <div className="max-w-2xl mx-auto">
            <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">
              {dest.state}
            </p>
            <h1 className="text-4xl font-black tracking-tight leading-tight mb-4">
              {act.display} in {dest.display}
            </h1>
            <p className="text-slate-300 text-base font-medium mb-8">
              Verified local {act.keyword.toLowerCase()} operators. Transparent prices. Instant booking.
              No advance planning or travel agents needed.
            </p>
            <a
              href={`/${params.lang}/builder`}
              className="inline-flex items-center gap-2 h-14 px-8 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
            >
              Plan My Trip
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </section>

        {/* Services Grid */}
        <section className="max-w-2xl mx-auto px-6 py-12">
          <h2 className="text-xl font-black text-slate-900 mb-6">
            {services.length > 0 ? `${services.length} Options Available` : 'Available Services'}
          </h2>

          {services.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 font-medium mb-6">
                More {act.display} listings coming soon for {dest.display}.
              </p>
              <a
                href={`/${params.lang}/builder`}
                className="inline-flex items-center gap-2 h-12 px-6 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl"
              >
                Plan Your Trip Instead
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service: any) => (
                <div
                  key={service.id}
                  className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-black text-slate-900 mb-1">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-3">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        {service.rating && (
                          <span className="text-xs font-black text-emerald-600">
                            ★ {service.rating}
                          </span>
                        )}
                        {service.prices?.[0]?.price && (
                          <span className="text-xs font-black text-slate-700">
                            from ₹{Number(service.prices[0].price).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={`/${params.lang}/builder`}
                      className="flex-shrink-0 h-10 px-4 bg-emerald-500 text-white font-black text-xs uppercase tracking-wide rounded-xl flex items-center hover:bg-emerald-400 transition-colors"
                    >
                      Book
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bottom CTA */}
        <section className="px-6 pb-16">
          <div className="max-w-2xl mx-auto bg-slate-900 rounded-3xl p-8 text-white text-center">
            <h2 className="text-xl font-black mb-2">Already in {dest.display}?</h2>
            <p className="text-slate-400 text-sm font-medium mb-6">
              Scan a vendor QR code or plan your full trip in 2 minutes.
            </p>
            <a
              href={`/${params.lang}/builder`}
              className="inline-flex items-center gap-2 h-12 px-8 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-xl"
            >
              Start Planning
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
