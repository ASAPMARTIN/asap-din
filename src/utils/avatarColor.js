const AVATAR_COLORS = [
  '#1d4ed8', // blue-700
  '#7c3aed', // violet-700
  '#b45309', // amber-700
  '#065f46', // emerald-900
  '#9f1239', // rose-800
  '#c026d3', // fuchsia-600
  '#ea580c', // orange-600
  '#db2777', // pink-600
  '#0891b2', // cyan-600
  '#4f46e5', // indigo-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#dc2626', // red-600
  '#7e22ce', // purple-800
  '#0284c7', // sky-600
  '#be185d', // pink-700
  '#166534', // green-800
  '#78350f', // amber-900
];

export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
