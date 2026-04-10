import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Pin, MessageCircle, UserPlus, UserCheck, MoreHorizontal, QrCode } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import PostCard from '../components/PostCard';
import VerifiedBadge from '../components/VerifiedBadge';
import BottomSheet from '../components/BottomSheet';
import ProfileQR from '../components/ProfileQR';
import { getAvatarColor, getInitials } from '../utils/avatarColor';
import { formatDate } from '../utils/timeAgo';
import { getUserById, mockUsers, CURRENT_USER_ID } from '../data/mockUsers';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { useFollows } from '../hooks/useFollows';
import { useBlocked } from '../hooks/useBlocked';
import { useEndorsements, ENDORSEMENT_TYPES } from '../hooks/useEndorsements';
import { useProfileViews } from '../hooks/useProfileViews';

const EQUIPMENT_LABELS = {
  dry_van: '🚛 Dry Van', flatbed: '🏗️ Flatbed', reefer: '❄️ Reefer',
  tanker: '🛢️ Tanker', step_deck: '⬇️ Step Deck', other: '🚚 Otro',
};

const EQUIPMENT_LABELS_SHORT = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
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

function EndorsementPills({ userId, language }) {
  const { getEndorsements, hasEndorsed } = useEndorsements();
  const counts = getEndorsements(userId);

  const pills = Object.entries(ENDORSEMENT_TYPES)
    .filter(([type]) => counts[type] > 0)
    .map(([type, label]) => ({ type, label, count: counts[type] }));

  if (pills.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
      {pills.map(({ type, label, count }) => {
        const endorsed = hasEndorsed(userId, type);
        return (
          <span
            key={type}
            className={`flex-shrink-0 flex items-center gap-1 rounded-full bg-gray-100 text-sm px-3 py-1 ${
              endorsed ? 'ring-2 ring-[#0F1A2E]' : ''
            }`}
          >
            <span className="text-gray-700 text-sm">{label}</span>
            <span className="text-xs font-bold text-gray-500">× {count}</span>
          </span>
        );
      })}
    </div>
  );
}

