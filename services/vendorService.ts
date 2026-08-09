/**
 * Vendor Service — profile management and intelligent service discovery
 */
import { api } from '@/lib/apiClient';
import { sessionTracker } from './sessionService';
import type { Vendor } from '@/app/[lang]/results/components/VendorSelectionCard';

export const EMPTY_VENDORS: Record<string, Vendor[]> = {
  Stay: [],
  Taxi: [],
  Adventure: [],
  Meals: [],
};

/**
 * Categorizes raw /service/discover results into the Stay/Taxi/Adventure/Meals
 * buckets the builder and results pages both render.
 */
export function mapServicesToVendors(services: any[]): Record<string, Vendor[]> {
  const categorized: Record<string, Vendor[]> = { stay: [], travel: [], activity: [], food: [] };
  services.forEach((s: any) => {
    // Backend exposes vendor.types as an array (e.g. ["hotel"]); fall back to the
    // legacy singular field / subcategory name for older payloads.
    const vendorType = Array.isArray(s.vendor?.types) && s.vendor.types.length
      ? s.vendor.types[0]
      : (s.vendor?.type ?? s.subcategory?.parent?.name);
    const type = vendorTypeToPreference(vendorType);
    const priceVal = Array.isArray(s.prices) && s.prices.length > 0 ? Number(s.prices[0]?.price) : 1500;
    const mapped: Vendor = {
      id: s.id.toString(),
      name: s.name,
      image: s.image || (s.additionalData?.images?.[0]) || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400",
      // No review/rating system exists on the backend — there is no `s.rating`
      // to ever read. `undefined` here means "not rated", not a fake 4.5.
      rating: s.rating,
      price: priceVal,
      category: type,
      description: s.description,
      city: Array.isArray(s.addresses) && s.addresses.length > 0 ? s.addresses[0]?.city : undefined,
      verified: s.vendor?.verificationStatus === 'VERIFIED',
    };
    if (categorized[type]) categorized[type].push(mapped);
  });
  return {
    Stay: categorized.stay,
    Taxi: categorized.travel,
    Adventure: categorized.activity,
    Meals: categorized.food,
  };
}

export interface DiscoveryParams {
  destinations?: string[];
  categories?: string[];
  travelers?: number;
  startDate?: string;
  endDate?: string;
}

// Maps backend vendor type → frontend preference key used in VendorSelectionCard
export function vendorTypeToPreference(vendorType?: string): 'stay' | 'travel' | 'activity' | 'food' {
  if (!vendorType) return 'stay';
  const t = vendorType.toLowerCase();
  if (t.includes('hotel') || t.includes('homestay') || t.includes('accommodation') || t.includes('stay')) return 'stay';
  if (t.includes('taxi') || t.includes('cab') || t.includes('transport') || t.includes('travel')) return 'travel';
  if (t.includes('food') || t.includes('restaurant') || t.includes('meal') || t.includes('cafe')) return 'food';
  // activity, guide, adventure, rafting, paragliding, etc.
  return 'activity';
}

// Maps vendor category preference → backend service category filter string
const PREF_TO_BACKEND: Record<string, string> = {
  stay: 'Accommodation',
  travel: 'Transportation',
  activity: 'Activities',
  food: 'Food',
};

/**
 * Builds DiscoveryParams from a plan object — handles category mapping and
 * falling back to all categories when no preferences selected.
 */
export function buildDiscoveryParams(opts: {
  destinations: string[];
  servicePreferences: string[];
  guestCount: number;
  startDate?: string;
  endDate?: string;
}): DiscoveryParams {
  const { destinations, servicePreferences, guestCount, startDate, endDate } = opts;

  const categories =
    servicePreferences.length > 0
      ? servicePreferences
          .map((p) => PREF_TO_BACKEND[p])
          .filter(Boolean)
      : undefined; // undefined = all categories

  return {
    destinations,
    categories,
    travelers: guestCount,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };
}

/**
 * Intelligent Service Discovery
 * Matches user intent (where, when, who) with vendor capacities and priority rankings.
 */
export const discoverServices = async (params: DiscoveryParams) => {
  const searchParams = new URLSearchParams();
  
  if (params.destinations) {
    params.destinations.forEach(d => searchParams.append('destinations', d));
  }
  
  if (params.categories) {
    params.categories.forEach(c => searchParams.append('categories', c));
  }

  if (params.travelers && !isNaN(params.travelers)) {
    searchParams.append('travelers', params.travelers.toString());
  }
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);

  return api.get(`/service/discover?${searchParams.toString()}`, { skipAuth: true });
};

export const getVendors = async () => {
  const raw = await api.get('/vendors', { skipAuth: true });
  return (raw as any)?.data ?? raw;
};

/**
 * The vendor the logged-in user created at onboarding, resolved server-side
 * (via their point-of-contact phone), or null if they never onboarded one.
 * Prefer this over the `vendorId` localStorage value where possible — that
 * value only ever gets written once, in the browser session onboarding
 * happened in, and is lost on a new device, a cleared cache, or even just a
 * different browser profile.
 */
export const getMyVendor = async () => {
  const raw = await api.get('/vendors/mine');
  // `data: null` is the valid "no vendor yet" response — `?? raw` would treat
  // that null as "missing" and fall back to the truthy envelope object,
  // making this never actually return null. Use `in` to unwrap correctly.
  return raw && typeof raw === 'object' && 'data' in raw ? (raw as any).data : raw;
};

export const getVendorById = async (id: string) => {
  // Track vendor click for popularity ranking
  sessionTracker.track('vendor_clicked', {
    entityType: 'vendor',
    entityId: id,
  });
  const raw = await api.get(`/vendors/${id}`, { skipAuth: true });
  return (raw as any)?.data ?? raw;
};

/** Every successful backend response is wrapped in `{ success, data, meta }` (see
 * backend/src/shared/interceptors/response/response.interceptor.ts) — unwrap here
 * once so every caller gets the Vendor record itself, not the envelope. */
export const createVendor = async (vendorData: any) => {
  const raw = await api.post('/vendors', vendorData);
  api.invalidateCache('/vendors');
  return (raw as any)?.data ?? raw;
};

export const updateVendor = async (id: string, vendorData: any) => {
  const raw = await api.put(`/vendors/${id}`, vendorData);
  api.invalidateCache('/vendors');
  api.invalidateCache(`/vendors/${id}`);
  return (raw as any)?.data ?? raw;
};

export const deleteVendor = async (id: string) => {
  const raw = await api.delete(`/vendors/${id}`);
  api.invalidateCache('/vendors');
  return (raw as any)?.data ?? raw;
};

/**
 * Vendor's contact person — name/email/phone live on PointOfContact, not
 * Vendor itself (see backend/src/feature/point-of-contact). Call this right
 * after createVendor() with the new vendor's id to persist onboarding's
 * contact fields, which the Vendor endpoint silently drops (whitelist-only
 * validation strips any field CreateVendorDto doesn't declare).
 */
export const createPointOfContact = async (data: { vendorId: string; name: string; email?: string; phone: string }) => {
  const raw = await api.post('/point-of-contact', data);
  return (raw as any)?.data ?? raw;
};
