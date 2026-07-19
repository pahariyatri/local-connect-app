"use client";

import React, { useEffect } from "react";

type ModalProps = {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
};

export default function Modal({ children, isOpen, onClose }: ModalProps) {
    // Close the modal when the user presses the ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Modal content */}
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
                <div className="relative p-6">
                    {/* Close button */}
                    <button
                        type="button"
                        className="absolute top-3 right-3 text-slate-500 hover:text-slate-900"
                        aria-label="Close modal"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                    {/* Content passed from parent */}
                    {children}
                </div>
            </div>
        </div>
    );
}