export default function UserProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, language } = useAuth();
  const { getPostsByUser, getPinnedPostsByUser, getSavedPosts } = usePosts();
  const { isFollowing, follow, unfollow, getFollowingCount, getFollowersCount } = useFollows();
  const { blockUser } = useBlocked();
  const { endorse, unendorse, hasEndorsed, getEndorsements } = useEndorsements();
  const { recordView, getViewCount } = useProfileViews();
  const [activeTab, setActiveTab] = useState('destacados');
  const [unfollowModal, setUnfollowModal] = useState(false);
  const [blockSheetOpen, setBlockSheetOpen] = useState(false);
  const [blockToast, setBlockToast] = useState(false);
  const [endorseSheetOpen, setEndorseSheetOpen] = useState(false);
  const [endorseToast, setEndorseToast] = useState('');
  const [qrOpen, setQrOpen] = useState(false);

  const user = id ? getUserById(id) : currentUser;
  const isOwnProfile = !id || id === currentUser?.id;

  // Record profile view
  useEffect(() => {
    if (user && !isOwnProfile) {
      recordView(user.id);
    }
  }, [user?.id, isOwnProfile]);

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

  const avatarColor = user.avatar_color || getAvatarColor(user.display_name);
  const allPosts = getPostsByUser(user.id);
  const pinnedPosts = getPinnedPostsByUser(user.id);
  const savedPosts = isOwnProfile ? getSavedPosts() : [];
  const totalUpvotes = allPosts.reduce((sum, p) => sum + p.upvote_count, 0);

  const handleBlock = () => {
    blockUser(user.id);
    setBlockSheetOpen(false);
    setBlockToast(true);
    setTimeout(() => { setBlockToast(false); navigate(-1); }, 1500);
  };

  const following = isFollowing(user.id);
  const followingCount = isOwnProfile ? getFollowingCount() : null;
  const followersCount = getFollowersCount(user.id);

  const handleFollowToggle = () => {
    if (following) {
      setUnfollowModal(true);
    } else {
      follow(user.id);
    }
  };

  const handleEndorseType = (type) => {
    const already = hasEndorsed(user.id, type);
    if (already) {
      unendorse(user.id, type);
      setEndorseSheetOpen(false);
      setEndorseToast(language === 'es' ? 'Recomendación retirada' : 'Endorsement removed');
    } else {
      endorse(user.id, type);
      setEndorseSheetOpen(false);
      setEndorseToast(language === 'es' ? 'Recomendación agregada ✓' : 'Endorsement added ✓');
    }
    setTimeout(() => setEndorseToast(''), 2000);
  };

  // Similar operators for own profile (top 3 by same equipment type)
  const similarOperators = isOwnProfile
    ? mockUsers
        .filter(u =>
          u.id !== CURRENT_USER_ID &&
          u.equipment_type === user.equipment_type
        )
        .slice(0, 3)
    : [];

  const profileViewCount = getViewCount(user.id);

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
            <div
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-soft"
              style={{ backgroundColor: avatarColor }}
            >
              {user.avatar_initials || getInitials(user.display_name)}
            </div>
            <div className="flex items-center gap-2 mb-1">
              {!isOwnProfile && (
                <>
                  {/* Mensaje button */}
                  <button
                    onClick={() => navigate(`/messages/${user.id}`)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 btn-press hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle size={15} />
                    <span>{language === 'es' ? 'Mensaje' : 'Message'}</span>
                  </button>

                  {/* Seguir / Siguiendo */}
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold btn-press transition-all ${
                      following
                        ? 'bg-[#0F1A2E] text-white'
                        : 'border-2 border-[#0F1A2E] text-[#0F1A2E] bg-white'
                    }`}
                  >
                    {following
                      ? <><UserCheck size={15} /><span>{language === 'es' ? 'Siguiendo' : 'Following'}</span></>
                      : <><UserPlus size={15} /><span>{language === 'es' ? 'Seguir' : 'Follow'}</span></>}
                  </button>

                  {/* QR button */}
                  <button
                    onClick={() => setQrOpen(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 btn-press"
                  >
                    <QrCode size={20} />
                  </button>

                  {/* More options */}
                  <button
                    onClick={() => setBlockSheetOpen(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 btn-press"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </>
              )}
              {isOwnProfile && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setQrOpen(true)} className="p-2 text-gray-400 btn-press">
                    <QrCode size={22} />
                  </button>
                  <button onClick={() => navigate('/settings')} className="p-2 text-gray-400">
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
          {user.bio && (
            <p className="text-base font-medium text-gray-700 mb-4 leading-relaxed">{user.bio}</p>
          )}

          {/* Endorsement pills — below bio */}
          <div className="mb-4">
            <EndorsementPills userId={user.id} language={language} />
          </div>

          {/* Stats — following/followers + accomplishments */}
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

          {/* Profile view count — own profile */}
          {isOwnProfile && profileViewCount > 0 && (
            <div className="bg-blue-50 rounded-xl px-4 py-2.5 mx-0 mb-3 mt-1">
              <p className="text-sm text-[#0F1A2E] font-semibold">
                👁 {profileViewCount} {language === 'es' ? 'personas vieron tu perfil esta semana' : 'people viewed your profile this week'}
              </p>
            </div>
          )}

          {/* Endorse button — other profiles only */}
          {!isOwnProfile && (
            <button
              onClick={() => setEndorseSheetOpen(true)}
              className="w-full py-2.5 mt-2 border border-[#0F1A2E] text-[#0F1A2E] text-sm font-bold rounded-2xl btn-press hover:bg-[#0F1A2E] hover:text-white transition-colors"
            >
              ⭐ {language === 'es' ? 'Recomendar' : 'Endorse'}
            </button>
          )}

          {/* VIP invite section (own profile) */}
          {isOwnProfile && <InviteSection user={user} lang={language} />}

          {/* Similar operators — own profile */}
          {isOwnProfile && similarOperators.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                {language === 'es' ? 'Operadores similares' : 'Similar operators'}
              </p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {similarOperators.map(op => (
                  <button
                    key={op.id}
                    onClick={() => navigate(`/profile/${op.id}`)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0 btn-press"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: op.avatar_color }}
                    >
                      {op.avatar_initials}
                    </div>
                    <span className="text-xs text-gray-600 font-medium w-12 text-center truncate">
                      {op.display_name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
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
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('guardados')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'guardados' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              {language === 'es' ? `Guardados (${savedPosts.length})` : `Saved (${savedPosts.length})`}
            </button>
          )}
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

        {activeTab === 'guardados' && isOwnProfile && (
          <div>
            {savedPosts.length === 0 ? (
              <div className="py-16 text-center px-8">
                <p className="text-gray-400 text-sm">
                  {language === 'es' ? 'No tienes publicaciones guardadas.' : 'No saved posts yet.'}
                </p>
              </div>
            ) : (
              savedPosts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}
      </div>

      {isOwnProfile && <BottomNav />}

      {/* Endorse toast */}
      {endorseToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#0F1A2E] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg fade-in pointer-events-none">
          {endorseToast}
        </div>
      )}

      {/* Block toast */}
      {blockToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#0F1A2E] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg fade-in pointer-events-none">
          {language === 'es' ? '✓ Usuario bloqueado' : '✓ User blocked'}
        </div>
      )}

      {/* Endorse bottom sheet */}
      <BottomSheet isOpen={endorseSheetOpen} onClose={() => setEndorseSheetOpen(false)}>
        <div className="px-4 pb-6 pt-2">
          <h3 className="text-base font-bold text-gray-900 mb-1 text-center">
            {language === 'es' ? `¿En qué destaca ${user.display_name.split(' ')[0]}?` : `How does ${user.display_name.split(' ')[0]} stand out?`}
          </h3>
          <p className="text-xs text-gray-400 mb-4 text-center">
            {language === 'es' ? 'Toca para agregar o retirar una recomendación' : 'Tap to add or remove an endorsement'}
          </p>
          <div className="space-y-2">
            {Object.entries(ENDORSEMENT_TYPES).map(([type, label]) => {
              const endorsed = hasEndorsed(user.id, type);
              const count = getEndorsements(user.id)[type] || 0;
              const displayLabel = type === 'expert'
                ? `🔧 Experto en ${EQUIPMENT_LABELS_SHORT[user.equipment_type] || user.equipment_type}`
                : label;
              return (
                <button
                  key={type}
                  onClick={() => handleEndorseType(type)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-colors btn-press ${
                    endorsed
                      ? 'bg-[#0F1A2E] text-white'
                      : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span>{displayLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${endorsed ? 'text-white/60' : 'text-gray-400'}`}>× {count}</span>
                    {endorsed && <span>✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>

      {/* Block confirmation sheet */}
      <BottomSheet isOpen={blockSheetOpen} onClose={() => setBlockSheetOpen(false)}>
        <div className="px-4 pb-6 pt-2">
          <h3 className="text-base font-bold text-gray-900 mb-2 text-center">
            {language === 'es' ? `¿Bloquear a ${user.display_name}?` : `Block ${user.display_name}?`}
          </h3>
          <p className="text-sm text-gray-500 mb-5 text-center">
            {language === 'es'
              ? 'Ya no verás sus publicaciones ni podrás interactuar con ellos.'
              : 'You will no longer see their posts or be able to interact with them.'}
          </p>
          <button
            onClick={handleBlock}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl mb-3 btn-press"
          >
            {language === 'es' ? 'Bloquear' : 'Block'}
          </button>
          <button
            onClick={() => setBlockSheetOpen(false)}
            className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl btn-press"
          >
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </button>
        </div>
      </BottomSheet>

      {/* Unfollow confirmation modal */}
      {unfollowModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setUnfollowModal(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-3xl p-6 pb-safe" onClick={e => e.stopPropagation()}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3"
              style={{ backgroundColor: user.avatar_color || '#4B5563' }}
            >
              {user.avatar_initials}
            </div>
            <h2 className="text-center font-bold text-gray-900 text-base mb-1">
              {language === 'es' ? `¿Dejar de seguir a ${user.display_name}?` : `Unfollow ${user.display_name}?`}
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              {language === 'es' ? 'Sus publicaciones ya no aparecerán primero en tu feed.' : 'Their posts will no longer appear first in your feed.'}
            </p>
            <button
              onClick={() => { unfollow(user.id); setUnfollowModal(false); }}
              className="w-full py-3 bg-red-500 text-white font-bold rounded-2xl mb-3 btn-press"
            >
              {language === 'es' ? 'Dejar de seguir' : 'Unfollow'}
            </button>
            <button
              onClick={() => setUnfollowModal(false)}
              className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl btn-press"
            >
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* QR overlay */}
      <ProfileQR
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        userId={user.id}
        userName={user.display_name}
        avatarColor={avatarColor}
        avatarInitials={user.avatar_initials || getInitials(user.display_name)}
      />
    </div>
  );
}
