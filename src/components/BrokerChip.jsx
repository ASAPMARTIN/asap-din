import { useNavigate } from 'react-router-dom';

export default function BrokerChip({ brokerId, brokerName, inline = true }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.stopPropagation();
    navigate(`/broker/${brokerId}`);
  };

  if (inline) {
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded-full text-sm font-semibold bg-blue-600 text-white shadow-sm active:scale-95 transition-transform"
        style={{ verticalAlign: 'middle' }}
      >
        @{brokerName}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-600 text-white shadow-sm btn-press"
    >
      @{brokerName}
    </button>
  );
}
