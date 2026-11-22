"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getMyNotifications } from "@/services/notificationService";

/** Header bell with the real unread count from GET /notifications/me. Renders nothing on error. */
export default function NotificationBell() {
  const pathname = usePathname();
  const [unread, setUnread] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getMyNotifications()
        .then((r) => { if (!cancelled) setUnread(r.unread); })
        .catch(() => { if (!cancelled) setUnread(null); });
    load();
    const t = setInterval(load, 60_000);
    window.addEventListener("py:notifications-changed", load);
    return () => { cancelled = true; clearInterval(t); window.removeEventListener("py:notifications-changed", load); };
  }, [pathname]);

  return (
    <Link
      href="/notifications"
      data-testid="header-notifications"
      aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
      className="relative w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-700"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
      {unread ? (
        <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
