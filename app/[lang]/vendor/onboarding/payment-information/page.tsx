"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import Input from "@/app/[lang]/components/atoms/Input";
import Button from "@/app/[lang]/components/atoms/Button";
import Typography from "@/app/[lang]/components/atoms/Typography";
import Form from "@/app/[lang]/components/molecules/Form";

export default function PaymentInformation() {
    const router = useRouter();
    const params = useParams();
    const lang = params.lang || "en";
    const [formData, setFormData] = useState({
        bankAccountName: "",
        bankAccountNumber: "",
        ifscCode: "",
        upiId: "",
    });

    const handleInputChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/${lang}/vendor/onboarding/confirmation`);
    };

    return (
    <div className="space-y-4">
      <header className="mb-10">
        <Typography variant="h2" className="text-2xl font-black text-slate-900 mb-1 uppercase italic tracking-tighter">Payout Setup</Typography>
        <p className="text-slate-400 font-medium text-[11px] uppercase tracking-widest leading-relaxed">Where should we send your earnings?</p>
      </header>

      <Form onSubmit={handleNext} className="space-y-6">
        <div className="space-y-4">
            <Input
              label="Account Holder Name"
              name="bankAccountName"
              autoFocus
              className="h-14 rounded-2xl"
              placeholder="Official Name in Bank"
              value={formData.bankAccountName}
              onChange={(e) => handleInputChange("bankAccountName", e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Account Number"
                  name="bankAccountNumber"
                  className="h-14 rounded-2xl"
                  placeholder="0000 0000 0000"
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                />
                <Input
                  label="IFSC Code"
                  name="ifscCode"
                  className="h-14 rounded-2xl"
                  placeholder="SBIN000XXXX"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                />
            </div>
            
            <Input
              label="UPI ID (Optional)"
              name="upiId"
              className="h-14 rounded-2xl"
              placeholder="username@bank"
              value={formData.upiId}
              onChange={(e) => handleInputChange("upiId", e.target.value)}
            />
        </div>

        <div className="pt-6">
          <Button type="submit" className="w-full h-14 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] italic shadow-xl active:scale-95 transition-all">
            Complete Setup & Launch
          </Button>
        </div>
      </Form>
    </div>
  );
}
