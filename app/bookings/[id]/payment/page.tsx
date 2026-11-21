"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Legacy payment route. It used to run its own Razorpay checkout, which had
 * none of the cancel/verify/recovery handling (docs/payments/payment-flow-contract.md).
 * There is now exactly one payment UI — /checkout — so this only redirects.
 */
export default function LegacyPaymentRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    if (id) router.replace(`/checkout?bookingId=${encodeURIComponent(id)}`);
  }, [id, router]);
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" aria-label="Opening secure checkout" />
    </main>
  );
}
