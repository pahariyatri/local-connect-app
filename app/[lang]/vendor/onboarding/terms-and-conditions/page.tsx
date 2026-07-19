"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/[lang]/components/atoms/Button";
import Typography from "@/app/[lang]/components/atoms/Typography";
import Form from "@/app/[lang]/components/molecules/Form";

export default function TermsAndConditions() {
    const router = useRouter();
    const [agree, setAgree] = useState(false);

    const handleAgreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgree(e.target.checked);
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (agree) {
            router.push("/vendor/onboarding/vendor-agreement");
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6 px-4 sm:px-8">
            <Typography variant="h1" className="text-gray-600">
                Terms and Conditions
            </Typography>
            <Form onSubmit={handleNext}>
                <div className="space-y-4">
                    <Typography variant="p">
                    By proceeding, you agree to abide by the platform&apos;s terms and conditions. This includes providing accurate business and service details, adhering to local regulations, and maintaining professionalism in all interactions with customers. You also agree to resolve disputes in good faith and follow our refund and cancellation policies.
                    </Typography>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="agree"
                            checked={agree}
                            onChange={handleAgreeChange}
                            className="mr-2"
                        />
                        <label htmlFor="agree" className="text-sm text-gray-600">
                            I agree to the terms and conditions
                        </label>
                    </div>
                </div>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={!agree}
                >
                    Next
                </Button>
            </Form>
        </div>
    );
}
