"use client";

import { Service } from "./types";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";

type ServiceDetailsModalProps = {
    service: Service | null;
    onClose: () => void;

};

const ServiceDetailsModal = ({ service, onClose }: ServiceDetailsModalProps) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full space-y-4">
                <Typography variant="h2" className="text-2xl font-semibold text-center">Service Details</Typography>
                <Typography variant="p" className="text-lg">Name: {service?.name}</Typography>
                <Typography variant="p" className="text-lg">Availability: {service?.availability}</Typography>
                <div className="flex justify-end gap-4">
                    <Button onClick={onClose} className="bg-gray-500 text-white px-6 py-2 rounded-lg">Cancel</Button>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailsModal;
