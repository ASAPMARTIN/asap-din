import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockUsers, CURRENT_USER_ID } from '../data/mockUsers';
import { useFollows } from './useFollows';
import { useBlocked } from './useBlocked';
import { mockPosts } from '../data/mockPosts';

const SuggestionsContext = createContext(null);

const CURRENT_USER = mockUsers.find(u => u.id === CURRENT_USER_ID);
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function scoreUser(candidate, currentUser, followingSet, blockedSet) {
  let score = 0;

  // +3 if same equipment type
  if (candidate.equipment_type === currentUser.equipment_type) score += 3;

  // +2 per mutual follow (users both follow)
  // For mock: check users in INITIAL_FOLLOWING that candidate also follows
  // We approximate: if candidate id is in the mockFollows data
  // Real: we'd check candidate's following list. For mock, approximate with random seed.
  const commonFollows = [...followingSet].filter(fId => {
    // Approximate mutual: use deterministic hash from candidate+followedUser ids
    const hash = (candidate.id.charCodeAt(candidate.id.length - 1) + fId.charCodeAt(fId.length - 1)) % 3;
    return hash === 0;
  });
  score += commonFollows.length * 2;

  // +1 if they posted in the last 7 days
  const now = new Date();
  const recentPost = mockPosts.some(p =>
    p.author_id === candidate.id &&
    (now - new Date(p.created_at)) < SEVEN_DAYS_MS
  );
  if (recentPost) score += 1;

  return score;
}

export function SuggestionsProvider({ children }) {
  const { following, isFollowing, follow } = useFollows();
  const { isBlocked } = useBlocked();
  const [dismissed, setDismissed] = useState(new Set());
  const [manualFollowed, setManualFollowed] = useState(new Set());

  const suggestions = useMemo(() => {
    const currentUser = CURRENT_USER;
    if (!currentUser) return [];

    return mockUsers
      .filter(u =>
        u.id !== CURRENT_USER_ID &&
        !isFollowing(u.id) &&
        !isBlocked(u.id) &&
        !dismissed.has(u.id) &&
        !manualFollowed.has(u.id)
      )
      .map(u => ({ user: u, score: scoreUser(u, currentUser, following, new Set()) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ user }) => user);
  }, [following, isFollowing, isBlocked, dismissed, manualFollowed]);

  const dismissSuggestion = useCallback((userId) => {
    setDismissed(prev => new Set([...prev, userId]));
  }, []);

  const followFromSuggestion = useCallback((userId) => {
    follow(userId);
    setManualFollowed(prev => new Set([...prev, userId]));
  }, [follow]);

  return (
    <SuggestionsContext.Provider value={{ suggestions, dismissSuggestion, followFromSuggestion }}>
      {children}
    </SuggestionsContext.Provider>
  );
}

export function useSuggestions() {
  const ctx = useContext(SuggestionsContext);
  if (!ctx) throw new Error('useSuggestions must be used within SuggestionsProvider');
  return ctx;
}
