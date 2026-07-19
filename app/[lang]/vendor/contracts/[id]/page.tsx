"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";

export default function ContractDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Contract Details</h1>
            <p className="mt-4">Contract ID: {id}</p>
            <p className="mt-2">Vendor: Vendor A</p>
            <p className="mt-2">Partner: Partner X</p>
            <p className="mt-2">Status: Active</p>
            <button
                onClick={() => router.back()}
                className="mt-6 bg-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-900 transition-colors"
            >
                Back
            </button>
        </div>
    );
}
