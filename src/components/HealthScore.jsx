export default function HealthScore({ score, className = '' }) {
  const normalized = Math.max(0, Math.min(100, Number(score) || 0));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;
  const color = normalized >= 80 ? 'text-cyan-400' : normalized >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700/80"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={color}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div>
        <p className={`text-3xl font-bold ${color}`}>{Math.round(normalized)}</p>
        <p className="text-slate-400 text-sm">Health score</p>
      </div>
    </div>
  );
}
