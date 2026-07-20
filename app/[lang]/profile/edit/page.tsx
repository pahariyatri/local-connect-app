"use client";

import Button from "@/app/[lang]/components/atoms/Button";
import Input from "@/app/[lang]/components/atoms/Input";
import Textarea from "@/app/[lang]/components/atoms/Textarea";
import Typography from "@/app/[lang]/components/atoms/Typography";
import ImageUploader from "@/app/[lang]/components/molecules/ImageUploader";
import React, { useState, useEffect } from "react";
import { sanitizePhone, PHONE_LENGTH } from "@/utils/validation";
import { fetchCurrentUser, updateUser } from "@/services/userService";

interface ProfileForm {
    name: string;
    location: string;
    email: string;
    phone: string;
    bio: string;
    profilePic: string;
}

const EMPTY_FORM: ProfileForm = { name: "", location: "", email: "", phone: "", bio: "", profilePic: "" };

const DEFAULT_AVATAR =
    "https://images.unsplash.com/photo-1530452540414-c17a65a637fe?q=80&w=800&auto=format&fit=crop";

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
                    location: u.location ?? "",
                    email: u.email ?? "",
                    phone: u.phone ?? "",
                    bio: u.bio ?? "",
                    profilePic: u.profilePic ?? "",
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                bio: formData.bio || null,
                location: formData.location || null,
                profilePic: formData.profilePic || null,
            } as any);
            setStatus({ type: "success", msg: "Profile saved." });
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
                <p className="ml-4 text-emerald-600 text-lg">Loading…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden">
                <div className="flex flex-col items-center py-6">
                    {/* Profile Picture — real upload to object storage (R2) */}
                    <ImageUploader
                        value={formData.profilePic || DEFAULT_AVATAR}
                        onChange={(url) => setFormData((prev) => ({ ...prev, profilePic: url }))}
                        folder="avatars"
                        shape="circle"
                        sizeClassName="h-24 w-24 sm:h-32 sm:w-32"
                        label="Profile picture"
                    />
                    <p className="mt-2 text-xs text-slate-400">Tap the photo to change it</p>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-slate-200 space-y-4">
                    <div>
                        <Typography variant="h3" className="text-slate-900">Name</Typography>
                        <Input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your name" className="mt-2" />
                    </div>

                    <div>
                        <Typography variant="h3" className="text-slate-900">Location</Typography>
                        <Input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Enter your location" className="mt-2" />
                    </div>

                    <div>
                        <Typography variant="h3" className="text-slate-900">Email</Typography>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" className="mt-2" />
                    </div>

                    <div>
                        <Typography variant="h3" className="text-slate-900">Phone</Typography>
                        <Input type="tel" name="phone" inputMode="numeric" maxLength={PHONE_LENGTH} value={formData.phone} onChange={handleInputChange} placeholder="Enter your 10-digit number" className="mt-2" />
                    </div>

                    <div>
                        <Typography variant="h3" className="text-slate-900">Bio</Typography>
                        <Textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us a little about yourself" className="mt-2" />
                    </div>

                    {status && (
                        <p className={`text-sm font-medium ${status.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
                            {status.msg}
                        </p>
                    )}

                    <div className="flex justify-end">
                        <Button variant="primary" size="medium" type="submit" disabled={saving}>
                            {saving ? "Saving…" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
