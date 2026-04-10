import { useState } from 'react';
import { useBrokers } from '../hooks/useBrokers';
import ScoreBar from './ScoreBar';

export default function PollQuestion({ broker, questionKey, lang = 'es' }) {
  const { submitVote, getUserVote } = useBrokers();
  const [paymentDays, setPaymentDays] = useState('');
  const existingVote = getUserVote(broker.id, questionKey);

  const questions = {
    pays_on_time: {
      label_es: '¿Te pagó a tiempo?',
      label_en: 'Did they pay on time?',
      type: 'three',
      options_es: ['Sí', 'No', 'A veces'],
      options_en: ['Yes', 'No', 'Sometimes'],
      optionKeys: ['yes', 'no', 'sometimes'],
    },
    rate_accuracy: {
      label_es: '¿La tarifa fue exacta?',
      label_en: 'Was the rate accurate?',
      type: 'two',
      options_es: ['Sí', 'No'],
      options_en: ['Yes', 'No'],
      optionKeys: ['yes', 'no'],
    },
    double_broker: {
      label_es: '¿Sospechas doble brokerage?',
      label_en: 'Do you suspect double brokering?',
      type: 'two',
      options_es: ['Sí', 'No'],
      options_en: ['Yes', 'No'],
      optionKeys: ['yes', 'no'],
    },
    would_use_again: {
      label_es: '¿Lo usarías de nuevo?',
      label_en: 'Would you use them again?',
      type: 'two',
      options_es: ['Sí', 'No'],
      options_en: ['Yes', 'No'],
      optionKeys: ['yes', 'no'],
    },
  };

  const q = questions[questionKey];
  if (!q) return null;

  const label = lang === 'es' ? q.label_es : q.label_en;
  const options = lang === 'es' ? q.options_es : q.options_en;

  const getCount = (optionKey) => {
    if (questionKey === 'pays_on_time') {
      if (optionKey === 'yes') return broker.pays_on_time_yes || 0;
      if (optionKey === 'no') return broker.pays_on_time_no || 0;
      return broker.pays_on_time_sometimes || 0;
    }
    if (questionKey === 'rate_accuracy') {
      return optionKey === 'yes' ? (broker.rate_accurate_yes || 0) : (broker.rate_accurate_no || 0);
    }
    if (questionKey === 'double_broker') {
      return optionKey === 'yes' ? (broker.double_broker_flags || 0) : ((broker.total_poll_votes || 0) - (broker.double_broker_flags || 0));
    }
    if (questionKey === 'would_use_again') {
      return optionKey === 'yes' ? (broker.would_use_again_yes || 0) : (broker.would_use_again_no || 0);
    }
    return 0;
  };

  const totalVotes = q.optionKeys.reduce((sum, k) => sum + getCount(k), 0);

  const handleVote = (optionKey) => {
    if (existingVote) return;
    const days = questionKey === 'pays_on_time' && paymentDays ? parseInt(paymentDays) : null;
    submitVote(broker.id, questionKey, optionKey, days);
  };

  const getOptionColor = (optionKey) => {
    if (questionKey === 'double_broker' && optionKey === 'yes') return 'border-red-400 bg-red-50 text-red-700';
    if (optionKey === 'yes') return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    if (optionKey === 'no') return 'border-red-400 bg-red-50 text-red-700';
    return 'border-amber-400 bg-amber-50 text-amber-700';
  };

  const getSelectedColor = (optionKey) => {
    if (existingVote !== optionKey) return '';
    if (questionKey === 'double_broker' && optionKey === 'yes') return 'ring-2 ring-red-500';
    if (optionKey === 'yes') return 'ring-2 ring-emerald-500';
    if (optionKey === 'no') return 'ring-2 ring-red-500';
    return 'ring-2 ring-amber-500';
  };

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <p className="text-sm font-medium text-gray-800 mb-2">{label}</p>

      <div className="flex gap-2 flex-wrap mb-2">
        {q.optionKeys.map((key, i) => (
          <button
            key={key}
            onClick={() => handleVote(key)}
            disabled={!!existingVote}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${getOptionColor(key)} ${getSelectedColor(key)} ${existingVote ? 'cursor-default' : 'active:scale-95'}`}
          >
            {options[i]}
          </button>
        ))}
      </div>

      {questionKey === 'pays_on_time' && !existingVote && (
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            placeholder={lang === 'es' ? '¿Días de pago?' : 'Days to pay?'}
            value={paymentDays}
            onChange={(e) => setPaymentDays(e.target.value)}
            className="w-36 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="365"
          />
        </div>
      )}

      {existingVote && totalVotes > 0 && (
        <div className="mt-2 space-y-1.5">
          {q.optionKeys.map((key, i) => {
            const count = getCount(key);
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isSelected = existingVote === key;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className={`text-xs w-16 ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                  {options[i]}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      key === 'yes' && questionKey !== 'double_broker' ? 'bg-emerald-500' :
                      key === 'no' ? 'bg-red-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">{pct}%</span>
              </div>
            );
          })}
          <p className="text-xs text-gray-400">{totalVotes} {lang === 'es' ? 'votos' : 'votes'}</p>
        </div>
      )}
    </div>
  );
}
