import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Search } from 'lucide-react';
import TopBar from '../components/TopBar';
import VerifiedBadge from '../components/VerifiedBadge';
import BottomSheet from '../components/BottomSheet';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import { getUserById, mockUsers, CURRENT_USER_ID } from '../data/mockUsers';
import { timeAgo } from '../utils/timeAgo';

const EQUIPMENT_LABELS = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
};

const GROUP_EMOJIS = ['🚛', '❄️', '🛢️', '🏗️', '💰', '🚨', '🤝', '⭐'];

function CreateGroupFlow({ onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [groupEmoji, setGroupEmoji] = useState('🚛');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const { language } = useAuth();

  const filteredUsers = mockUsers
    .filter(u => u.id !== CURRENT_USER_ID)
    .filter(u => u.display_name.toLowerCase().includes(memberSearch.toLowerCase()));

  const toggleMember = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedMembers.length < 2) return;
    onCreate(groupName.trim(), groupEmoji, selectedMembers);
    onClose();
  };

  return (
    <div>
      {step === 1 ? (
        <div className="px-4 pb-6 pt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">
              {language === 'es' ? 'Nuevo grupo' : 'New group'}
            </h3>
            <button onClick={onClose} className="p-1 text-gray-400">
              <X size={18} />
            </button>
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {language === 'es' ? 'Nombre del grupo' : 'Group name'}
          </p>
          <input
            type="text"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder={language === 'es' ? 'Ej: Miami-Atlanta Run' : 'E.g.: Miami-Atlanta Run'}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            autoFocus
          />

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {language === 'es' ? 'Emoji del grupo' : 'Group emoji'}
          </p>
          <div className="grid grid-cols-8 gap-2 mb-5">
            {GROUP_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => setGroupEmoji(emoji)}
                className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl btn-press ${
                  groupEmoji === emoji ? 'bg-[#0F1A2E] ring-2 ring-[#0F1A2E]' : 'bg-gray-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <button
            onClick={() => { if (groupName.trim()) setStep(2); }}
            disabled={!groupName.trim()}
            className={`w-full py-3 rounded-2xl font-bold text-sm btn-press ${
              groupName.trim() ? 'bg-[#0F1A2E] text-white' : 'bg-gray-100 text-gray-300'
            }`}
          >
            {language === 'es' ? 'Siguiente' : 'Next'}
          </button>
        </div>
      ) : (
        <div className="px-4 pb-6 pt-2">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setStep(1)} className="text-sm text-blue-600 font-medium">
              ← {language === 'es' ? 'Atrás' : 'Back'}
            </button>
            <h3 className="text-base font-bold text-gray-900">
              {groupEmoji} {groupName}
            </h3>
            <div className="w-12" />
          </div>

          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              placeholder={language === 'es' ? 'Buscar miembro...' : 'Search member...'}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 mb-4">
            {filteredUsers.map(user => {
              const selected = selectedMembers.includes(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => toggleMember(user.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors btn-press ${
                    selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: user.avatar_color }}
                  >
                    {user.avatar_initials}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.display_name}</p>
                    <p className="text-xs text-gray-400">{EQUIPMENT_LABELS[user.equipment_type] || user.equipment_type}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}>
                    {selected && <span className="text-white text-xs">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleCreate}
            disabled={selectedMembers.length < 2}
            className={`w-full py-3 rounded-2xl font-bold text-sm btn-press ${
              selectedMembers.length >= 2 ? 'bg-[#0F1A2E] text-white' : 'bg-gray-100 text-gray-300'
            }`}
          >
            {language === 'es' ? `Crear grupo (${selectedMembers.length})` : `Create group (${selectedMembers.length})`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MessagesListScreen() {
  const navigate = useNavigate();
  const { language } = useAuth();
  const { getConversationsForUser, getGroups, createGroup } = useMessages();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const conversations = getConversationsForUser(CURRENT_USER_ID);
  const groups = getGroups();

  // Merge and sort all chats by last message time
  const allChats = [
    ...conversations.map(c => ({ type: 'dm', data: c, time: c.messages[c.messages.length - 1]?.created_at || '' })),
    ...groups.map(g => ({ type: 'group', data: g, time: g.last_message_at || '' })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  const handleCreateGroup = (name, emoji, memberIds) => {
    const newGroup = createGroup(name, emoji, memberIds);
    setCreateGroupOpen(false);
    navigate(`/messages/${newGroup.id}`);
  };

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14 safe-top">
          <button onClick={() => navigate(-1)} className="p-1.5 text-gray-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <span className="font-bold text-base text-gray-900">{language === 'es' ? 'Mensajes' : 'Messages'}</span>
          <button
            onClick={() => setCreateGroupOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0F1A2E] text-white btn-press"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {allChats.length === 0 ? (
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
            {allChats.map((chat, i) => {
              if (chat.type === 'group') {
                const group = chat.data;
                const lastMsg = group.messages[group.messages.length - 1];
                const lastSender = lastMsg ? getUserById(lastMsg.sender_id) : null;
                const isLastMine = lastMsg?.sender_id === CURRENT_USER_ID;

                return (
                  <button
                    key={group.id}
                    onClick={() => navigate(`/messages/${group.id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left btn-press transition-colors ${
                      i < allChats.length - 1 ? 'border-b border-gray-100' : ''
                    } active:bg-gray-50`}
                  >
                    {/* Group emoji avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#0F1A2E] flex items-center justify-center text-2xl flex-shrink-0">
                      {group.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-semibold text-gray-800 truncate">{group.name}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 font-medium flex-shrink-0">
                            {group.members.length} {language === 'es' ? 'miembros' : 'members'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {lastMsg ? timeAgo(lastMsg.created_at, language) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {lastMsg
                          ? `${isLastMine ? (language === 'es' ? 'Tú: ' : 'You: ') : (lastSender ? lastSender.display_name.split(' ')[0] + ': ' : '')}${lastMsg.body || (lastMsg.type === 'voice' ? '🎤 Audio' : '')}`
                          : (language === 'es' ? 'Nuevo grupo' : 'New group')}
                      </p>
                    </div>
                  </button>
                );
              }

              // DM conversation
              const conv = chat.data;
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
                    i < allChats.length - 1 ? 'border-b border-gray-100' : ''
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
                        {lastMsg?.type === 'shared_post'
                          ? (language === 'es' ? '📎 Publicación compartida' : '📎 Shared post')
                          : lastMsg?.type === 'voice'
                          ? '🎤 Audio'
                          : lastMsg?.text || (language === 'es' ? 'Empieza la conversación' : 'Start the conversation')}
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

      {/* Create group bottom sheet */}
      <BottomSheet isOpen={createGroupOpen} onClose={() => setCreateGroupOpen(false)}>
        <CreateGroupFlow
          onClose={() => setCreateGroupOpen(false)}
          onCreate={handleCreateGroup}
        />
      </BottomSheet>
    </div>
  );
}
