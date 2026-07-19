export default function ProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="relative w-full bg-slate-200 h-2 rounded overflow-hidden">
      <div
        style={{ width: `${progress}%` }}
        className="absolute top-0 left-0 h-full bg-blue-500"
      ></div>
    </div>
  );
}
