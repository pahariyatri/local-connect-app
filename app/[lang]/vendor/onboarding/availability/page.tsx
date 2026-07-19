"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "@/app/[lang]/components/atoms/Input";
import Button from "@/app/[lang]/components/atoms/Button";
import ProgressBar from "@/app/[lang]/components/organisms/ProgressBar";
import Typography from "@/app/[lang]/components/atoms/Typography";
import Form from "@/app/[lang]/components/molecules/Form";

export default function Availability() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        serviceHours: "",
        seasonalAvailability: "",
        bookingNotice: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        sessionStorage.setItem("vendorOnboardingData", JSON.stringify(formData));
        router.push("/vendor/onboarding/marketing-assets");
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6 px-4 sm:px-8">
            <Typography variant="h1" className="text-gray-600">
                Availability
            </Typography>
            <ProgressBar step={7} totalSteps={10} />
            <Form onSubmit={handleNext}>
                <Input
                    label="Service Hours"
                    name="serviceHours"
                    value={formData.serviceHours}
                    onChange={handleChange}
                    placeholder="Enter your service hours"
                />
                <Input
                    label="Seasonal Availability"
                    name="seasonalAvailability"
                    value={formData.seasonalAvailability}
                    onChange={handleChange}
                    placeholder="Enter your seasonal availability"
                />
                <Input
                    label="Booking Notice Period"
                    name="bookingNotice"
                    value={formData.bookingNotice}
                    onChange={handleChange}
                    placeholder="Enter notice period required for booking"
                />
                <Button type="submit" variant="primary">
                    Next
                </Button>
            </Form>
        </div>
    );
}
