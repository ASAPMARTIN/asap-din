import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import VerifiedBadge from '../components/VerifiedBadge';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import { getUserById } from '../data/mockUsers';
import { timeAgo } from '../utils/timeAgo';
import { CURRENT_USER_ID } from '../data/mockUsers';

const EQUIPMENT_LABELS = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
};

export default function MessagesListScreen() {
  const navigate = useNavigate();
  const { language } = useAuth();
  const { getConversationsForUser } = useMessages();

  const conversations = getConversationsForUser(CURRENT_USER_ID);

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FAFAF8' }}>
      <TopBar showBack title={language === 'es' ? 'Mensajes' : 'Messages'} />

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-700 font-semibold text-base mb-1">
              {language === 'es' ? 'Aún no tienes mensajes' : 'No messages yet'}
            </p>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              {language === 'es'
                ? 'Visita el perfil de un camionero y envíale un mensaje.'
                : "Visit a trucker's profile and send them a message."}
            </p>
            <button
              onClick={() => navigate('/members')}
              className="px-5 py-2.5 bg-[#0F1A2E] text-white text-sm font-bold rounded-xl btn-press"
            >
              {language === 'es' ? 'Ver directorio' : 'View directory'}
            </button>
          </div>
        ) : (
          <div className="bg-white">
            {conversations.map((conv, i) => {
              const otherId = conv.participant_ids.find(id => id !== CURRENT_USER_ID);
              const other = getUserById(otherId);
              if (!other) return null;

              const lastMsg = conv.messages[conv.messages.length - 1];
              const isLastFromMe = lastMsg?.sender_id === CURRENT_USER_ID;

              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messages/${otherId}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left btn-press transition-colors ${
                    i < conversations.length - 1 ? 'border-b border-gray-100' : ''
                  } ${conv.unread_count > 0 ? 'bg-blue-50/30' : 'active:bg-gray-50'}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: other.avatar_color }}
                  >
                    {other.avatar_initials}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-base truncate ${conv.unread_count > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                          {other.display_name}
                        </span>
                        <VerifiedBadge size={14} />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {lastMsg ? timeAgo(lastMsg.created_at, language) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold text-gray-700' : 'text-gray-400'}`}>
                        {isLastFromMe ? (language === 'es' ? 'Tú: ' : 'You: ') : ''}
                        {lastMsg?.text || (language === 'es' ? 'Empieza la conversación' : 'Start the conversation')}
                      </p>
                      {conv.unread_count > 0 && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                          <span className="text-white text-[10px] font-bold">{conv.unread_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
