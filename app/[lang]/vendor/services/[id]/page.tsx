export default async function VendorServicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Service Details</h1>
            <p className="mt-4">Service ID: {id}</p>
            <p className="text-gray-600 mt-2">Service details will be loaded here.</p>
        </div>
    );
}
