import { api } from '@/lib/apiClient';

export interface InAppNotification {
  id: number;
  kind: string;
  title: string;
  body: string;
  bookingId: number | null;
  readAt: string | null;
  createdAt: string;
  recipientVendorId: string | null;
  externalStatus: string;
}

/** The signed-in user's inbox (own + owned vendor's), newest first. */
export const getMyNotifications = async (): Promise<{ items: InAppNotification[]; unread: number }> => {
  const raw = await api.get('/notifications/me', { skipCache: true });
  const data = (raw as any)?.data ?? raw;
  return { items: Array.isArray(data?.items) ? data.items : [], unread: Number(data?.unread) || 0 };
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.post(`/notifications/${id}/read`);
};
