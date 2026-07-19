"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "@/app/[lang]/components/atoms/Input";
import Button from "@/app/[lang]/components/atoms/Button";
import ProgressBar from "@/app/[lang]/components/organisms/ProgressBar";
import Typography from "@/app/[lang]/components/atoms/Typography";
import Form from "@/app/[lang]/components/molecules/Form";

export default function ServiceDetails() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        serviceOfferings: "",
        servicePricing: "",
        serviceInclusions: "",
        serviceExclusions: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        sessionStorage.setItem("vendorOnboardingData", JSON.stringify(formData));
        router.push("/vendor/onboarding/documentation");
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6 px-4 sm:px-8">
            <Typography variant="h1" className="text-gray-600">
                Service Details
            </Typography>
            <ProgressBar step={4} totalSteps={10} />
            <Form onSubmit={handleNext}>
                <Input
                    label="Service Offerings"
                    name="serviceOfferings"
                    value={formData.serviceOfferings}
                    onChange={handleChange}
                    placeholder="List the services you provide"
                />
                <Input
                    label="Service Pricing"
                    name="servicePricing"
                    value={formData.servicePricing}
                    onChange={handleChange}
                    placeholder="Describe how you price your services"
                />
                <Input
                    label="Service Inclusions"
                    name="serviceInclusions"
                    value={formData.serviceInclusions}
                    onChange={handleChange}
                    placeholder="What is included in the service?"
                />
                <Input
                    label="Service Exclusions"
                    name="serviceExclusions"
                    value={formData.serviceExclusions}
                    onChange={handleChange}
                    placeholder="What is not included in the service?"
                />
                <Button type="submit" variant="primary">
                    Next
                </Button>
            </Form>
        </div>
    );
}
