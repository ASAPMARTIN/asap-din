import { QRCodeSVG } from 'qrcode.react';
import VerifiedBadge from './VerifiedBadge';

export default function ProfileQR({ isOpen, onClose, userId, userName, avatarColor, avatarInitials }) {
  if (!isOpen) return null;

  const profileUrl = `https://asap-din.vercel.app/profile/${userId}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Perfil de ${userName}`, url: profileUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(profileUrl).catch(() => {});
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(15,26,46,0.95)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 mx-6 shadow-2xl relative w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-lg btn-press"
        >
          ✕
        </button>

        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 shadow-soft"
            style={{ backgroundColor: avatarColor || '#1d4ed8' }}
          >
            {avatarInitials || '?'}
          </div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold text-gray-900">{userName}</h2>
            <VerifiedBadge size={18} />
          </div>
        </div>

        {/* QR code */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <QRCodeSVG
              value={profileUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
        </div>

        {/* Caption */}
        <p className="text-sm text-gray-500 text-center mb-6">
          Escanea para ver mi perfil
        </p>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="w-full py-3 bg-[#0F1A2E] text-white font-bold rounded-2xl btn-press text-sm"
        >
          Compartir
        </button>
      </div>
    </div>
  );
}
