import { useEffect, useRef } from 'react';

const REACTIONS = [
  { key: 'thumbs', emoji: '👍', label: 'Bueno' },
  { key: 'fire', emoji: '🔥', label: 'Fuego' },
  { key: 'confirmed', emoji: '💯', label: 'Confirmado' },
  { key: 'warning', emoji: '⚠️', label: 'Cuidado' },
  { key: 'frustrated', emoji: '😤', label: 'Frustrado' },
];

export default function ReactionBar({ onReact, onClose, userReaction }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-2xl shadow-lg border border-gray-100 px-2 py-2 flex items-center gap-1 scale-in"
      style={{ animation: 'scaleIn 0.15s ease-out', transformOrigin: 'bottom left' }}
      onClick={e => e.stopPropagation()}
    >
      {REACTIONS.map(({ key, emoji }) => (
        <button
          key={key}
          onClick={(e) => {
            e.stopPropagation();
            onReact(key);
            onClose();
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-xl transition-all btn-press hover:bg-gray-100 ${
            userReaction === key ? 'bg-[#0F1A2E]/10 ring-2 ring-[#0F1A2E]' : ''
          }`}
        >
          <span>{emoji}</span>
        </button>
      ))}
    </div>
  );
}
