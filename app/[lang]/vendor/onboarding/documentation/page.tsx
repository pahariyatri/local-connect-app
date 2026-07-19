"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/[lang]/components/atoms/Button";
import Typography from "@/app/[lang]/components/atoms/Typography";
import Form from "@/app/[lang]/components/molecules/Form";
import Loading from "@/app/loading";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

export default function Documentation() {
  const router = useRouter();
  const { lang, dict, loading } = useLocalizationContext();

  const [formData, setFormData] = useState({
    identityProof: "",
    businessRegistration: "",
    gstDetails: "",
    licenses: "",
  });

  if (loading || !dict) return <Loading />;

  const res = dict.page.vendor_onboarding.verification;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("vendorOnboardingData", JSON.stringify(formData));
    router.push(`/${lang}/vendor/onboarding/confirmation`);
  };

  return (
    <div className="space-y-4">
      <header className="mb-10">
        <Typography variant="h2" className="text-2xl font-black text-slate-900 mb-1 uppercase italic tracking-tighter">{res.title}</Typography>
        <p className="text-slate-400 font-medium text-[11px] uppercase tracking-widest leading-relaxed">{res.subtitle}</p>
      </header>

      <Form onSubmit={handleNext} className="space-y-6">
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-emerald-200 transition-all">
                    <span className="text-2xl mb-2">🪪</span>
                    <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{res.steps.identity.title}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{res.steps.identity.sub}</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-emerald-200 transition-all">
                    <span className="text-2xl mb-2">📝</span>
                    <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{res.steps.ownership.title}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{res.steps.ownership.sub}</p>
                </div>
            </div>

            <div className="px-6 py-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">{res.trust.title}</span>
                    <span className="text-[8px] font-bold text-emerald-400 uppercase mt-2">{res.trust.subtitle}</span>
                </div>
                <span className="text-emerald-400 animate-pulse">⚡</span>
            </div>
        </div>

        <div className="pt-6">
          <Button type="submit" className="w-full h-14 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] italic shadow-xl active:scale-95 transition-all">
            {res.cta}
          </Button>
        </div>
      </Form>
    </div>
  );
}
