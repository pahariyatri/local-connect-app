"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/atoms/Loading";

export default function VendorCalendarRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/vendor/bookings?view=calendar`);
  }, [router]);

  return <Loading />;
}

