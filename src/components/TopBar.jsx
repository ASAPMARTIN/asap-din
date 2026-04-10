import { useNavigate } from 'react-router-dom';
import { Search, Bell, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { getUnreadCount } from '../data/mockNotifications';
import { CURRENT_USER_ID } from '../data/mockUsers';

export default function TopBar({ showBack = false, title = null, onBack }) {
  const navigate = useNavigate();
  const { currentUser, language } = useAuth();
  const { getTotalUnreadCount } = useMessages();

  const notifUnread = currentUser ? getUnreadCount(currentUser.id) : 0;
  const msgUnread = getTotalUnreadCount();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className="bg-[#0F1A2E] text-white safe-top sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left side */}
        {showBack ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/80 hover:text-white -ml-1 py-2 pr-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {title && <span className="text-sm font-medium text-white">{title}</span>}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">D</span>
            </div>
            <span className="font-bold text-lg tracking-tight">ASAP-DIN</span>
          </div>
        )}

        {/* Right side — only on main screens */}
        {!showBack && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/search')}
              className="text-white/80 hover:text-white p-1"
              aria-label={language === 'es' ? 'Buscar broker' : 'Search broker'}
            >
              <Search size={20} />
            </button>

            {/* Messages icon */}
            <button
              onClick={() => navigate('/messages')}
              className="relative text-white/80 hover:text-white p-1"
              aria-label={language === 'es' ? 'Mensajes' : 'Messages'}
            >
              <MessageCircle size={20} />
              {msgUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                  {msgUnread > 9 ? '9+' : msgUnread}
                </span>
              )}
            </button>

            {/* Notifications icon */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative text-white/80 hover:text-white p-1"
              aria-label={language === 'es' ? 'Notificaciones' : 'Notifications'}
            >
              <Bell size={20} />
              {notifUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                  {notifUnread > 9 ? '9+' : notifUnread}
                </span>
              )}
            </button>
          </div>
        )}

        {showBack && !title && <div className="flex-1" />}
      </div>
    </header>
  );
}
