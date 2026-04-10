import { useEffect, useRef } from 'react';

export default function OptionsMenu({ items, onClose }) {
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
      className="absolute top-8 right-0 z-50 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden min-w-[160px] fade-in"
      onClick={e => e.stopPropagation()}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 ${
            item.danger ? 'text-red-600' : 'text-gray-800'
          } ${i < items.length - 1 ? 'border-b border-gray-100' : ''}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
