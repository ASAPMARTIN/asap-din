/**
 * Avatar — shows a profile photo if set, otherwise initials on a color background.
 * Pass className to control size (e.g. "w-11 h-11 text-base").
 */
export default function Avatar({ user, className = '' }) {
  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.display_name}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ backgroundColor: user.avatar_color }}
      />
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
      style={{ backgroundColor: user?.avatar_color }}
    >
      {user?.avatar_initials}
    </div>
  );
}
