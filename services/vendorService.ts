/**
 * Vendor Service — profile management and intelligent service discovery
 */
import { api } from '@/lib/apiClient';
import { sessionTracker } from './sessionService';

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

export const getVendorServices = async (vendorId: string) => {
  return api.get(`/vendors/${vendorId}/services`, { skipAuth: true });
};

export const deleteVendor = async (id: string) => {
  const result = await api.delete(`/vendors/${id}`);
  api.invalidateCache('/vendors');
  return result;
};
