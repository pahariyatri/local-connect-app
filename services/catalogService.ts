/**
 * Trip & Service Catalog Service
 * Heavy caching — these don't change often
 */
import { api } from '@/lib/apiClient';
import { sessionTracker } from './sessionService';

// ═══════════════════ TRIPS ═══════════════════

export const getTrips = async () => {
  return api.get('/trip', { skipAuth: true });
};

export const getTripById = async (id: number | string) => {
  return api.get(`/trip/${id}`, { skipAuth: true });
};

export const createTrip = async (tripData: any) => {
  const result = await api.post('/trip', tripData);
  api.invalidateCache('/trip');
  return result;
};

export const updateTrip = async (id: number, tripData: any) => {
  const result = await api.put(`/trip/${id}`, tripData);
  api.invalidateCache('/trip');
  api.invalidateCache(`/trip/${id}`);
  return result;
};

export const deleteTrip = async (id: number) => {
  const result = await api.delete(`/trip/${id}`);
  api.invalidateCache('/trip');
  return result;
};

// ═══════════════════ SERVICES ═══════════════════

export const getServices = async () => {
  const raw = await api.get('/service', { skipAuth: true });
  return (raw as any)?.data ?? raw;
};

/** A vendor's own services (Control Center / service list). Requires auth + ownership. */
export const getServicesByVendor = async (vendorId: string) => {
  const raw = await api.get(`/service/vendor/${vendorId}`);
  return (raw as any)?.data ?? raw;
};

export const getServiceById = async (id: number | string) => {
  sessionTracker.track('service_viewed', {
    entityType: 'service',
    entityId: String(id),
  });
  const raw = await api.get(`/service/${id}`, { skipAuth: true });
  return (raw as any)?.data ?? raw;
};

export const updateService = async (id: number | string, serviceData: any) => {
  const raw = await api.put(`/service/${id}`, serviceData);
  api.invalidateCache('/service');
  return (raw as any)?.data ?? raw;
};

export const filterServices = async (filters: {
  subcategoryId?: number;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });

  sessionTracker.track('search_performed', {
    metadata: filters,
  });

  return api.get(`/service/filter?${params.toString()}`, { skipAuth: true, skipCache: true });
};

export const createService = async (vendorId: string, serviceData: any) => {
  const result = await api.post(`/service/${vendorId}`, serviceData);
  api.invalidateCache('/service');
  return (result as any)?.data ?? result;
};

// ═══════════════════ CATEGORIES & LOCATIONS ═══════════════════

export const getCategories = async () => {
  const raw = await api.get('/categories', { skipAuth: true });
  return (raw as any)?.data ?? raw;
};

export const getSubcategories = async (categoryId: number | string) => {
  const raw = await api.get(`/categories/${categoryId}/subcategories`, { skipAuth: true });
  return (raw as any)?.data ?? raw;
};

export const getLocations = async (circuit?: string) => {
  const query = circuit ? `?circuit=${encodeURIComponent(circuit)}` : '';
  const raw = await api.get(`/locations${query}`, { skipAuth: true });
  return (raw as any)?.data ?? raw;
};

export const getCircuits = async () => {
  const raw = await api.get('/locations/circuits', { skipAuth: true });
  return (raw as any)?.data ?? raw;
};

/** Typeahead search over the location table — for address/destination autocomplete fields. */
export const searchLocations = async (q: string, limit = 8) => {
  if (!q.trim()) return [];
  const params = new URLSearchParams({ q, limit: String(limit) });
  const raw = await api.get(`/locations/search?${params.toString()}`, { skipAuth: true, skipCache: true });
  return (raw as any)?.data ?? raw ?? [];
};

export interface ServiceQuote {
  serviceId: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  quantity: number;
  guestCount: number;
  nights: number;
}

/**
 * Same pricing engine (room allocation, per-person/per-night/per-trip rules)
 * that computes the real booking total server-side — used here so a
 * pre-submit "Estimated Total" is never a naive client-side guess that can
 * diverge from what the booking is actually created at.
 */
export const getServiceQuote = async (
  serviceId: number | string,
  params: { dateFrom?: string; dateTo?: string; guests?: number },
): Promise<ServiceQuote> => {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.guests) query.set('guests', String(params.guests));
  const raw = await api.get(`/pricing/quote/${serviceId}?${query.toString()}`, { skipAuth: true, skipCache: true });
  return ((raw as any)?.data ?? raw) as ServiceQuote;
};

// ═══════════════════ ITINERARY ═══════════════════

export const generateItinerary = async (packageId: number) => {
  sessionTracker.track('planner_started', {
    entityType: 'trip',
    entityId: String(packageId),
  });

  const result = await api.post(`/itinerary/${packageId}/generate`);

  sessionTracker.track('planner_completed', {
    entityType: 'itinerary',
    metadata: { packageId },
  });

  return result;
};

export const getItinerary = async (id: number | string) => {
  return api.get(`/itinerary/${id}`);
};

export const shareItinerary = async (id: number | string) => {
  sessionTracker.track('share_itinerary', {
    entityType: 'itinerary',
    entityId: String(id),
  });
  return api.post(`/itinerary/${id}/share`);
};
