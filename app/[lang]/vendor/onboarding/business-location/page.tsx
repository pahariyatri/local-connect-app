"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "@/app/[lang]/components/atoms/Input";
import Button from "@/app/[lang]/components/atoms/Button";
import Typography from "@/app/[lang]/components/atoms/Typography";
import Form from "@/app/[lang]/components/molecules/Form";
import Loading from "@/app/loading";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

export default function BusinessAddress() {
    const router = useRouter();
    const { lang, dict, loading } = useLocalizationContext();
    
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    if (loading || !dict) return <Loading />;

    const res = dict.page.vendor_onboarding.address;

    const handleInputChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/${lang}/vendor/onboarding/documentation`);
    };

    return (
    <div className="space-y-4">
      <header className="mb-10">
        <Typography variant="h2" className="text-2xl font-black text-slate-900 mb-1 uppercase italic tracking-tighter">{res.title}</Typography>
        <p className="text-slate-400 font-medium text-[11px] uppercase tracking-widest leading-relaxed">{res.subtitle}</p>
      </header>

      <Form onSubmit={handleNext} className="space-y-6">
        <div className="space-y-4">
            <Input
              label={res.fields.address}
              name="address"
              className="h-14 rounded-2xl"
              placeholder={res.placeholders.address}
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                  label={res.fields.city}
                  name="city"
                  className="h-14 rounded-2xl"
                  placeholder={res.placeholders.city}
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
                <Input
                  label={res.fields.state}
                  name="state"
                  className="h-14 rounded-2xl"
                  placeholder={res.placeholders.state}
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
            </div>
            
            <Input
              label={res.fields.pincode}
              name="pincode"
              className="h-14 rounded-2xl"
              placeholder={res.placeholders.pincode}
              value={formData.pincode}
              onChange={(e) => handleInputChange("pincode", e.target.value)}
            />
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
