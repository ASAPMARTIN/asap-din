import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function ImageLightbox({ src, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white btn-press"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt="Imagen adjunta"
        className="max-w-full max-h-full object-contain rounded-xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}
