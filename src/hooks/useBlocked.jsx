import { createContext, useContext, useState, useCallback } from 'react';

const BlockedContext = createContext(null);

export function BlockedProvider({ children }) {
  const [blockedSet, setBlockedSet] = useState(new Set());

  const blockUser = useCallback((userId) => {
    setBlockedSet(prev => new Set([...prev, userId]));
  }, []);

  const unblockUser = useCallback((userId) => {
    setBlockedSet(prev => {
      const n = new Set(prev);
      n.delete(userId);
      return n;
    });
  }, []);

  const isBlocked = useCallback((userId) => blockedSet.has(userId), [blockedSet]);

  const getBlockedList = useCallback(() => [...blockedSet], [blockedSet]);

  return (
    <BlockedContext.Provider value={{ blockUser, unblockUser, isBlocked, getBlockedList }}>
      {children}
    </BlockedContext.Provider>
  );
}

export function useBlocked() {
  const ctx = useContext(BlockedContext);
  if (!ctx) throw new Error('useBlocked must be used within BlockedProvider');
  return ctx;
}
