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
  return api.get('/service', { skipAuth: true });
};

export const getServiceById = async (id: number | string) => {
  sessionTracker.track('service_viewed', {
    entityType: 'service',
    entityId: String(id),
  });
  return api.get(`/service/${id}`, { skipAuth: true });
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
  return result;
};

// ═══════════════════ CATEGORIES ═══════════════════

export const getCategories = async () => {
  return api.get('/categories', { skipAuth: true });
};

export const getSubcategories = async (categoryId: number | string) => {
  return api.get(`/categories/${categoryId}/subcategories`, { skipAuth: true });
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
