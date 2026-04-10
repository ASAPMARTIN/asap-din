import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ChevronRight, AlertTriangle } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useBrokers } from '../hooks/useBrokers';
import { useAuth } from '../hooks/useAuth';
import { mockUsers } from '../data/mockUsers';

function TrustBadge({ score, isActive, flags }) {
  if (!isActive) {
    return (
      <span className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        ✗ INACTIVO
      </span>
    );
  }
  if (score === null || score === undefined) {
    return (
      <span className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500">
        Sin datos
      </span>
    );
  }
  const pct = Math.round(score * 100);
  if (flags > 3 || pct < 40) {
    return (
      <span className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        🔴 {pct}%
      </span>
    );
  }
  if (pct < 70) {
    return (
      <span className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
        🟡 {pct}%
      </span>
    );
  }
  return (
    <span className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      🟢 {pct}%
    </span>
  );
}

function BrokerRow({ broker, lang, onClick }) {
  const isActive = broker.authority_status === 'AUTHORIZED';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-100 card-tap text-left active:bg-gray-50"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-base text-gray-900 truncate">{broker.dba_name || broker.legal_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
          <span className="font-mono">MC-{broker.mc_number}</span>
          {broker.city && broker.state && (
            <>
              <span>·</span>
              <span>{broker.city}, {broker.state}</span>
            </>
          )}
          <span>·</span>
          <span>{broker.mention_count} {lang === 'es' ? 'menciones' : 'mentions'}</span>
          {broker.double_broker_flags > 0 && (
            <>
              <span>·</span>
              <span className="text-red-500 font-semibold flex items-center gap-0.5">
                <AlertTriangle size={12} />
                {broker.double_broker_flags} doble
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <TrustBadge score={broker.avg_pays_score} isActive={isActive} flags={broker.double_broker_flags} />
        <ChevronRight size={16} className="text-gray-300" />
      </div>
    </button>
  );
}

export default function BrokerSearchScreen() {
  const navigate = useNavigate();
  const { language } = useAuth();
  const { searchBrokers, brokers } = useBrokers();
  const [query, setQuery] = useState('');

  const results = query.length >= 2 ? searchBrokers(query) : [];
  const showResults = query.length >= 2;
  const noResults = showResults && results.length === 0;

  const topBrokers = [...brokers].sort((a, b) => b.mention_count - a.mention_count).slice(0, 10);
  const memberCount = mockUsers.length;

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FAFAF8' }}>
      <TopBar />

      <div className="flex-1 overflow-y-auto pb-safe">
        {/* Hero search bar — community framing */}
        <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100">
          <p className="text-xl font-bold text-gray-900 mb-1">
            {language === 'es' ? 'Verificar un Broker' : 'Verify a Broker'}
          </p>
          <p className="text-sm text-gray-400 mb-1">
            {language === 'es'
              ? `Inteligencia colectiva de ${memberCount} camioneros verificados`
              : `Collective intelligence from ${memberCount} verified truckers`}
          </p>
          <p className="text-xs text-emerald-600 font-medium mb-4">
            {language === 'es'
              ? `La comunidad ha reportado ${brokers.length} brokers`
              : `The community has reported ${brokers.length} brokers`}
          </p>
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={language === 'es' ? 'Nombre del broker o número MC...' : 'Broker name or MC number...'}
              autoFocus
              className="w-full pl-12 pr-12 py-4 bg-gray-100 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-400"
            />
            {query.length > 0 && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center btn-press"
              >
                <X size={14} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* No results */}
        {noResults && (
          <div className="px-6 py-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-700 text-lg font-semibold mb-1">
              {language === 'es' ? 'Broker no encontrado' : 'Broker not found'}
            </p>
            <p className="text-gray-400 text-sm">
              {language === 'es'
                ? 'Verifica el número MC en fmcsa.dot.gov'
                : 'Check the MC number at fmcsa.dot.gov'}
            </p>
          </div>
        )}

        {/* Search results */}
        {showResults && results.length > 0 && (
          <div className="bg-white mt-2 fade-in">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-medium">
                {results.length} {language === 'es' ? 'resultados' : 'results'}
              </span>
            </div>
            {results.map(broker => (
              <BrokerRow
                key={broker.id}
                broker={broker}
                lang={language}
                onClick={() => navigate(`/broker/${broker.id}`)}
              />
            ))}
          </div>
        )}

        {/* Default: legend + top brokers */}
        {!showResults && (
          <div className="px-4 pt-4">
            {/* Color legend */}
            <div className="flex gap-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🟢</span>
                <span className="text-xs text-gray-500 font-medium">{language === 'es' ? 'Confiable' : 'Reliable'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">🟡</span>
                <span className="text-xs text-gray-500 font-medium">{language === 'es' ? 'Con precaución' : 'Caution'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">🔴</span>
                <span className="text-xs text-gray-500 font-medium">{language === 'es' ? 'Peligroso' : 'Dangerous'}</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {language === 'es' ? 'Más mencionados por la comunidad' : 'Most mentioned by the community'}
            </p>

            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-soft">
              {topBrokers.map(broker => (
                <BrokerRow
                  key={broker.id}
                  broker={broker}
                  lang={language}
                  onClick={() => navigate(`/broker/${broker.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
