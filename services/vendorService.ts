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
      rating: s.rating || 4.5,
      price: priceVal,
      category: type,
      description: s.description,
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
  return api.get('/vendors', { skipAuth: true });
};

export const getVendorById = async (id: string) => {
  // Track vendor click for popularity ranking
  sessionTracker.track('vendor_clicked', {
    entityType: 'vendor',
    entityId: id,
  });
  return api.get(`/vendors/${id}`, { skipAuth: true });
};

export const createVendor = async (vendorData: any) => {
  const result = await api.post('/vendors', vendorData);
  api.invalidateCache('/vendors');
  return result;
};

export const updateVendor = async (id: string, vendorData: any) => {
  const result = await api.put(`/vendors/${id}`, vendorData);
  api.invalidateCache('/vendors');
  api.invalidateCache(`/vendors/${id}`);
  return result;
};

export const deleteVendor = async (id: string) => {
  const result = await api.delete(`/vendors/${id}`);
  api.invalidateCache('/vendors');
  return result;
};
