"use client";

import React from "react";
import { Service } from "./types";
import LocalImage from "../../components/atoms/Image";

type ServiceDetailsModalProps = {
    service: Service | null;
    onClose: () => void;
};

const ServiceDetailsModal = ({ service, onClose }: ServiceDetailsModalProps) => {
    if (!service) return null;

    const basePrice = Array.isArray(service.prices) && service.prices.length > 0
        ? Number(service.prices[0]?.price)
        : 2000;

    const image = service.additionalData?.images?.[0] || "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=800";

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header Image */}
                <div className="relative h-48 sm:h-56 w-full bg-slate-900">
                    <LocalImage
                        src={image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center text-sm font-bold hover:bg-black transition-all"
                        aria-label="Close"
                    >
                        ✕
                    </button>

                    <div className="absolute bottom-4 left-5 right-5 text-white">
                        <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-md tracking-wider">
                            {service.category || "Service"}
                        </span>
                        <h3 className="text-xl font-black tracking-tight mt-1">
                            {service.name}
                        </h3>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-400">Price Rate</span>
                            <p className="text-lg font-black text-slate-900">
                                ₹{Math.round(basePrice).toLocaleString("en-IN")}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase text-slate-400">Capacity</span>
                            <p className="text-xs font-black text-slate-700">
                                👥 {service.capacity || 2} Persons
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Details</h4>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                            {service.description || "Authentic verified mountain service."}
                        </p>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2">
                        <span className="text-emerald-600 font-black text-xs">✓ Status:</span>
                        <span className="text-emerald-800 text-xs font-bold">
                            {service.isAvailable !== false ? "Active & Bookable" : "Unavailable"}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailsModal;
