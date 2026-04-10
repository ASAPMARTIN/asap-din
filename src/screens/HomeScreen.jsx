import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Search } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import ThreadTabs from '../components/ThreadTabs';
import PostCard from '../components/PostCard';
import ComposeScreen from './ComposeScreen';
import OnboardingOverlay from '../components/OnboardingOverlay';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { useFollows } from '../hooks/useFollows';
import { useBlocked } from '../hooks/useBlocked';
import { mockUsers, CURRENT_USER_ID } from '../data/mockUsers';

// 8 most recently active members for stories row
const storyUsers = [...mockUsers]
  .sort((a, b) => new Date(b.last_active_at) - new Date(a.last_active_at))
  .slice(0, 8);

export default function HomeScreen() {
  const navigate = useNavigate();
  const { language, hasSeenOnboarding } = useAuth();
  const { getPostsByThread } = usePosts();
  const { following } = useFollows();
  const { isBlocked } = useBlocked();
  const [activeThread, setActiveThread] = useState('alertas_brokers');
  const [composeOpen, setComposeOpen] = useState(false);

  // Sort: followed users' posts first (by recency), then others (by recency)
  // Also filter out blocked authors
  const posts = useMemo(() => {
    const all = getPostsByThread(activeThread).filter(p => !isBlocked(p.author_id));
    const followed = all.filter(p => following.has(p.author_id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const others = all.filter(p => !following.has(p.author_id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return [...followed, ...others];
  }, [getPostsByThread, activeThread, following, isBlocked]);

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
            <button
              onClick={() => navigate('/search-posts')}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors btn-press"
            >
              <Search size={20} />
            </button>
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
          <ThreadTabs activeThread={activeThread} onChange={setActiveThread} lang={language} />
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
            {posts.map(post => <PostCard key={post.id} post={post} />)}
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
