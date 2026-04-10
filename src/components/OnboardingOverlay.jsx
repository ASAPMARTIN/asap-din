import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function OnboardingOverlay({ onOpenCompose }) {
  const navigate = useNavigate();
  const { dismissOnboarding } = useAuth();

  const actions = [
    {
      emoji: '🔍',
      title: 'Verificar broker',
      desc: 'Consulta el historial de cualquier broker antes de aceptar carga.',
      onClick: () => { dismissOnboarding(); navigate('/search'); },
    },
    {
      emoji: '🚨',
      title: 'Leer alertas',
      desc: 'Ve qué brokers están reportados por la comunidad.',
      onClick: () => dismissOnboarding(),
    },
    {
      emoji: '✍️',
      title: 'Compartir experiencia',
      desc: 'Comparte una alerta o tarifa para ayudar a otros camioneros.',
      onClick: () => { dismissOnboarding(); if (onOpenCompose) onOpenCompose(); },
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full bg-white rounded-3xl p-6 fade-in" style={{ maxWidth: '380px' }}>
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¡Bienvenido a ASAP-DIN!</h2>
          <p className="text-sm text-gray-500">Aquí van 3 cosas que puedes hacer ahora:</p>
        </div>

        <div className="space-y-3 mb-6">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="w-full flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl text-left btn-press hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl flex-shrink-0">{action.emoji}</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">{action.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={dismissOnboarding}
          className="w-full py-3.5 bg-[#0F1A2E] text-white font-bold rounded-2xl btn-press"
        >
          Empezar
        </button>
      </div>
    </div>
  );
}
