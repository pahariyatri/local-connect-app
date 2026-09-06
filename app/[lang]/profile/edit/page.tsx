"use client";

import Button from "@/app/[lang]/components/atoms/Button";
import Input from "@/app/[lang]/components/atoms/Input";
import Typography from "@/app/[lang]/components/atoms/Typography";
import React, { useState, useEffect } from "react";
import { sanitizePhone, isValidPhone, PHONE_LENGTH, toNationalDigits } from "@/utils/validation";
import { fetchCurrentUser, updateUser } from "@/services/userService";

interface ProfileForm {
    name: string;
    email: string;
    phone: string;
}

const EMPTY_FORM: ProfileForm = { name: "", email: "", phone: "" };

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProfileForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    // Load the real, authenticated user.
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const u: any = await fetchCurrentUser();
                if (!active) return;
                setUserId(u.id ?? null);
                setFormData({
                    name: u.name || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
                    email: u.email ?? "",
                    phone: toNationalDigits(u.phone ?? ""),
                });
            } catch {
                // Not logged in (or API down) — keep the form usable; Save will prompt to log in.
                if (active) setStatus({ type: "error", msg: "Sign in to load and save your profile." });
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name === "phone" ? sanitizePhone(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!userId) {
            setStatus({ type: "error", msg: "Please sign in to save your profile." });
            return;
        }

        // Split the single "name" field into first/last for the backend.
        const parts = formData.name.trim().split(/\s+/);
        const firstName = parts.shift() || "";
        const lastName = parts.join(" ");

        setSaving(true);
        try {
            await updateUser(userId, {
                firstName,
                lastName,
                email: formData.email || null,
                phone: formData.phone,
            } as any);
            setStatus({ type: "success", msg: "Profile saved successfully." });
        } catch {
            setStatus({ type: "error", msg: "Couldn't save your profile. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
                <p className="ml-4 text-emerald-600 text-lg font-medium">Loading profile…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 sm:pt-32 pb-12 px-4">
            <div className="max-w-xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100">
                <div className="px-6 pt-8 pb-4 text-center border-b border-slate-100">
                    <Typography variant="h2" className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                        Edit Account Details
                    </Typography>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                        Update your verified contact and identification info stored in our secure database.
                    </p>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                    <div>
                        <Typography variant="h3" className="text-xs font-black uppercase text-slate-400 tracking-wider">
                            Full Name
                        </Typography>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="mt-1.5"
                        />
                    </div>

                    <div>
                        <Typography variant="h3" className="text-xs font-black uppercase text-slate-400 tracking-wider">
                            Email Address
                        </Typography>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email address"
                            className="mt-1.5"
                        />
                    </div>

                    <div>
                        <Typography variant="h3" className="text-xs font-black uppercase text-slate-400 tracking-wider">
                            Mobile Number (10-Digit)
                        </Typography>
                        <Input
                            type="tel"
                            name="phone"
                            inputMode="numeric"
                            maxLength={PHONE_LENGTH}
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter 10-digit mobile number"
                            className="mt-1.5"
                        />
                    </div>

                    {status && (
                        <p className={`text-xs font-bold p-3 rounded-xl ${status.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                            {status.msg}
                        </p>
                    )}

                    {(!formData.name.trim() || !isValidPhone(formData.phone)) && (
                        <p role="alert" className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2.5 rounded-xl">
                            ⚠️ Please enter your name and a valid 10-digit mobile number.
                        </p>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button variant="primary" size="medium" type="submit" disabled={saving || !formData.name.trim() || !isValidPhone(formData.phone)}>
                            {saving ? "Saving…" : "Save Profile"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
