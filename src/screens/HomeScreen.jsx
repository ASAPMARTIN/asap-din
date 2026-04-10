import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Search, X } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import ThreadTabs from '../components/ThreadTabs';
import PostCard from '../components/PostCard';
import ComposeScreen from './ComposeScreen';
import OnboardingOverlay from '../components/OnboardingOverlay';
import VerifiedBadge from '../components/VerifiedBadge';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { useFollows } from '../hooks/useFollows';
import { useBlocked } from '../hooks/useBlocked';
import { useSuggestions } from '../hooks/useSuggestions';
import { mockUsers, CURRENT_USER_ID } from '../data/mockUsers';

// 8 most recently active members for stories row
const storyUsers = [...mockUsers]
  .sort((a, b) => new Date(b.last_active_at) - new Date(a.last_active_at))
  .slice(0, 8);

const EQUIPMENT_LABELS = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
};

const FLAIR_FILTERS = [
  { id: 'all', label: '✨ Todos' },
  { id: 'alerta', label: '🚨 Alerta', bg: 'bg-red-600', activeBg: 'bg-red-600 text-white', inactiveBorder: 'border border-red-300 text-red-700' },
  { id: 'pregunta', label: '❓ Pregunta', activeBg: 'bg-blue-600 text-white', inactiveBorder: 'border border-blue-300 text-blue-700' },
  { id: 'tarifa', label: '💰 Tarifa', activeBg: 'bg-emerald-600 text-white', inactiveBorder: 'border border-emerald-300 text-emerald-700' },
  { id: 'consejo', label: '💡 Consejo', activeBg: 'bg-amber-500 text-white', inactiveBorder: 'border border-amber-300 text-amber-700' },
  { id: 'encuesta', label: '📊 Encuesta', activeBg: 'bg-purple-600 text-white', inactiveBorder: 'border border-purple-300 text-purple-700' },
];

