import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import VerifiedBadge from '../components/VerifiedBadge';
import { mockUsers, CURRENT_USER_ID } from '../data/mockUsers';
import { useAuth } from '../hooks/useAuth';
import { useFollows } from '../hooks/useFollows';

const EQUIPMENT_LABELS = {
  dry_van: '🚛 Dry Van',
  flatbed: '🏗️ Flatbed',
  reefer: '❄️ Reefer',
  tanker: '🛢️ Tanker',
  step_deck: '⬇️ Step Deck',
  other: '🚚 Otro',
};

function yearsLabel(years, lang) {
  if (years >= 10) return lang === 'es' ? '10+ años' : '10+ yrs';
  if (years === 1) return lang === 'es' ? '1 año' : '1 yr';
  if (years < 1) return lang === 'es' ? 'Menos de 1 año' : '<1 yr';
  return lang === 'es' ? `${years} años` : `${years} yrs`;
}

export default function MemberDirectoryScreen() {
  const navigate = useNavigate();
  const { language } = useAuth();
  const { isFollowing, follow, unfollow } = useFollows();

  const you = mockUsers.find(u => u.id === CURRENT_USER_ID);
  const others = mockUsers
    .filter(u => u.id !== CURRENT_USER_ID)
    .sort((a, b) => new Date(b.last_active_at) - new Date(a.last_active_at));
  const sorted = [you, ...others].filter(Boolean);

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FAFAF8' }}>
      <TopBar />

      <div className="flex-1 overflow-y-auto pb-safe">
        {/* Header */}
        <div className="bg-white px-4 pt-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} className="text-[#0F1A2E]" />
            <h1 className="text-lg font-bold text-gray-900">
              {language === 'es' ? 'Mi Red' : 'My Network'}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            {language === 'es'
              ? `${mockUsers.length} camioneros verificados en tu red`
              : `${mockUsers.length} verified truckers in your network`}
          </p>
        </div>

        {/* Member list */}
        <div className="bg-white mt-3 mx-4 rounded-2xl overflow-hidden border border-gray-100 shadow-soft">
          {sorted.map((user, i) => {
            const isYou = user.id === CURRENT_USER_ID;
            const following = !isYou && isFollowing(user.id);

            return (
              <div
                key={user.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${
                  i < sorted.length - 1 ? 'border-b border-gray-100' : ''
                } ${isYou ? 'bg-[#0F1A2E]/[0.04]' : ''}`}
              >
                {/* Avatar — tappable → profile */}
                <button
                  onClick={() => navigate(isYou ? '/profile' : `/profile/${user.id}`)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left btn-press"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                      isYou ? 'ring-2 ring-[#0F1A2E] ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: user.avatar_color }}
                  >
                    {user.avatar_initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className={`font-semibold text-base ${isYou ? 'text-[#0F1A2E]' : 'text-gray-900'}`}>
                        {user.display_name}
                      </span>
                      <VerifiedBadge size={14} />
                      {isYou && (
                        <span className="text-[10px] bg-[#0F1A2E] text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                          {language === 'es' ? 'Tú' : 'You'}
                        </span>
                      )}
                      {/* Follow indicator */}
                      {following && (
                        <span className="text-[10px] text-blue-600 font-semibold flex-shrink-0">✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{EQUIPMENT_LABELS[user.equipment_type] || user.equipment_type}</span>
                      <span>·</span>
                      <span>{yearsLabel(user.years_in_business, language)}</span>
                    </div>
                  </div>
                </button>

                {/* Right side: invite count (own) or Seguir button (others) */}
                <div className="flex-shrink-0">
                  {isYou && user.invite_codes_remaining > 0 ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
                      {user.invite_codes_remaining} inv.
                    </span>
                  ) : !isYou ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full btn-press transition-all ${
                        following
                          ? 'bg-[#0F1A2E] text-white'
                          : 'border border-[#0F1A2E] text-[#0F1A2E]'
                      }`}
                    >
                      {following
                        ? (language === 'es' ? 'Siguiendo' : 'Following')
                        : (language === 'es' ? 'Seguir' : 'Follow')}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-4" />
      </div>

      <BottomNav />
    </div>
  );
}
