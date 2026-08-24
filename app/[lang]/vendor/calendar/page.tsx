"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Loading from "@/app/loading";

export default function VendorCalendarRedirect() {
  const router = useRouter();
  const { lang } = useParams();

  useEffect(() => {
    router.replace(`/${lang}/vendor/bookings?view=calendar`);
  }, [router, lang]);

  return <Loading />;
}

