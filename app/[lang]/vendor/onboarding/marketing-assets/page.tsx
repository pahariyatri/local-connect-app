// /app/[lang]/pages/vendor/onboarding/marketing-assets.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/[lang]/components/atoms/Button";
import ProgressBar from "@/app/[lang]/components/organisms/ProgressBar";
import Typography from "@/app/[lang]/components/atoms/Typography";
import Form from "@/app/[lang]/components/molecules/Form";
import ImageUploader from "@/app/[lang]/components/molecules/ImageUploader";
import MultiImageUploader from "@/app/[lang]/components/molecules/MultiImageUploader";

interface MarketingAssetsForm {
    logo: string;
    images: string[];
    promotionalMaterial: string;
}

export default function MarketingAssets() {
    const router = useRouter();
    const [formData, setFormData] = useState<MarketingAssetsForm>({
        logo: "",
        images: [],
        promotionalMaterial: "",
    });

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        sessionStorage.setItem("vendorOnboardingData", JSON.stringify(formData));
        router.push("/vendor/onboarding/terms-and-conditions");
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6 px-4 sm:px-8">
            <Typography variant="h1" className="text-slate-700">
                Marketing Assets
            </Typography>
            <ProgressBar step={8} totalSteps={10} />
            <Form onSubmit={handleNext}>
                {/* Logo — single image */}
                <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Business Logo</p>
                    <ImageUploader
                        value={formData.logo}
                        onChange={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
                        folder="vendor/logos"
                        shape="square"
                        sizeClassName="h-28 w-28"
                        label="Upload your business logo"
                    />
                </div>

                {/* Business images — multiple */}
                <MultiImageUploader
                    value={formData.images}
                    onChange={(urls) => setFormData((prev) => ({ ...prev, images: urls }))}
                    folder="vendor/gallery"
                    max={8}
                    label="Business Images (up to 8)"
                />

                {/* Promotional material — single image */}
                <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Promotional Material</p>
                    <ImageUploader
                        value={formData.promotionalMaterial}
                        onChange={(url) => setFormData((prev) => ({ ...prev, promotionalMaterial: url }))}
                        folder="vendor/promos"
                        shape="square"
                        sizeClassName="h-28 w-28"
                        label="Upload promotional material"
                    />
                </div>

                <Button type="submit" variant="primary">
                    Next
                </Button>
            </Form>
        </div>
    );
}
