"use client";


import { useRouter } from "next/navigation";
import AddEditServiceForm from "../ServiceFormModal";
import { Service } from "../types";

const AddServicePage = () => {

    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleSaveService = (_newService: Service) => {

        router.push("/vendor/services"); // Redirect to service list page after saving
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Add Service</h1>
            <AddEditServiceForm onSave={handleSaveService} onCancel={() => router.push("/vendor/services")} />
        </div>
    );
};

export default AddServicePage;
