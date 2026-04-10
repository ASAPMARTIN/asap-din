import { useNavigate } from 'react-router-dom';

export default function UserChip({ userId, name, inline = false }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 bg-[#0F1A2E] text-white text-xs px-2 py-0.5 rounded-full font-semibold btn-press ${inline ? 'mx-0.5' : ''}`}
    >
      <span>👤</span>
      <span>{name}</span>
    </button>
  );
}
