"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getMyNotifications, markNotificationRead, type InAppNotification } from "@/services/notificationService";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function NotificationsPage() {
  const router = useRouter();
  const { user, authStatus } = useAuth();
  const [items, setItems] = useState<InAppNotification[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (authStatus === "hydrating") return;
    if (!user) {
      router.replace(`/auth/login?redirectTo=${encodeURIComponent("/notifications")}`);
      return;
    }
    getMyNotifications()
      .then((r) => setItems(r.items))
      .catch(() => setError(true));
  }, [user, authStatus, router]);

  const open = async (n: InAppNotification) => {
    if (!n.readAt) {
      setItems((cur) => cur?.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)) ?? cur);
      markNotificationRead(n.id).then(() => window.dispatchEvent(new Event("py:notifications-changed"))).catch(() => undefined);
    }
    if (n.bookingId) router.push(n.recipientVendorId ? "/vendor/bookings" : `/bookings/${n.bookingId}`);
  };

  return (
    <main className="max-w-xl mx-auto px-4 pt-24 pb-32">
      <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
      {error ? (
        <p className="mt-6 text-sm text-slate-500" role="alert">Couldn&apos;t load notifications. Please try again.</p>
      ) : items === null ? (
        <p className="mt-6 text-sm text-slate-500" role="status">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-6 text-sm text-slate-500">
          <p>No notifications yet. Booking requests, confirmations and refunds will show up here.</p>
          <Link href="/explore" className="mt-3 inline-block font-bold text-emerald-700 underline underline-offset-4">Explore listings</Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100" data-testid="notifications-list">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => open(n)}
                className="w-full text-left py-4 flex gap-3 min-h-[56px]"
                data-testid="notification-item"
                data-kind={n.kind}
              >
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.readAt ? "bg-transparent" : "bg-emerald-600"}`} aria-hidden="true" />
                <span className="min-w-0">
                  <span className={`block text-sm ${n.readAt ? "font-semibold text-slate-700" : "font-black text-slate-900"}`}>{n.title}</span>
                  <span className="block text-sm text-slate-500 mt-0.5">{n.body}</span>
                  <span className="block text-xs text-slate-400 mt-1">{when(n.createdAt)}{n.readAt ? "" : " · unread"}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
