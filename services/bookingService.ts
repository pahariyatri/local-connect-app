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
