import { CheckCircle } from 'lucide-react';

export default function VerifiedBadge({ size = 16, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      title="MC verificado por FMCSA"
      aria-label="Verificado"
    >
      <CheckCircle
        size={size}
        className="text-emerald-500 drop-shadow-sm"
        fill="currentColor"
        strokeWidth={0}
      />
    </span>
  );
}
