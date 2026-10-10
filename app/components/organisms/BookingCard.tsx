export default function BookingCard({
  booking,
}: {
  booking: { id: number; service: string; date: string; status: string };
}) {
  const statusColor =
    booking.status === "Confirmed"
      ? "bg-green-500"
      : booking.status === "Pending"
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="p-4 bg-white shadow rounded flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">{booking.service}</h3>
        <p className="text-slate-600">Date: {booking.date}</p>
      </div>
      <span
        className={`px-3 py-1 text-sm font-semibold text-white rounded ${statusColor}`}
      >
        {booking.status}
      </span>
    </div>
  );
}
