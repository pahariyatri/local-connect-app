/**
 * Booking Service — handles the entire booking flow
 * Rule: Never trust frontend price. Backend recalculates everything.
 */
import { api } from '@/lib/apiClient';
import { sessionTracker } from './sessionService';

export const createBooking = async (bookingData: {
  packageId: number;
  userId?: string;
  travelDate: string;
  guestCount: number;
}) => {

  // Track booking started
  sessionTracker.track('booking_started', {
    entityType: 'trip',
    entityId: String(bookingData.packageId),
    metadata: {
      travelDate: bookingData.travelDate,
      guestCount: bookingData.guestCount,
    },
  });

  const raw = await api.post('/booking', bookingData);
  // Unwrap standardized API envelope { data: { bookingId, orderId, ... } }
  const result = (raw as any)?.data ?? raw;

  // Track booking completed
  if (result?.bookingId) {
    sessionTracker.track('booking_completed', {
      entityType: 'booking',
      entityId: String(result.bookingId),
      metadata: { amount: result.amount, currency: result.currency },
    });
  }

  // Invalidate cached data
  api.invalidateCache('/booking');

  return result;
};

export const getBooking = async (bookingId: string) => {
  const raw = await api.get(`/booking/${bookingId}`);
  return (raw as any)?.data ?? raw;
};

export const cancelBooking = async (bookingId: string) => {
  return api.post(`/booking/${bookingId}/cancel`);
};

export const getUserBookings = async () => {
  return api.get('/booking', { skipCache: true });
};

export interface VendorBookingsQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export interface VendorBookingsResult {
  bookings: any[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * A vendor's bookings — backs the vendor profile/dashboard booking list.
 * See `GET /api/v1/booking/vendor/:vendorId` (backend/src/feature/booking).
 */
export const getVendorBookings = async (
  vendorId: string,
  query: VendorBookingsQuery = {},
): Promise<VendorBookingsResult> => {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();

  const raw = await api.get(`/booking/vendor/${vendorId}${qs ? `?${qs}` : ''}`);
  const result = (raw as any)?.data ?? raw;

  return {
    bookings: Array.isArray(result?.data) ? result.data : [],
    total: result?.total ?? 0,
    page: result?.page ?? 1,
    limit: result?.limit ?? 20,
    pages: result?.pages ?? 0,
  };
};
