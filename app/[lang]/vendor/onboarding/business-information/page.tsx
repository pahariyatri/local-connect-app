"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import Input from "@/app/[lang]/components/atoms/Input";
import Button from "@/app/[lang]/components/atoms/Button";
import Typography from "@/app/[lang]/components/atoms/Typography";
import Select from "@/app/[lang]/components/atoms/Select";
import Form from "@/app/[lang]/components/molecules/Form";
import Loading from "@/app/loading";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

export default function BusinessDetails() {
  const router = useRouter();
  const { lang, dict, loading } = useLocalizationContext();

  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    subcategory: "",
    ownershipType: "",
  });

  if (loading || !dict) return <Loading />;

  const biz = dict.page.vendor_onboarding.business;

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/${lang}/vendor/onboarding/business-location`);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <header className="mb-10">
        <Typography variant="h2" className="text-2xl font-black text-slate-900 mb-1 uppercase italic tracking-tighter">
            {biz.title}
        </Typography>
        <p className="text-slate-400 font-medium text-[11px] uppercase tracking-widest leading-relaxed">
            {biz.subtitle}
        </p>
      </header>

      <Form onSubmit={handleNext} className="space-y-6">
        <div className="space-y-6">
            <Input
              label={biz.fields.name}
              name="businessName"
              className="h-14 rounded-2xl"
              placeholder="e.g. Manali Treks & Trails"
              value={formData.businessName}
              onChange={(e) => handleInputChange("businessName", e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label={biz.fields.category}
                  name="category"
                  options={["Trekking", "Stay", "Adventure", "Transport"]}
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                />
                <Select
                  label={biz.fields.subcategory}
                  name="subcategory"
                  options={["Nature", "Culture", "High-Altitude", "Family"]}
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange("subcategory", e.target.value)}
                />
            </div>
            
            <Input
              label={biz.fields.ownership}
              name="ownershipType"
              className="h-14 rounded-2xl"
              placeholder="e.g. Proprietorship, Pvt Ltd"
              value={formData.ownershipType}
              onChange={(e) => handleInputChange("ownershipType", e.target.value)}
            />
        </div>

        <div className="pt-6">
          <Button type="submit" className="w-full h-14 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] italic shadow-xl active:scale-95 transition-all">
            {biz.cta}
          </Button>
        </div>
      </Form>
    </div>
  );
}
