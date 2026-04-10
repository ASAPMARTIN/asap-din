import { createContext, useContext, useState, useCallback } from 'react';
import { CURRENT_USER_ID } from '../data/mockUsers';

const ProfileViewsContext = createContext(null);

// Initial mock view counts
const INITIAL_VIEW_COUNTS = {
  'u-001': 7,
  'u-002': 14,
  'u-003': 20,
  'u-004': 3,
  'u-005': 12,
  'u-006': 9,
  'u-007': 11,
  'u-008': 2,
  'u-009': 8,
  'u-010': 18,
  'u-011': 5,
  'u-012': 10,
  'u-013': 16,
  'u-014': 7,
  'u-015': 4,
  'u-016': 13,
  'u-017': 9,
  'u-018': 6,
};

function buildInitialMap() {
  const map = new Map();
  for (const [userId, count] of Object.entries(INITIAL_VIEW_COUNTS)) {
    map.set(userId, count);
  }
  return map;
}

export function ProfileViewsProvider({ children }) {
  const [viewCounts, setViewCounts] = useState(buildInitialMap);
  const [viewedThisSession, setViewedThisSession] = useState(new Set());

  const recordView = useCallback((userId) => {
    if (userId === CURRENT_USER_ID) return;
    if (viewedThisSession.has(userId)) return;
    setViewCounts(prev => {
      const next = new Map(prev);
      next.set(userId, (next.get(userId) || 0) + 1);
      return next;
    });
    setViewedThisSession(prev => new Set([...prev, userId]));
  }, [viewedThisSession]);

  const getViewCount = useCallback((userId) => {
    return viewCounts.get(userId) || 0;
  }, [viewCounts]);

  return (
    <ProfileViewsContext.Provider value={{ viewCounts, recordView, getViewCount }}>
      {children}
    </ProfileViewsContext.Provider>
  );
}

export function useProfileViews() {
  const ctx = useContext(ProfileViewsContext);
  if (!ctx) throw new Error('useProfileViews must be used within ProfileViewsProvider');
  return ctx;
}
