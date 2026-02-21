const styles = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  low: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  info: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
};

export default function SeverityBadge({ severity }) {
  const s = severity in styles ? severity : 'info';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[s]}`}>
      {s}
    </span>
  );
}
