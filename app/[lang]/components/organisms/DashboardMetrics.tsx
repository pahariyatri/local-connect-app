export default function DashboardMetrics({
    label,
    value,
    icon,
  }: {
    label: string;
    value: number;
    icon: string;
  }) {
    return (
      <div className="p-4 bg-white shadow rounded flex items-center">
        <span className="text-3xl">{icon}</span>
        <div className="ml-4">
          <p className="text-lg font-semibold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    );
  }
  