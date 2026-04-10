import { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const EQUIPMENT_OPTIONS = [
  { id: 'dry_van',   emoji: '🚛', label_es: 'Dry Van',   label_en: 'Dry Van'   },
  { id: 'reefer',    emoji: '❄️', label_es: 'Reefer',    label_en: 'Reefer'    },
  { id: 'flatbed',   emoji: '🏗️', label_es: 'Flatbed',   label_en: 'Flatbed'   },
  { id: 'tanker',    emoji: '🛢️', label_es: 'Tanker',    label_en: 'Tanker'    },
  { id: 'step_deck', emoji: '⬇️', label_es: 'Step Deck', label_en: 'Step Deck' },
  { id: 'other',     emoji: '🚚', label_es: 'Otro',      label_en: 'Other'     },
];

const AVATAR_COLORS = [
  '#1d4ed8', '#7c3aed', '#b45309', '#065f46', '#9f1239',
  '#c026d3', '#ea580c', '#db2777', '#0891b2', '#4f46e5',
  '#059669', '#dc2626', '#d97706', '#0284c7', '#166534',
  '#be185d', '#78350f', '#0f766e',
];

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export default function EditProfileSheet({ onClose }) {
  const { currentUser, updateProfile, language } = useAuth();
  const [name, setName]           = useState(currentUser.display_name);
  const [bio, setBio]             = useState(currentUser.bio || '');
  const [equipment, setEquipment] = useState(currentUser.equipment_type);
  const [color, setColor]         = useState(currentUser.avatar_color);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || null);
  const [saving, setSaving]       = useState(false);
  const fileRef = useRef();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    setTimeout(() => {
      updateProfile({
        display_name: name.trim(),
        bio: bio.trim(),
        equipment_type: equipment,
        avatar_color: color,
        avatar_url: avatarUrl || null,
        avatar_initials: initials(name),
      });
      setSaving(false);
      onClose();
    }, 300);
  };

  const previewInitials = name.trim() ? initials(name) : currentUser.avatar_initials;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl pb-safe max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 btn-press">
            <X size={20} />
          </button>
          <span className="font-bold text-base text-gray-900">
            {language === 'es' ? 'Editar perfil' : 'Edit profile'}
          </span>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className={`font-bold px-4 py-1.5 rounded-full text-sm transition-all btn-press ${
              name.trim() ? 'bg-[#0F1A2E] text-white' : 'bg-gray-100 text-gray-300'
            }`}
          >
            {saving ? '...' : (language === 'es' ? 'Guardar' : 'Save')}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-5 space-y-6">

          {/* Avatar preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold shadow-md"
                style={{ backgroundColor: color }}
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  : previewInitials
                }
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0.5 right-0.5 w-8 h-8 bg-[#0F1A2E] rounded-full flex items-center justify-center shadow-md btn-press"
              >
                <Camera size={15} className="text-white" />
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div className="flex gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="text-sm text-blue-600 font-semibold"
              >
                {language === 'es' ? 'Subir foto' : 'Upload photo'}
              </button>
              {avatarUrl && (
                <>
                  <span className="text-gray-300">·</span>
                  <button
                    onClick={() => setAvatarUrl(null)}
                    className="text-sm text-red-500 font-medium"
                  >
                    {language === 'es' ? 'Quitar foto' : 'Remove photo'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Avatar color (hidden when photo is set) */}
          {!avatarUrl && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {language === 'es' ? 'Color del avatar' : 'Avatar color'}
              </p>
              <div className="flex flex-wrap gap-3">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-9 h-9 rounded-full btn-press transition-transform"
                    style={{
                      backgroundColor: c,
                      outline: color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: '3px',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
              {language === 'es' ? 'Nombre' : 'Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
              className="w-full px-3.5 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder={language === 'es'
                ? 'Cuéntale a la red quién eres...'
                : 'Tell the network who you are...'}
              className="w-full px-3.5 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/160</p>
          </div>

          {/* Equipment type */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
              {language === 'es' ? 'Tipo de equipo' : 'Equipment type'}
            </p>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setEquipment(opt.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all btn-press ${
                    equipment === opt.id
                      ? 'bg-[#0F1A2E] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{language === 'es' ? opt.label_es : opt.label_en}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
