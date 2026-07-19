"use client";

import { ReactNode } from "react";
import TopNavigation from "../components/organisms/TopNavigation";
import { useRouter } from "next/navigation";

export default function BookingLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <div className="">
      <TopNavigation
        title="Bookings"
        leftButton={{ label: "Home", onClick: () => router.push("/") }}
      />
      <main className="">{children}</main>
    </div>
  );
}
