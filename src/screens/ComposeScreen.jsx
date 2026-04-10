import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Pin, BarChart2, Plus, Trash2 } from 'lucide-react';
import BrokerMentionInput from '../components/BrokerMentionInput';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { getAvatarColor, getInitials } from '../utils/avatarColor';

const THREADS = [
  {
    id: 'alertas_brokers',
    label_es: 'Alertas de Brokers',
    label_en: 'Broker Alerts',
    emoji: '🚨',
    activePill: 'bg-red-600 text-white',
    inactivePill: 'bg-gray-100 text-gray-600',
  },
  {
    id: 'tarifas_rutas',
    label_es: 'Tarifas y Rutas',
    label_en: 'Rates & Routes',
    emoji: '💰',
    activePill: 'bg-blue-600 text-white',
    inactivePill: 'bg-gray-100 text-gray-600',
  },
];

export default function ComposeScreen({ onClose, defaultThread = null }) {
  const navigate = useNavigate();
  const { createPostWithPoll } = usePosts();
  const { currentUser, language } = useAuth();
  const handleClose = onClose || (() => navigate(-1));
  const [thread, setThread] = useState(defaultThread);
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Poll builder
  const [pollOpen, setPollOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const canPublish = thread && body.trim().length > 0;
  const pollValid = !pollOpen || (pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2);

  const handlePublish = () => {
    if (!canPublish || !pollValid) return;
    setSubmitting(true);
    setTimeout(() => {
      const pollData = pollOpen && pollQuestion.trim()
        ? { question: pollQuestion.trim(), options: pollOptions.filter(o => o.trim()) }
        : null;
      createPostWithPoll(thread, body.trim(), pinned, pollData);
      handleClose();
    }, 400);
  };

  const addOption = () => {
    if (pollOptions.length < 4) setPollOptions(prev => [...prev, '']);
  };

  const removeOption = (i) => {
    if (pollOptions.length <= 2) return;
    setPollOptions(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateOption = (i, val) => {
    setPollOptions(prev => prev.map((o, idx) => idx === i ? val : o));
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 safe-top">
        <button onClick={handleClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 btn-press">
          <X size={22} />
        </button>
        <span className="font-bold text-base text-gray-900">
          {language === 'es' ? 'Nueva publicación' : 'New post'}
        </span>
        <button
          onClick={handlePublish}
          disabled={!canPublish || !pollValid || submitting}
          className={`font-bold px-5 py-2 rounded-full text-sm transition-all btn-press ${
            canPublish && pollValid
              ? 'bg-[#0F1A2E] text-white'
              : 'bg-gray-100 text-gray-300'
          }`}
        >
          {submitting ? '...' : (language === 'es' ? 'Publicar' : 'Post')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Thread pills */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
            {language === 'es' ? 'Publicar en:' : 'Post to:'}
          </p>
          <div className="flex gap-2">
            {THREADS.map(t => {
              const isSelected = thread === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setThread(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all btn-press ${
                    isSelected ? t.activePill : t.inactivePill
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{language === 'es' ? t.label_es : t.label_en}</span>
                  {isSelected && <span className="text-xs opacity-80">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Author + hero textarea */}
        <div className="px-4 pt-5">
          {currentUser && (
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: currentUser.avatar_color || getAvatarColor(currentUser.display_name) }}
              >
                {currentUser.avatar_initials || getInitials(currentUser.display_name)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base text-gray-900 mb-3">{currentUser.display_name}</p>
                <BrokerMentionInput
                  value={body}
                  onChange={setBody}
                  placeholder={
                    thread === 'alertas_brokers'
                      ? (language === 'es' ? '¿Qué broker quieres reportar? Usa @ para mencionarlo...' : 'Which broker to report? Use @ to mention...')
                      : thread === 'tarifas_rutas'
                      ? (language === 'es' ? '¿Qué tarifa o ruta quieres compartir?' : 'What rate or route?')
                      : (language === 'es' ? 'Elige un hilo arriba para empezar...' : 'Choose a thread above...')
                  }
                  lang={language}
                  className="text-lg min-h-[140px]"
                />
              </div>
            </div>
          )}

          {/* @ hint */}
          <p className="text-xs text-gray-400 mt-3 ml-14">
            {language === 'es' ? '@ para mencionar un broker' : '@ to mention a broker'}
          </p>
        </div>

        {/* Poll builder — appears when toggled */}
        {pollOpen && (
          <div className="mx-4 mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 fade-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <BarChart2 size={16} className="text-[#0F1A2E]" />
                {language === 'es' ? 'Encuesta' : 'Poll'}
              </p>
              <button
                onClick={() => { setPollOpen(false); setPollQuestion(''); setPollOptions(['', '']); }}
                className="text-gray-400 hover:text-gray-600 btn-press"
              >
                <X size={16} />
              </button>
            </div>

            {/* Question */}
            <input
              type="text"
              value={pollQuestion}
              onChange={e => setPollQuestion(e.target.value)}
              placeholder={language === 'es' ? 'Pregunta de la encuesta...' : 'Poll question...'}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white mb-2.5"
              autoFocus
            />

            {/* Options */}
            <div className="space-y-2">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-semibold w-5 flex-shrink-0">{i + 1}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    placeholder={language === 'es' ? `Opción ${i + 1}` : `Option ${i + 1}`}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => removeOption(i)}
                      className="text-gray-400 hover:text-red-500 btn-press flex-shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add option */}
            {pollOptions.length < 4 && (
              <button
                onClick={addOption}
                className="flex items-center gap-1.5 text-sm text-blue-600 font-medium mt-2.5 btn-press"
              >
                <Plus size={15} />
                {language === 'es' ? 'Agregar opción' : 'Add option'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer: pin + poll toggles */}
      <div className="border-t border-gray-100 px-4 py-3 pb-safe flex items-center gap-4">
        <button
          onClick={() => setPinned(!pinned)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors btn-press ${pinned ? 'text-[#0F1A2E]' : 'text-gray-400'}`}
        >
          <Pin size={18} fill={pinned ? 'currentColor' : 'none'} />
          <span>{language === 'es' ? 'Fijar' : 'Pin'}</span>
        </button>

        <div className="h-5 w-px bg-gray-200" />

        <button
          onClick={() => setPollOpen(!pollOpen)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors btn-press ${pollOpen ? 'text-[#0F1A2E]' : 'text-gray-400'}`}
        >
          <BarChart2 size={18} />
          <span>{language === 'es' ? 'Encuesta' : 'Poll'}</span>
        </button>
      </div>
    </div>
  );
}
