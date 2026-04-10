import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import { getUserById, CURRENT_USER_ID } from '../data/mockUsers';
import { timeAgo } from '../utils/timeAgo';

const EQUIPMENT_LABELS = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
};

export default function ChatScreen() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const { getMessages, sendMessage, markConversationRead, getOrCreateConversation } = useMessages();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const other = getUserById(userId);
  const messages = getMessages(userId);

  // Mark as read and ensure conversation exists
  useEffect(() => {
    getOrCreateConversation(userId);
    markConversationRead(userId);
  }, [userId]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    sendMessage(userId, trimmed);
    // Focus input after send
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!other) {
    return (
      <div className="min-h-dvh flex flex-col bg-gray-50">
        <div className="bg-[#0F1A2E] text-white safe-top">
          <div className="flex items-center px-4 h-14">
            <button onClick={() => navigate(-1)} className="p-1.5 text-white/80">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">{language === 'es' ? 'Usuario no encontrado' : 'User not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      {/* Custom TopBar with other user's info */}
      <header className="bg-[#0F1A2E] text-white safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="text-white/80 hover:text-white -ml-1 p-1.5 flex-shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: other.avatar_color }}
          >
            {other.avatar_initials}
          </div>

          {/* Name + meta — tappable → profile */}
          <button
            onClick={() => navigate(`/profile/${other.id}`)}
            className="flex-1 text-left min-w-0"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base truncate">{other.display_name}</span>
              <VerifiedBadge size={14} />
            </div>
            <p className="text-white/50 text-xs truncate">
              {EQUIPMENT_LABELS[other.equipment_type] || other.equipment_type}
            </p>
          </button>
        </div>
      </header>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingBottom: '72px' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3"
              style={{ backgroundColor: other.avatar_color }}
            >
              {other.avatar_initials}
            </div>
            <p className="text-gray-700 font-semibold text-base">{other.display_name}</p>
            <p className="text-gray-400 text-sm mt-1">
              {language === 'es' ? 'Empieza la conversación' : 'Start the conversation'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === CURRENT_USER_ID;
              const showTime = i === 0 ||
                new Date(msg.created_at) - new Date(messages[i - 1].created_at) > 300000; // 5 min gap

              return (
                <div key={msg.id}>
                  {showTime && (
                    <div className="text-center my-2">
                      <span className="text-xs text-gray-400">{timeAgo(msg.created_at, language)}</span>
                    </div>
                  )}
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 self-end mb-0.5"
                        style={{ backgroundColor: other.avatar_color }}
                      >
                        {other.avatar_initials}
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        isMe
                          ? 'bg-[#0F1A2E] text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Fixed text input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2.5 pb-safe z-20">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'es' ? 'Escribe un mensaje...' : 'Write a message...'}
            rows={1}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-28 bg-gray-50"
            style={{ lineHeight: '1.4' }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-10 h-10 bg-[#0F1A2E] disabled:bg-gray-200 text-white rounded-full flex items-center justify-center flex-shrink-0 btn-press transition-colors"
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
