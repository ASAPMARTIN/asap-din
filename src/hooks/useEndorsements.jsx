import { createContext, useContext, useState, useCallback } from 'react';

const EndorsementsContext = createContext(null);

export const ENDORSEMENT_TYPES = {
  punctual: '⏱️ Puntual',
  reliable: '🤝 Confiable',
  communicator: '💬 Buen comunicador',
  expert: '🔧 Experto',
  recommended: '⭐ Recomendado',
};

// Initial mock endorsement counts for all 18 users
const INITIAL_COUNTS = {
  'u-001': { punctual: 8, reliable: 15, communicator: 4, expert: 11, recommended: 9 },
  'u-002': { punctual: 6, reliable: 12, communicator: 7, expert: 8, recommended: 14 },
  'u-003': { punctual: 3, reliable: 5, communicator: 9, expert: 6, recommended: 4 },
  'u-004': { punctual: 2, reliable: 4, communicator: 3, expert: 2, recommended: 1 },
  'u-005': { punctual: 10, reliable: 14, communicator: 5, expert: 16, recommended: 12 },
  'u-006': { punctual: 7, reliable: 9, communicator: 6, expert: 8, recommended: 11 },
  'u-007': { punctual: 5, reliable: 11, communicator: 8, expert: 13, recommended: 7 },
  'u-008': { punctual: 1, reliable: 2, communicator: 4, expert: 1, recommended: 3 },
  'u-009': { punctual: 4, reliable: 8, communicator: 3, expert: 9, recommended: 6 },
  'u-010': { punctual: 12, reliable: 18, communicator: 14, expert: 10, recommended: 16 },
  'u-011': { punctual: 3, reliable: 6, communicator: 5, expert: 4, recommended: 5 },
  'u-012': { punctual: 9, reliable: 13, communicator: 7, expert: 10, recommended: 11 },
  'u-013': { punctual: 11, reliable: 17, communicator: 6, expert: 20, recommended: 15 },
  'u-014': { punctual: 6, reliable: 8, communicator: 9, expert: 7, recommended: 9 },
  'u-015': { punctual: 2, reliable: 3, communicator: 2, expert: 2, recommended: 4 },
  'u-016': { punctual: 8, reliable: 10, communicator: 11, expert: 9, recommended: 8 },
  'u-017': { punctual: 9, reliable: 14, communicator: 6, expert: 12, recommended: 10 },
  'u-018': { punctual: 3, reliable: 5, communicator: 4, expert: 3, recommended: 5 },
};

// Build initial Map
function buildInitialCounts() {
  const map = new Map();
  for (const [userId, counts] of Object.entries(INITIAL_COUNTS)) {
    map.set(userId, { ...counts });
  }
  return map;
}

export function EndorsementsProvider({ children }) {
  const [endorsementCounts, setEndorsementCounts] = useState(buildInitialCounts);
  // myEndorsements: Map<userId, Set<type>>
  const [myEndorsements, setMyEndorsements] = useState(new Map());

  const getEndorsements = useCallback((userId) => {
    return endorsementCounts.get(userId) || { punctual: 0, reliable: 0, communicator: 0, expert: 0, recommended: 0 };
  }, [endorsementCounts]);

  const hasEndorsed = useCallback((userId, type) => {
    return myEndorsements.get(userId)?.has(type) || false;
  }, [myEndorsements]);

  const endorse = useCallback((userId, type) => {
    setEndorsementCounts(prev => {
      const next = new Map(prev);
      const current = next.get(userId) || { punctual: 0, reliable: 0, communicator: 0, expert: 0, recommended: 0 };
      next.set(userId, { ...current, [type]: (current[type] || 0) + 1 });
      return next;
    });
    setMyEndorsements(prev => {
      const next = new Map(prev);
      const userSet = new Set(next.get(userId) || []);
      userSet.add(type);
      next.set(userId, userSet);
      return next;
    });
  }, []);

  const unendorse = useCallback((userId, type) => {
    setEndorsementCounts(prev => {
      const next = new Map(prev);
      const current = next.get(userId) || { punctual: 0, reliable: 0, communicator: 0, expert: 0, recommended: 0 };
      next.set(userId, { ...current, [type]: Math.max(0, (current[type] || 0) - 1) });
      return next;
    });
    setMyEndorsements(prev => {
      const next = new Map(prev);
      const userSet = new Set(next.get(userId) || []);
      userSet.delete(type);
      next.set(userId, userSet);
      return next;
    });
  }, []);

  return (
    <EndorsementsContext.Provider value={{
      endorsementCounts,
      myEndorsements,
      endorse,
      unendorse,
      hasEndorsed,
      getEndorsements,
    }}>
      {children}
    </EndorsementsContext.Provider>
  );
}

export function useEndorsements() {
  const ctx = useContext(EndorsementsContext);
  if (!ctx) throw new Error('useEndorsements must be used within EndorsementsProvider');
  return ctx;
}
