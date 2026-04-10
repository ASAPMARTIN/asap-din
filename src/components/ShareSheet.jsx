import { useState, useEffect } from 'react';
import { X, Link, MessageCircle, Send, Mail, Music, Twitter, Instagram, Facebook, MessageSquare, Copy } from 'lucide-react';
import { getShareUrl } from '../utils/shareUtils';

// WhatsApp first, largest — that's where this community lives
const SHARE_TARGETS = [
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', emoji: '📱', large: true },
  { id: 'facebook', label: 'Facebook', color: '#1877F2', emoji: '📘', large: true },
  { id: 'telegram', label: 'Telegram', color: '#26A5E4', emoji: '✈️', large: false },
  { id: 'sms', label: 'SMS', color: '#34C759', emoji: '💬', large: false },
  { id: 'messenger', label: 'Messenger', color: '#0084FF', emoji: '🔵', large: false },
  { id: 'tiktok', label: 'TikTok', color: '#010101', emoji: '🎵', large: false },
  { id: 'instagram', label: 'Instagram', color: '#E4405F', emoji: '📸', large: false },
  { id: 'twitter', label: 'X (Twitter)', color: '#000000', emoji: '🐦', large: false },
  { id: 'email', label: 'Email', color: '#6B7280', emoji: '📧', large: false },
  { id: 'copy', label: 'Copiar enlace', color: '#4B5563', emoji: '🔗', large: false },
];

export default function ShareSheet({ isOpen, onClose, type, id, title = 'ASAP-DIN', lang = 'es' }) {
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const url = getShareUrl(type, id);

  const handleShare = (target) => {
    if (target.id === 'copy') {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
    setToast(true);
    setTimeout(() => { setToast(false); onClose(); }, 1500);
  };

  const largeBtns = SHARE_TARGETS.filter(t => t.large);
  const smallBtns = SHARE_TARGETS.filter(t => !t.large);

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full bg-white rounded-t-3xl pb-safe slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
          <div>
            <p className="font-bold text-base text-gray-900">
              {lang === 'es' ? 'Compartir' : 'Share'}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[240px]">{title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 btn-press">
            <X size={20} />
          </button>
        </div>

        {/* Large buttons: WhatsApp + Facebook — community lives here */}
        <div className="flex gap-3 px-5 pt-4 pb-2">
          {largeBtns.map(t => (
            <button
              key={t.id}
              onClick={() => handleShare(t)}
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl btn-press border-2 border-transparent"
              style={{ backgroundColor: t.color + '15', borderColor: t.color + '30' }}
            >
              <span className="text-3xl">{t.emoji}</span>
              <span className="text-sm font-bold" style={{ color: t.color }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Small grid */}
        <div className="grid grid-cols-4 gap-3 px-5 pt-2 pb-5">
          {smallBtns.map(t => (
            <button
              key={t.id}
              onClick={() => handleShare(t)}
              className="flex flex-col items-center gap-1.5 btn-press"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: t.color + '20' }}
              >
                {t.emoji}
              </div>
              <span className="text-xs text-gray-600 font-medium text-center leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg z-50 fade-in flex items-center gap-2">
          <span>✓</span>
          <span>{lang === 'es' ? 'Enlace copiado' : 'Link copied'}</span>
        </div>
      )}
    </div>
  );
}
