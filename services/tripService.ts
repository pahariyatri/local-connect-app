/**
 * Trip Service — a traveler's saved journeys (drafts and booked).
 * See backend/src/feature/trip (GET/POST/PUT/DELETE /v1/trips).
 */
import { api } from '@/lib/apiClient';

export interface SaveTripData {
  name: string;
  description?: string;
  serviceIds?: number[];
  totalPrice?: number;
  startDate: string;
  endDate: string;
}

export type TripStatus = 'draft' | 'booked';

export interface Trip {
  id: number;
  name: string;
  description: string;
  totalPrice: string | number;
  startDate: string;
  endDate: string;
  status: TripStatus;
  services: any[];
  bookings: any[];
  createdAt: string;
  updatedAt: string;
}

/** Save the traveler's current plan as a draft trip. */
export const saveDraftTrip = async (data: SaveTripData): Promise<Trip> => {
  const raw = await api.post('/trips', data);
  api.invalidateCache('/trips/mine');
  return (raw as any)?.data ?? raw;
};

/** All of the logged-in traveler's trips — drafts and booked, newest first. */
export const getMyTrips = async (): Promise<Trip[]> => {
  const raw = await api.get('/trips/mine', { skipCache: true });
  const result = (raw as any)?.data ?? raw;
  return Array.isArray(result) ? result : [];
};

export const updateTrip = async (id: number, data: Partial<SaveTripData>): Promise<Trip> => {
  const raw = await api.put(`/trips/${id}`, data);
  api.invalidateCache('/trips/mine');
  return (raw as any)?.data ?? raw;
};

export const deleteTrip = async (id: number): Promise<void> => {
  await api.delete(`/trips/${id}`);
  api.invalidateCache('/trips/mine');
};
