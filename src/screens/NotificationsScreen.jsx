import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import TopBar from '../components/TopBar';
import { getNotificationsByUser } from '../data/mockNotifications';
import { getUserById } from '../data/mockUsers';
import { timeAgo } from '../utils/timeAgo';
import { useAuth } from '../hooks/useAuth';

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const { currentUser, language } = useAuth();
  const [notifications, setNotifications] = useState(
    currentUser ? getNotificationsByUser(currentUser.id) : []
  );

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleTap = (notification) => {
    setNotifications(prev => prev.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    ));
    if (notification.reference_post_id) {
      navigate(`/post/${notification.reference_post_id}`);
    } else if (notification.reference_broker_id) {
      navigate(`/broker/${notification.reference_broker_id}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FAFAF8' }}>
      <TopBar showBack />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {language === 'es' ? 'Notificaciones' : 'Notifications'}
            </h1>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-400">
                {unreadCount} {language === 'es' ? 'sin leer' : 'unread'}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-600 font-medium"
            >
              {language === 'es' ? 'Marcar todas como leídas' : 'Mark all read'}
            </button>
          )}
        </div>

        {/* Notifications list */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <Bell size={40} className="text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm">
              {language === 'es' ? 'No tienes notificaciones aún.' : 'No notifications yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white">
            {notifications.map((notif, i) => {
              const actor = getUserById(notif.actor_id);
              return (
                <button
                  key={notif.id}
                  onClick={() => handleTap(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 active:bg-gray-100 transition-colors text-left ${
                    i < notifications.length - 1 ? 'border-b border-gray-100' : ''
                  } ${!notif.read ? 'bg-blue-50/40' : ''}`}
                >
                  {/* Actor avatar */}
                  {actor ? (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: actor.avatar_color }}
                    >
                      {actor.avatar_initials}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug mb-0.5 ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notif.type === 'reply_to_post'
                        ? `${notif.actor_name} ${language === 'es' ? 'respondió a tu publicación' : 'replied to your post'}`
                        : `${notif.actor_name} ${language === 'es' ? 'mencionó a' : 'mentioned'} @${notif.broker_name}`
                      }
                    </p>
                    {notif.post_preview && (
                      <p className="text-xs text-gray-400 truncate mb-0.5">
                        {notif.post_preview}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {timeAgo(notif.created_at, language)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
