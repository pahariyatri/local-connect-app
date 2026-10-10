export default function LoyaltyProgress({ points, maxPoints }: { points: number; maxPoints: number }) {
    const percentage = (points / maxPoints) * 100;
  
    return (
      <div className="bg-white shadow rounded p-4">
        <h3 className="text-lg font-bold text-primary">Loyalty Points: {points}/{maxPoints}</h3>
        <div className="mt-2 w-full bg-slate-200 rounded h-4">
          <div className="bg-primary h-4 rounded" style={{ width: `${percentage}%` }}></div>
        </div>
        <p className="mt-2 text-sm text-neutral">Keep booking to unlock rewards!</p>
      </div>
    );
  }
  