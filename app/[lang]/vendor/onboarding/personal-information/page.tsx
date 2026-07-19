"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import Input from "@/app/[lang]/components/atoms/Input";
import Button from "@/app/[lang]/components/atoms/Button";
import Typography from "@/app/[lang]/components/atoms/Typography";
import Form from "@/app/[lang]/components/molecules/Form";
import { sanitizePhone, PHONE_LENGTH } from "@/utils/validation";

export default function PersonalInfo() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang || "en";
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("vendorOnboardingData", JSON.stringify(formData));
    router.push(`/${lang}/vendor/onboarding/business-information`);
  };

  return (
    <div className="space-y-4">
      <header className="mb-10">
        <Typography variant="h2" className="text-2xl font-black text-slate-900 mb-1 uppercase italic tracking-tighter">Personal Profile</Typography>
        <p className="text-slate-400 font-medium text-[11px] uppercase tracking-widest leading-relaxed">Let's start with your official credentials.</p>
      </header>

      <Form onSubmit={handleNext} className="space-y-6">
        <div className="space-y-4">
            <Input
              label="Full Legal Name"
              name="fullName"
              autoFocus
              className="h-14 rounded-2xl"
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  className="h-14 rounded-2xl"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <Input
                  label="Mobile Number"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={PHONE_LENGTH}
                  className="h-14 rounded-2xl"
                  placeholder="00000 00000"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", sanitizePhone(e.target.value))}
                />
            </div>
        </div>

        <div className="pt-6">
          <Button type="submit" className="w-full h-14 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] italic shadow-xl active:scale-95 transition-all">
            Continue to Business
          </Button>
        </div>
      </Form>
    </div>
  );
}
