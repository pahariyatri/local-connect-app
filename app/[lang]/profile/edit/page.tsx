"use client";

import Button from "@/app/[lang]/components/atoms/Button";
import Image from "@/app/[lang]/components/atoms/Image";
import Input from "@/app/[lang]/components/atoms/Input";
import Textarea from "@/app/[lang]/components/atoms/Textarea";
import Typography from "@/app/[lang]/components/atoms/Typography";
import React, { useState, useEffect } from "react";
import { sanitizePhone, PHONE_LENGTH } from "@/utils/validation";

export default function EditProfilePage() {
    interface User {
        name: string;
        location: string;
        email: string;
        phone: string;
        bio: string;
        profilePic: string;
    }

    const [user, setUser] = useState<User | null>(null);
    const [profilePic, setProfilePic] = useState(
        "https://images.unsplash.com/photo-1530452540414-c17a65a637fe?q=80&w=1854&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    );
    const [preview, setPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState<User>({
        name: "",
        location: "",
        email: "",
        phone: "",
        bio: "",
        profilePic: "",
    });

    useEffect(() => {
        const fetchUser = async () => {
            const userData: User = {
                name: "Jane Doe",
                location: "San Francisco, CA",
                email: "janedoe@example.com",
                phone: "+1 (123) 456-7890",
                bio: "Lover of unique stays and host of cozy apartments.",
                profilePic:
                    "https://images.unsplash.com/photo-1530452540414-c17a65a637fe?q=80&w=1854&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            };
            setUser(userData);
            setFormData(userData);
            setProfilePic(userData.profilePic);
        };

        fetchUser();
    }, []);

    const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            setFormData({ ...formData, profilePic: objectUrl });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === "phone" ? sanitizePhone(value) : value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle the submit logic here, like sending the updated data to the server
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-blue-500 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="text-center py-6">
                    {/* Profile Picture */}
                    <div className="relative mx-auto h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-gray-200">
                        <Image src={preview || profilePic} alt="Profile" className="h-full w-full object-cover rounded-full" />
                        <label
                            htmlFor="profilePicInput"
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.586 2.586a2 2 0 010 2.828l-2.586 2.586-4.414-4.414 2.586-2.586a2 2 0 012.828 0l1.586 1.586zm-2.586 4l4.414 4.414-2.586 2.586-4.414-4.414 2.586-2.586zm-3 2.414l-2.586 2.586-4.414-4.414 2.586-2.586 4.414 4.414zm2.586 6l-4.414-4.414-2.586 2.586 4.414 4.414 2.586-2.586z" />
                            </svg>
                        </label>
                        <Input
                            type="file"
                            name="profilePic"
                            onChange={handleProfilePicChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-gray-200 space-y-4">
                    {/* Name */}
                    <div>
                        <Typography variant="h3" className="text-slate-900">Name</Typography>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your name"
                            className="mt-2"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <Typography variant="h3" className="text-slate-900">Location</Typography>
                        <Input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Enter your location"
                            className="mt-2"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <Typography variant="h3" className="text-slate-900">Email</Typography>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className="mt-2"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <Typography variant="h3" className="text-slate-900">Phone</Typography>
                        <Input
                            type="tel"
                            name="phone"
                            inputMode="numeric"
                            maxLength={PHONE_LENGTH}
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your 10-digit number"
                            className="mt-2"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <Typography variant="h3" className="text-slate-900">Bio</Typography>
                        <Textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us a little about yourself"
                            className="mt-2"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button variant="primary" size="medium" type="submit">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
