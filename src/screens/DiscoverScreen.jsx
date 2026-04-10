import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import PostCard from '../components/PostCard';
import VerifiedBadge from '../components/VerifiedBadge';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { mockUsers } from '../data/mockUsers';

const EQUIPMENT_LABELS = {
  dry_van: '🚛 Dry Van', flatbed: '🏗️ Flatbed', reefer: '❄️ Reefer',
  tanker: '🛢️ Tanker', step_deck: '⬇️ Step Deck', other: '🚚 Otro',
};

export default function DiscoverScreen() {
  const navigate = useNavigate();
  const { language } = useAuth();
  const { posts } = usePosts();

  // Top 5 posts by engagement score: upvotes + replies*2 + reposts*3
  const topPosts = useMemo(() => {
    return [...posts]
      .filter(p => !p.is_repost)
      .map(p => ({
        ...p,
        score: (p.upvote_count || 0) + (p.reply_count || 0) * 2 + (p.repost_count || 0) * 3,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [posts]);

  // All poll posts sorted by most recent
  const pollPosts = useMemo(() => {
    return [...posts]
      .filter(p => p.poll_options && p.poll_options.length > 0)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [posts]);

  // Top 5 users by post count
  const topUsers = useMemo(() => {
    const counts = {};
    posts.forEach(p => {
      if (!p.is_repost) {
        counts[p.author_id] = (counts[p.author_id] || 0) + 1;
      }
    });
    return mockUsers
      .map(u => ({ ...u, postCount: counts[u.id] || 0 }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5);
  }, [posts]);

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FAFAF8' }}>
      <TopBar showBack title={language === 'es' ? 'Descubrir' : 'Discover'} />

      <div className="flex-1 overflow-y-auto pb-safe">

        {/* Popular this week */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">
            🔥 {language === 'es' ? 'Más popular esta semana' : 'Most popular this week'}
          </p>
          {topPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Active polls */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3 mt-2">
            📊 {language === 'es' ? 'Encuestas activas' : 'Active polls'}
          </p>
          {pollPosts.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 pb-4">
              {language === 'es' ? 'No hay encuestas activas.' : 'No active polls.'}
            </p>
          ) : (
            pollPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>

        {/* Most active members */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3 mt-2">
            ⭐ {language === 'es' ? 'Miembros más activos' : 'Most active members'}
          </p>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-4">
            {topUsers.map(user => (
              <button
                key={user.id}
                onClick={() => navigate(user.id === 'u-001' ? '/profile' : `/profile/${user.id}`)}
                className="flex flex-col items-center gap-2 flex-shrink-0 btn-press"
              >
                <div
                  className="w-13 h-13 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base shadow-soft"
                  style={{ backgroundColor: user.avatar_color }}
                >
                  {user.avatar_initials}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-900 w-16 truncate text-center">
                    {user.display_name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-gray-400">{user.postCount} posts</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-6" />
      </div>

      <BottomNav />
    </div>
  );
}
