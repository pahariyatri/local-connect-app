export default function MetricsCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
    return (
      <div className="glass p-5 rounded-[2rem] border border-white/50 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:translate-y-[-2px] active:scale-[0.98]">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner border border-slate-100/50">
          {icon}
        </div>
        <div>
          <p className="text-xl font-black text-slate-900 leading-none mb-1">{value}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
      </div>
    );
}
  