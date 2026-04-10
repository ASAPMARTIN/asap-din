// Current user (u-001) follows these 7 members by default
export const INITIAL_FOLLOWING = new Set([
  'u-002', 'u-003', 'u-005', 'u-007', 'u-010', 'u-013', 'u-016',
]);

// Static mock follower counts per user
// (approximate counts for a community of 18 — not dynamically recomputed)
export const MOCK_FOLLOWERS_COUNT = {
  'u-001': 5,
  'u-002': 6,
  'u-003': 10,
  'u-004': 2,
  'u-005': 8,
  'u-006': 4,
  'u-007': 6,
  'u-008': 2,
  'u-009': 5,
  'u-010': 12,
  'u-011': 3,
  'u-012': 5,
  'u-013': 9,
  'u-014': 4,
  'u-015': 2,
  'u-016': 7,
  'u-017': 5,
  'u-018': 3,
};
