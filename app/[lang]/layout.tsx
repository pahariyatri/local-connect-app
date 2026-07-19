"use client";

import { useLocalizationContext } from "@/contexts/LocalizationContext";
import TopNavigation from "./components/organisms/TopNavigation";
import BottomNavigation from "./components/organisms/BottomNavigation";

export default function LangLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { switchLanguage } = useLocalizationContext();

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <TopNavigation onToggleLanguage={(l) => switchLanguage(l as any)} />
      <div className="page-fade-in">
        {children}
      </div>
      <BottomNavigation onToggleLanguage={(l) => switchLanguage(l as any)} />
    </div>
  );
}