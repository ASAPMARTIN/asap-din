import { createContext, useContext, useState, useCallback } from 'react';
import { INITIAL_FOLLOWING, MOCK_FOLLOWERS_COUNT } from '../data/mockFollows';
import { CURRENT_USER_ID } from '../data/mockUsers';

const FollowsContext = createContext(null);

export function FollowsProvider({ children }) {
  const [following, setFollowing] = useState(new Set(INITIAL_FOLLOWING));

  const follow = useCallback((userId) => {
    setFollowing(prev => new Set([...prev, userId]));
  }, []);

  const unfollow = useCallback((userId) => {
    setFollowing(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  const isFollowing = useCallback((userId) => following.has(userId), [following]);

  // How many users the current user is following
  const getFollowingCount = useCallback(() => following.size, [following]);

  // How many people follow a given user
  // For the current user: adjust the static count by changes (not tracked precisely in mock)
  const getFollowersCount = useCallback((userId) => {
    const base = MOCK_FOLLOWERS_COUNT[userId] ?? 0;
    return base;
  }, []);

  // List of user IDs the current user follows
  const getFollowingIds = useCallback(() => [...following], [following]);

  return (
    <FollowsContext.Provider value={{
      following,
      follow,
      unfollow,
      isFollowing,
      getFollowingCount,
      getFollowersCount,
      getFollowingIds,
    }}>
      {children}
    </FollowsContext.Provider>
  );
}

export function useFollows() {
  const ctx = useContext(FollowsContext);
  if (!ctx) throw new Error('useFollows must be used within FollowsProvider');
  return ctx;
}
