export default function ScoreBar({ value, label, color = 'emerald', showPercent = true }) {
  // value is 0-1 scale
  const pct = Math.round((value || 0) * 100);
  const barColor = color === 'emerald' ? 'bg-emerald-500' : color === 'red' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{label}</span>
          {showPercent && (
            <span className={`text-sm font-semibold ${pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
              {pct}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
