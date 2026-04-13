import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';
import { mockUsers, CURRENT_USER_ID } from '../data/mockUsers';
import { useFollows } from '../hooks/useFollows';
import { useAuth } from '../hooks/useAuth';
import { MOCK_FOLLOWERS_COUNT } from '../data/mockFollows';

const EQUIPMENT_LABELS = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
};

/**
 * Suggests users to follow ranked by:
 *  1. Same equipment type as current user (most relevant peers)
 *  2. Most followers (social proof)
 *  3. Recently active
 * Excludes: current user + already-following users
 */
function getSuggestions(currentUser, following) {
  return mockUsers
    .filter(u => u.id !== CURRENT_USER_ID && !following.has(u.id))
    .sort((a, b) => {
      // Same equipment type → top
      const aMatch = a.equipment_type === currentUser?.equipment_type ? 1 : 0;
      const bMatch = b.equipment_type === currentUser?.equipment_type ? 1 : 0;
      if (bMatch !== aMatch) return bMatch - aMatch;
      // Then by followers (social proof)
      const aFollowers = MOCK_FOLLOWERS_COUNT[a.id] ?? 0;
      const bFollowers = MOCK_FOLLOWERS_COUNT[b.id] ?? 0;
      if (bFollowers !== aFollowers) return bFollowers - aFollowers;
      // Then by recency
      return new Date(b.last_active_at) - new Date(a.last_active_at);
    })
    .slice(0, 8);
}

export default function PeopleYouMayKnow({ compact = false }) {
  const navigate = useNavigate();
  const { currentUser, language } = useAuth();
  const { following, follow, isFollowing } = useFollows();

  const suggestions = getSuggestions(currentUser, following);
  if (suggestions.length === 0) return null;

  return (
    <div className={compact ? '' : 'bg-white border-b border-gray-100 py-3'}>
      {/* Section header */}
      <div className="flex items-center justify-between px-4 mb-2.5">
        <p className="text-sm font-bold text-gray-800">
          {language === 'es' ? 'Personas que quizás conozcas' : 'People you may know'}
        </p>
        <button
          onClick={() => navigate('/members')}
          className="text-xs text-blue-600 font-semibold"
        >
          {language === 'es' ? 'Ver todos' : 'See all'}
        </button>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {suggestions.map(user => {
          const alreadyFollowing = isFollowing(user.id);
          const followers = MOCK_FOLLOWERS_COUNT[user.id] ?? 0;
          const sameEquipment = user.equipment_type === currentUser?.equipment_type;

          return (
            <div
              key={user.id}
              className="flex-shrink-0 w-36 bg-gray-50 border border-gray-100 rounded-2xl p-3 flex flex-col items-center text-center"
            >
              <button
                onClick={() => navigate(`/profile/${user.id}`)}
                className="flex flex-col items-center btn-press"
              >
                <Avatar user={user} className="w-14 h-14 text-lg mb-2 shadow-sm" />
                <div className="flex items-center gap-1 justify-center mb-0.5">
                  <span className="text-xs font-bold text-gray-900 leading-tight line-clamp-1">
                    {user.display_name.split(' ')[0]}
                  </span>
                  <VerifiedBadge size={12} />
                </div>
                <span className="text-[10px] text-gray-400 mb-0.5">
                  {EQUIPMENT_LABELS[user.equipment_type] || user.equipment_type}
                </span>
                {sameEquipment && (
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-full mb-1">
                    {language === 'es' ? 'Igual equipo' : 'Same equipment'}
                  </span>
                )}
                {!sameEquipment && followers > 0 && (
                  <span className="text-[10px] text-gray-400 mb-1">
                    {followers} {language === 'es' ? 'seguidores' : 'followers'}
                  </span>
                )}
              </button>

              <button
                onClick={() => follow(user.id)}
                disabled={alreadyFollowing}
                className={`w-full mt-1 py-1.5 rounded-xl text-xs font-bold btn-press transition-all ${
                  alreadyFollowing
                    ? 'bg-[#0F1A2E] text-white'
                    : 'border border-[#0F1A2E] text-[#0F1A2E] bg-white hover:bg-[#0F1A2E] hover:text-white'
                }`}
              >
                {alreadyFollowing
                  ? (language === 'es' ? 'Siguiendo ✓' : 'Following ✓')
                  : (language === 'es' ? 'Seguir' : 'Follow')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
