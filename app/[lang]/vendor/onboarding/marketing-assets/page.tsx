// /app/[lang]/pages/vendor/onboarding/marketing-assets.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "@/app/[lang]/components/atoms/Input";
import Button from "@/app/[lang]/components/atoms/Button";
import ProgressBar from "@/app/[lang]/components/organisms/ProgressBar";
import Typography from "@/app/[lang]/components/atoms/Typography";
import Form from "@/app/[lang]/components/molecules/Form";

export default function MarketingAssets() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        logo: "",
        images: "",
        promotionalMaterial: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        sessionStorage.setItem("vendorOnboardingData", JSON.stringify(formData));
        router.push("/vendor/onboarding/terms-and-conditions");
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6 px-4 sm:px-8">
            <Typography variant="h1" className="text-gray-600">
                Marketing Assets
            </Typography>
            <ProgressBar step={8} totalSteps={10} />
            <Form onSubmit={handleNext}>
                <Input
                    label="Logo"
                    name="logo"
                    type="file"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder="Upload your business logo"
                />
                <Input
                    label="Images"
                    name="images"
                    type="file"
                    value={formData.images}
                    onChange={handleChange}
                    placeholder="Upload your business images"
                />
                <Input
                    label="Promotional Material"
                    name="promotionalMaterial"
                    type="file"
                    value={formData.promotionalMaterial}
                    onChange={handleChange}
                    placeholder="Upload promotional materials"
                />
                <Button type="submit" variant="primary">
                    Next
                </Button>
            </Form>
        </div>
    );
}
