export default function ThreadTabs({ activeThread, onChange, lang = 'es' }) {
  const tabs = [
    {
      id: 'alertas_brokers',
      label: lang === 'es' ? '🚨 Alertas de Brokers' : '🚨 Broker Alerts',
      activeColor: 'text-red-600 border-red-500',
    },
    {
      id: 'tarifas_rutas',
      label: lang === 'es' ? '💰 Tarifas y Rutas' : '💰 Rates & Routes',
      activeColor: 'text-blue-600 border-blue-500',
    },
  ];

  return (
    <div className="flex bg-white border-b border-gray-200">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-3.5 text-sm font-bold transition-all ${
            activeThread === tab.id
              ? `${tab.activeColor} border-b-[3px]`
              : 'text-gray-400 border-b-[3px] border-transparent'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
