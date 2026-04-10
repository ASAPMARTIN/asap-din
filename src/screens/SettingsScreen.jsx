import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, Trash2, Bell, Globe, CheckCircle } from 'lucide-react';
import TopBar from '../components/TopBar';
import VerifiedBadge from '../components/VerifiedBadge';
import { useAuth } from '../hooks/useAuth';

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { currentUser, language, notifications, toggleLanguage, updateNotifications, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/invite');
  };

  const handleDeleteAccount = () => {
    // Mock: just log out
    logout();
    navigate('/invite');
  };

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      <TopBar showBack title={language === 'es' ? 'Ajustes' : 'Settings'} />

      <div className="flex-1 overflow-y-auto pb-10">

        {/* Account info */}
        <div className="mt-4 mx-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
            {language === 'es' ? 'Cuenta' : 'Account'}
          </p>
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-4 py-3.5 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">{language === 'es' ? 'Teléfono' : 'Phone'}</p>
              <p className="text-sm font-medium text-gray-900">{currentUser?.phone || '—'}</p>
            </div>
            <div className="px-4 py-3.5">
              <p className="text-xs text-gray-400 mb-0.5">MC Number</p>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-gray-900">MC-{currentUser?.mc_number}</p>
                <VerifiedBadge size={14} />
                <span className="text-xs text-emerald-600 font-medium">
                  {language === 'es' ? 'Verificado' : 'Verified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="mt-4 mx-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
            {language === 'es' ? 'Idioma' : 'Language'}
          </p>
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {language === 'es' ? 'Español / English' : 'Spanish / English'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { if (language !== 'es') toggleLanguage(); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${language === 'es' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  Español
                </button>
                <button
                  onClick={() => { if (language !== 'en') toggleLanguage(); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mt-4 mx-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
            {language === 'es' ? 'Notificaciones' : 'Notifications'}
          </p>
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Push</p>
                  <p className="text-xs text-gray-400">{language === 'es' ? 'Respuestas y menciones' : 'Replies and mentions'}</p>
                </div>
              </div>
              <Toggle
                checked={notifications.pushEnabled}
                onChange={(val) => updateNotifications({ pushEnabled: val })}
              />
            </div>
            <div className="px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {language === 'es' ? 'Resumen diario' : 'Daily digest'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {language === 'es' ? 'Resumen por email cada mañana' : 'Email summary every morning'}
                  </p>
                </div>
              </div>
              <Toggle
                checked={notifications.digestEnabled}
                onChange={(val) => updateNotifications({ digestEnabled: val })}
              />
            </div>
          </div>
        </div>

        {/* Invite codes */}
        <div className="mt-4 mx-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
            {language === 'es' ? 'Códigos de invitación' : 'Invite codes'}
          </p>
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 px-4 py-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">
                {currentUser?.invite_codes_remaining || 0} {language === 'es' ? 'disponibles' : 'available'}
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="text-xs text-blue-600 font-medium"
              >
                {language === 'es' ? 'Ver en perfil' : 'View in profile'}
              </button>
            </div>
            {currentUser?.invite_codes?.map(code => (
              <div key={code.code} className="flex items-center justify-between py-1">
                <span className={`font-mono text-sm ${code.used ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                  {code.code}
                </span>
                <span className={`text-xs ${code.used ? 'text-gray-400' : 'text-emerald-600 font-medium'}`}>
                  {code.used ? (language === 'es' ? 'Usado' : 'Used') : (language === 'es' ? 'Disponible' : 'Available')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ASAP Loads teaser */}
        <div className="mt-4 mx-4">
          <div className="bg-[#0F1A2E] rounded-2xl px-4 py-4">
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-wide mb-1">Próximamente</p>
            <p className="text-white text-sm font-semibold leading-snug">
              ASAP Loads viene pronto.
            </p>
            <p className="text-white/60 text-xs mt-1 leading-snug">
              Tu reputación en DIN te dará acceso prioritario.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 mx-4 space-y-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 bg-white px-4 py-3.5 rounded-2xl border border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={18} className="text-gray-400" />
            <span className="text-sm font-medium">
              {language === 'es' ? 'Cerrar sesión' : 'Sign out'}
            </span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 bg-white px-4 py-3.5 rounded-2xl border border-gray-100 text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={18} />
            <span className="text-sm font-medium">
              {language === 'es' ? 'Eliminar cuenta' : 'Delete account'}
            </span>
          </button>
        </div>
      </div>

      {/* Logout confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6 pb-safe">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {language === 'es' ? '¿Cerrar sesión?' : 'Sign out?'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {language === 'es'
                ? 'Puedes volver a entrar con tu número de teléfono y MC.'
                : 'You can sign back in with your phone number and MC.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold"
              >
                {language === 'es' ? 'Cerrar sesión' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6 pb-safe">
            <h3 className="text-lg font-bold text-red-600 mb-2">
              {language === 'es' ? '¿Eliminar cuenta?' : 'Delete account?'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {language === 'es'
                ? 'Esta acción es permanente. Perderás todo tu historial, reputación y códigos de invitación.'
                : 'This action is permanent. You will lose all your history, reputation, and invite codes.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold"
              >
                {language === 'es' ? 'Eliminar' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
