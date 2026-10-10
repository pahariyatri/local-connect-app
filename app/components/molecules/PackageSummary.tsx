type Service = {
    id: number;
    name: string;
    price: number;
  };
  
  type PackageSummaryProps = {
    selectedServices: Service[];
    onRemove: (id: number) => void;
  };
  
  export default function PackageSummary({ selectedServices, onRemove }: PackageSummaryProps) {
    const totalCost = selectedServices.reduce((sum, service) => sum + service.price, 0);
  
    return (
      <div className="bg-slate-100 p-4 rounded shadow">
        <h3 className="text-lg font-bold text-primary">Package Summary</h3>
        {selectedServices.length === 0 ? (
          <p className="text-neutral">No services selected.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {selectedServices.map((service) => (
              <li
                key={`service-${service.id}`}
                className="flex justify-between items-center"
              >
                <span>{service.name}</span>
                <button
                  className="text-error hover:underline"
                  onClick={() => onRemove(service.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-lg font-bold">Total: ${totalCost}</p>
      </div>
    );
  }
  