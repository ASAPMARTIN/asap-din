import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Pin, MessageCircle, Pencil } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import PostCard from '../components/PostCard';
import VerifiedBadge from '../components/VerifiedBadge';
import Avatar from '../components/Avatar';
import EditProfileSheet from '../components/EditProfileSheet';
import { getAvatarColor, getInitials } from '../utils/avatarColor';
import { formatDate } from '../utils/timeAgo';
import { getUserById } from '../data/mockUsers';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { useFollows } from '../hooks/useFollows';

const EQUIPMENT_LABELS = {
  dry_van: '🚛 Dry Van', flatbed: '🏗️ Flatbed', reefer: '❄️ Reefer',
  tanker: '🛢️ Tanker', step_deck: '⬇️ Step Deck', other: '🚚 Otro',
};

function InviteSection({ user, lang }) {
  const [copied, setCopied] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = () => {
    alert(lang === 'es'
      ? 'En la versión final podrás generar un enlace de invitación único.'
      : 'In the final version you can generate a unique invite link.');
  };

  return (
    <div className="bg-[#0F1A2E] rounded-2xl p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-bold text-sm">
          {lang === 'es'
            ? `Tienes ${user.invite_codes_remaining} invitaciones`
            : `You have ${user.invite_codes_remaining} invites`}
        </p>
        <span className="text-xs text-white/40">
          {lang === 'es' ? 'para camioneros verificados' : 'for verified truckers'}
        </span>
      </div>

      {user.invite_codes && user.invite_codes.length > 0 && (
        <div className="space-y-2 mb-3">
          {user.invite_codes.map(code => (
            <div key={code.code} className="flex items-center justify-between">
              <div>
                <span className={`font-mono text-sm font-semibold ${code.used ? 'text-white/30 line-through' : 'text-white'}`}>
                  {code.code}
                </span>
                {code.used && (
                  <span className="text-xs text-white/30 ml-2">→ {code.used_by}</span>
                )}
              </div>
              {!code.used && (
                <button
                  onClick={() => handleCopy(code.code)}
                  className="text-xs text-emerald-400 font-semibold"
                >
                  {copied === code.code ? '✓ Copiado' : 'Copiar'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {user.invite_codes_remaining > 0 ? (
        <button
          onClick={handleGenerate}
          className="w-full py-2.5 border border-white/20 text-white/80 text-sm font-medium rounded-xl hover:bg-white/10 transition-colors"
        >
          {lang === 'es' ? 'Generar enlace de invitación' : 'Generate invite link'}
        </button>
      ) : (
        <p className="text-xs text-white/30 text-center">
          {lang === 'es' ? 'No tienes códigos disponibles.' : 'No codes available.'}
        </p>
      )}
    </div>
  );
}

export default function UserProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, language } = useAuth();
  const { getPostsByUser, getPinnedPostsByUser } = usePosts();
  const { isFollowing, follow, unfollow, getFollowingCount, getFollowersCount } = useFollows();
  const [activeTab, setActiveTab] = useState('destacados');
  const [editOpen, setEditOpen] = useState(false);

  const isOwnProfile = !id || id === currentUser?.id;
  // For own profile always use live currentUser so edits appear immediately
  const user = isOwnProfile ? currentUser : getUserById(id);

  if (!user) {
    return (
      <div className="min-h-dvh bg-gray-50 flex flex-col">
        {isOwnProfile ? <TopBar /> : <TopBar showBack />}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">{language === 'es' ? 'Usuario no encontrado' : 'User not found'}</p>
        </div>
        {isOwnProfile && <BottomNav />}
      </div>
    );
  }

  const allPosts = getPostsByUser(user.id);
  const pinnedPosts = getPinnedPostsByUser(user.id);
  const totalUpvotes = allPosts.reduce((sum, p) => sum + p.upvote_count, 0);

  const following = isFollowing(user.id);
  const followingCount = isOwnProfile ? getFollowingCount() : null;
  const followersCount = getFollowersCount(user.id);

  const handleFollowToggle = () => {
    if (following) {
      const ok = window.confirm(
        language === 'es'
          ? `¿Dejar de seguir a ${user.display_name}?`
          : `Unfollow ${user.display_name}?`
      );
      if (ok) unfollow(user.id);
    } else {
      follow(user.id);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FAFAF8' }}>
      {isOwnProfile ? <TopBar /> : <TopBar showBack />}

      <div className="flex-1 overflow-y-auto pb-safe">
        {/* Navy cover band */}
        <div className="h-20 bg-[#0F1A2E]" />

        {/* Profile header card */}
        <div className="bg-white border-b border-gray-100 px-4 pb-5">
          {/* Avatar + actions row */}
          <div className="flex items-end justify-between -mt-10 mb-3">
            <Avatar
              user={user}
              className="w-20 h-20 text-2xl border-4 border-white shadow-soft"
            />
            <div className="flex items-center gap-2 mb-1">
              {!isOwnProfile && (
                <>
                  <button
                    onClick={() => navigate(`/messages/${user.id}`)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 btn-press hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle size={15} />
                    <span>{language === 'es' ? 'Mensaje' : 'Message'}</span>
                  </button>
                  <button
                    onClick={handleFollowToggle}
                    className={`px-4 py-2 rounded-full text-sm font-bold btn-press transition-all ${
                      following
                        ? 'bg-[#0F1A2E] text-white'
                        : 'border-2 border-[#0F1A2E] text-[#0F1A2E] bg-white'
                    }`}
                  >
                    {following
                      ? (language === 'es' ? 'Siguiendo ✓' : 'Following ✓')
                      : (language === 'es' ? 'Seguir' : 'Follow')}
                  </button>
                </>
              )}
              {isOwnProfile && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 btn-press hover:bg-gray-50 transition-colors"
                  >
                    <Pencil size={14} />
                    <span>{language === 'es' ? 'Editar' : 'Edit'}</span>
                  </button>
                  <button onClick={() => navigate('/settings')} className="p-2 text-gray-400 btn-press">
                    <Settings size={22} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Name + verified */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <h1 className="text-xl font-bold text-gray-900">{user.display_name}</h1>
            <VerifiedBadge size={18} />
          </div>

          {/* Founder badge (own profile) */}
          {isOwnProfile && (
            <div className="mb-2">
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                ⭐ Miembro Fundador
              </span>
            </div>
          )}

          {/* Equipment + MC */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
              {EQUIPMENT_LABELS[user.equipment_type] || user.equipment_type}
            </span>
            <span className="text-sm text-gray-400 font-mono">MC-{user.mc_number}</span>
          </div>

          {/* Bio */}
          {user.bio ? (
            <p className="text-base font-medium text-gray-700 mb-4 leading-relaxed">{user.bio}</p>
          ) : isOwnProfile ? (
            <button
              onClick={() => setEditOpen(true)}
              className="text-sm text-blue-500 mb-4 flex items-center gap-1"
            >
              <Pencil size={13} />
              {language === 'es' ? 'Agregar bio...' : 'Add a bio...'}
            </button>
          ) : null}

          {/* Stats */}
          <div className="flex gap-5 py-3 border-t border-gray-100 flex-wrap">
            {isOwnProfile && (
              <div>
                <p className="text-lg font-bold text-gray-900">{followingCount}</p>
                <p className="text-xs text-gray-400">{language === 'es' ? 'siguiendo' : 'following'}</p>
              </div>
            )}
            <div>
              <p className="text-lg font-bold text-gray-900">{followersCount}</p>
              <p className="text-xs text-gray-400">{language === 'es' ? 'seguidores' : 'followers'}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{user.years_in_business}</p>
              <p className="text-xs text-gray-400">{language === 'es' ? 'años en el negocio' : 'yrs in business'}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{allPosts.length}</p>
              <p className="text-xs text-gray-400">{language === 'es' ? 'publicaciones' : 'posts'}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{totalUpvotes}</p>
              <p className="text-xs text-gray-400">{language === 'es' ? 'votos recibidos' : 'votes received'}</p>
            </div>
          </div>

          {/* Invite section (own profile) */}
          {isOwnProfile && <InviteSection user={user} lang={language} />}
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-b border-gray-200 sticky top-0 z-10">
          <button
            onClick={() => setActiveTab('destacados')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'destacados' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            {language === 'es' ? `Destacados (${pinnedPosts.length})` : `Pinned (${pinnedPosts.length})`}
          </button>
          <button
            onClick={() => setActiveTab('actividad')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'actividad' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            {language === 'es' ? `Actividad (${allPosts.length})` : `Activity (${allPosts.length})`}
          </button>
        </div>

        {activeTab === 'destacados' && (
          <div>
            {pinnedPosts.length === 0 ? (
              <div className="py-16 text-center px-8">
                <Pin size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  {isOwnProfile
                    ? (language === 'es' ? 'Fija tus mejores publicaciones aquí.' : 'Pin your best posts here.')
                    : (language === 'es' ? 'Sin publicaciones destacadas.' : 'No pinned posts.')}
                </p>
              </div>
            ) : (
              pinnedPosts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}

        {activeTab === 'actividad' && (
          <div>
            {allPosts.length === 0 ? (
              <div className="py-16 text-center px-8">
                <p className="text-gray-400 text-sm">
                  {language === 'es' ? 'Sin publicaciones aún.' : 'No posts yet.'}
                </p>
              </div>
            ) : (
              allPosts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}
      </div>

      {isOwnProfile && <BottomNav />}

      {editOpen && <EditProfileSheet onClose={() => setEditOpen(false)} />}
    </div>
  );
}