function SuggestionsCard({ suggestions, onFollow, onDismissCard }) {
  const navigate = useNavigate();
  const { language } = useAuth();

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 mx-4 my-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <p className="font-semibold text-sm text-gray-900">
          {language === 'es' ? 'Personas que quizás conozcas' : 'People you may know'}
        </p>
        <button
          onClick={onDismissCard}
          className="p-1 text-gray-400 hover:text-gray-600 btn-press"
        >
          <X size={16} />
        </button>
      </div>

      {/* Horizontal scroll */}
      <div className="flex overflow-x-auto gap-3 px-4 pb-3 snap-x snap-mandatory no-scrollbar">
        {suggestions.map(user => (
          <div
            key={user.id}
            className="flex-shrink-0 snap-start flex flex-col items-center bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
            style={{ width: '140px' }}
          >
            <button
              onClick={() => navigate(`/profile/${user.id}`)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-1.5 btn-press"
              style={{ backgroundColor: user.avatar_color }}
            >
              {user.avatar_initials}
            </button>
            <div className="flex items-center gap-0.5 mb-0.5 w-full justify-center">
              <span className="text-xs font-semibold text-gray-900 truncate max-w-[90px]">
                {user.display_name.split(' ')[0]}
              </span>
              <VerifiedBadge size={12} />
            </div>
            <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 truncate max-w-full mb-2">
              {EQUIPMENT_LABELS[user.equipment_type] || user.equipment_type}
            </span>
            <button
              onClick={() => onFollow(user.id)}
              className="text-xs font-bold border border-[#0F1A2E] text-[#0F1A2E] rounded-full px-3 py-1 btn-press hover:bg-[#0F1A2E] hover:text-white transition-colors w-full text-center"
            >
              {language === 'es' ? 'Seguir' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const { language, hasSeenOnboarding } = useAuth();
  const { getPostsByThread } = usePosts();
  const { following } = useFollows();
  const { isBlocked } = useBlocked();
  const { suggestions, dismissSuggestion, followFromSuggestion } = useSuggestions();
  const [activeThread, setActiveThread] = useState('alertas_brokers');
  const [composeOpen, setComposeOpen] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const [activeFlair, setActiveFlair] = useState('all');

  // Sort: followed users' posts first (by recency), then others (by recency)
  // Also filter out blocked authors
  const posts = useMemo(() => {
    let all = getPostsByThread(activeThread).filter(p => !isBlocked(p.author_id));

    // Apply flair filter
    if (activeFlair !== 'all') {
      all = all.filter(p => p.flair === activeFlair);
    }

    const followed = all.filter(p => following.has(p.author_id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const others = all.filter(p => !following.has(p.author_id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return [...followed, ...others];
  }, [getPostsByThread, activeThread, following, isBlocked, activeFlair]);

  const showSuggestions = suggestionsVisible && suggestions.length > 0;

  // Build posts with suggestions injected after index 2
  const renderedItems = useMemo(() => {
    if (!showSuggestions) return posts.map(p => ({ type: 'post', data: p }));
    const items = posts.map(p => ({ type: 'post', data: p }));
    const insertAt = Math.min(2, items.length);
    items.splice(insertAt, 0, { type: 'suggestions' });
    return items;
  }, [posts, showSuggestions]);

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FAFAF8' }}>
      <TopBar />

      <div className="flex-1 overflow-y-auto pb-safe">
        {/* Community header — scrolls away */}
        <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">ASAP-DIN</p>
              <p className="text-base font-bold text-gray-900">
                {language === 'es'
                  ? `${mockUsers.length} camioneros verificados en tu red`
                  : `${mockUsers.length} verified truckers in your network`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/discover')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold btn-press hover:bg-orange-200 transition-colors"
              >
                🔥 {language === 'es' ? 'Descubrir' : 'Discover'}
              </button>
              <button
                onClick={() => navigate('/search-posts')}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors btn-press"
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Avatar stories row — scrollable */}
        <div className="bg-white border-b border-gray-100 py-3">
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
            {storyUsers.map(user => (
              <button
                key={user.id}
                onClick={() => navigate(user.id === CURRENT_USER_ID ? '/profile' : `/profile/${user.id}`)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 btn-press"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base ring-2 ring-white shadow-soft"
                  style={{ backgroundColor: user.avatar_color }}
                >
                  {user.avatar_initials}
                </div>
                <span className="text-xs text-gray-600 font-medium w-14 text-center truncate">
                  {user.display_name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Broker quick-check bar + Thread tabs — sticky together */}
        <div className="sticky top-0 z-10">
          {/* Broker quick-check pill */}
          <div className="bg-white px-4 py-2 border-b border-gray-100">
            <button
              onClick={() => navigate('/search')}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-500 font-medium hover:bg-gray-200 transition-colors btn-press"
            >
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <span>{language === 'es' ? '🔍 Verificar un broker...' : '🔍 Verify a broker...'}</span>
            </button>
          </div>
          <ThreadTabs activeThread={activeThread} onChange={(t) => { setActiveThread(t); setActiveFlair('all'); }} lang={language} />

          {/* Flair filter chips */}
          <div className="bg-white border-b border-gray-100 flex overflow-x-auto no-scrollbar gap-2 px-4 py-2">
            {FLAIR_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFlair(f.id)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all btn-press ${
                  activeFlair === f.id
                    ? (f.activeBg || 'bg-[#0F1A2E] text-white')
                    : (f.inactiveBorder || 'border border-gray-200 text-gray-600')
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-base font-medium">
              {language === 'es' ? 'No hay publicaciones aún.' : 'No posts yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y-0">
            {renderedItems.map((item, idx) => {
              if (item.type === 'suggestions') {
                return (
                  <SuggestionsCard
                    key="suggestions"
                    suggestions={suggestions}
                    onFollow={followFromSuggestion}
                    onDismissCard={() => setSuggestionsVisible(false)}
                  />
                );
              }
              return <PostCard key={item.data.id} post={item.data} />;
            })}
            <div className="h-6" />
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setComposeOpen(true)}
        className="fixed bottom-20 right-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold pl-4 pr-5 py-3.5 rounded-full shadow-lg shadow-blue-600/30 btn-press z-30"
      >
        <Pencil size={18} strokeWidth={2.5} />
        <span className="text-sm">{language === 'es' ? 'Publicar' : 'Post'}</span>
      </button>

      <BottomNav />

      {composeOpen && (
        <ComposeScreen onClose={() => setComposeOpen(false)} defaultThread={activeThread} />
      )}

      {/* Onboarding overlay */}
      {!hasSeenOnboarding && (
        <OnboardingOverlay onOpenCompose={() => setComposeOpen(true)} />
      )}
    </div>
  );
}
