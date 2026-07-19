"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/[lang]/components/atoms/Button";
import Typography from "@/app/[lang]/components/atoms/Typography";
import Form from "@/app/[lang]/components/molecules/Form";

export default function VendorAgreement() {
    const router = useRouter();
    const [agree, setAgree] = useState(false);

    const handleAgreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgree(e.target.checked);
    };

    const handleFinish = (e: React.FormEvent) => {
        e.preventDefault();
        if (agree) {
            // Submit the form or redirect to the vendor dashboard
            router.push("/vendor/onboarding/confirmation");
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6 px-4 sm:px-8">
            <Typography variant="h1" className="text-gray-600">
                Vendor Agreement
            </Typography>
            <Form onSubmit={handleFinish}>
                <div className="space-y-4">
                    <Typography variant="p">
                        By clicking &quot;I agree,&quot; you acknowledge and agree to the terms of this vendor agreement, which includes providing accurate service details, ensuring the quality of your offerings, and adhering to local regulations. You also agree to handle customer interactions professionally and maintain the integrity of our platform.
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
                            I agree to the vendor agreement
                        </label>
                    </div>
                </div>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={!agree}
                >
                    Finish
                </Button>
            </Form>
        </div>
    );
}
