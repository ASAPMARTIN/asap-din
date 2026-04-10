import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Share2, AlertTriangle, CheckCircle, ThumbsUp } from 'lucide-react';
import TopBar from '../components/TopBar';
import ScoreBar from '../components/ScoreBar';
import PollQuestion from '../components/PollQuestion';
import PostCard from '../components/PostCard';
import ShareSheet from '../components/ShareSheet';
import { useBrokers } from '../hooks/useBrokers';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { getUserById } from '../data/mockUsers';

// Traffic light trust score — the first thing you see
function TrustHero({ broker, lang }) {
  const isActive = broker.authority_status === 'AUTHORIZED';
  const paysPct = broker.avg_pays_score != null ? Math.round(broker.avg_pays_score * 100) : null;
  const wouldTotal = (broker.would_use_again_yes || 0) + (broker.would_use_again_no || 0);
  const wouldPct = wouldTotal > 0 ? Math.round((broker.would_use_again_yes / wouldTotal) * 100) : null;

  // Compute overall trust
  let trustLevel, trustLabel, trustColor, trustBg, trustRing, trustEmoji, trustDesc;
  const hasDanger = !isActive || broker.double_broker_flags > 3;
  const avgScore = paysPct != null ? paysPct : null;

  if (!isActive) {
    trustLevel = 'danger';
    trustEmoji = '🔴';
    trustLabel = lang === 'es' ? 'NO TRABAJAR' : 'DO NOT USE';
    trustDesc = lang === 'es' ? 'Autoridad INACTIVA. Puede ser fraude.' : 'INACTIVE authority. Possible fraud.';
    trustColor = 'text-red-600';
    trustBg = 'bg-red-50';
    trustRing = 'ring-red-400';
  } else if (broker.double_broker_flags > 3 || (avgScore !== null && avgScore < 40)) {
    trustLevel = 'danger';
    trustEmoji = '🔴';
    trustLabel = lang === 'es' ? 'PELIGROSO' : 'DANGEROUS';
    trustDesc = broker.double_broker_flags > 3
      ? (lang === 'es' ? `${broker.double_broker_flags} reportes de doble brokerage` : `${broker.double_broker_flags} double brokering reports`)
      : (lang === 'es' ? 'Muy mal historial de pagos' : 'Very poor payment history');
    trustColor = 'text-red-600';
    trustBg = 'bg-red-50';
    trustRing = 'ring-red-400';
  } else if (avgScore !== null && avgScore < 70) {
    trustLevel = 'caution';
    trustEmoji = '🟡';
    trustLabel = lang === 'es' ? 'PRECAUCIÓN' : 'CAUTION';
    trustDesc = lang === 'es' ? 'Historial mixto. Negocia bien antes.' : 'Mixed history. Negotiate carefully.';
    trustColor = 'text-amber-600';
    trustBg = 'bg-amber-50';
    trustRing = 'ring-amber-400';
  } else if (avgScore !== null && avgScore >= 70) {
    trustLevel = 'good';
    trustEmoji = '🟢';
    trustLabel = lang === 'es' ? 'CONFIABLE' : 'RELIABLE';
    trustDesc = lang === 'es' ? 'Buen historial de pagos en la comunidad' : 'Good payment history in the community';
    trustColor = 'text-emerald-600';
    trustBg = 'bg-emerald-50';
    trustRing = 'ring-emerald-400';
  } else {
    trustLevel = 'unknown';
    trustEmoji = '⚪';
    trustLabel = lang === 'es' ? 'SIN DATOS' : 'NO DATA YET';
    trustDesc = lang === 'es' ? 'Sé el primero en votar sobre este broker' : 'Be the first to vote on this broker';
    trustColor = 'text-gray-500';
    trustBg = 'bg-gray-50';
    trustRing = 'ring-gray-300';
  }

  return (
    <div className={`mx-4 mt-4 rounded-2xl p-5 ${trustBg} ring-2 ${trustRing} ${trustLevel === 'danger' && isActive ? 'pulse-danger' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="text-5xl">{trustEmoji}</div>
        <div className="flex-1">
          <p className={`text-2xl font-black tracking-tight ${trustColor}`}>{trustLabel}</p>
          <p className="text-sm text-gray-600 mt-0.5 leading-snug">{trustDesc}</p>
          {avgScore !== null && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-white/80 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${avgScore >= 70 ? 'bg-emerald-500' : avgScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${avgScore}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${trustColor}`}>{avgScore}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrokerProfileScreen() {
  const { id } = useParams();
  const { getBroker } = useBrokers();
  const { language } = useAuth();
  const { posts } = usePosts();
  const [shareOpen, setShareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('scores');

  const broker = getBroker(id);

  if (!broker) {
    return (
      <div className="min-h-dvh bg-gray-50 flex flex-col">
        <TopBar showBack />
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 text-base font-medium">
              {language === 'es' ? 'Broker no encontrado' : 'Broker not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isActive = broker.authority_status === 'AUTHORIZED';
  const paysPct = broker.avg_pays_score != null ? Math.round(broker.avg_pays_score * 100) : null;
  const rateTotal = (broker.rate_accurate_yes || 0) + (broker.rate_accurate_no || 0);
  const ratePct = rateTotal > 0 ? Math.round((broker.rate_accurate_yes / rateTotal) * 100) : null;
  const wouldTotal = (broker.would_use_again_yes || 0) + (broker.would_use_again_no || 0);
  const wouldPct = wouldTotal > 0 ? Math.round((broker.would_use_again_yes / wouldTotal) * 100) : null;

  const mentionedPosts = posts.filter(p => p.body.includes(`[${broker.id}:`));

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      <TopBar showBack />

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Broker header */}
        <div className="bg-white px-4 pt-4 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between mb-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {isActive ? '✓ AUTORIDAD ACTIVA' : '✗ AUTORIDAD INACTIVA'}
            </span>
            <button onClick={() => setShareOpen(true)} className="p-2 text-gray-400 btn-press">
              <Share2 size={18} />
            </button>
          </div>

          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            {broker.dba_name || broker.legal_name}
          </h1>
          {broker.dba_name && (
            <p className="text-sm text-gray-400 mt-0.5">{broker.legal_name}</p>
          )}

          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-gray-500">
            <span className="font-mono font-medium">MC-{broker.mc_number}</span>
            {broker.city && broker.state && <span>{broker.city}, {broker.state}</span>}
            {broker.years_active && <span>{broker.years_active} {language === 'es' ? 'años activo' : 'yrs active'}</span>}
          </div>

          {/* Quick stats row */}
          <div className="flex gap-5 mt-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xl font-bold text-gray-900">{broker.mention_count}</p>
              <p className="text-xs text-gray-400">{language === 'es' ? 'menciones' : 'mentions'}</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{broker.total_poll_votes || 0}</p>
              <p className="text-xs text-gray-400">{language === 'es' ? 'votos' : 'votes'}</p>
            </div>
            {broker.double_broker_flags > 0 && (
              <div>
                <p className="text-xl font-bold text-red-600 flex items-center gap-1">
                  <AlertTriangle size={16} />{broker.double_broker_flags}
                </p>
                <p className="text-xs text-red-400">doble broker</p>
              </div>
            )}
            {broker.avg_payment_days && (
              <div>
                <p className={`text-xl font-bold ${broker.avg_payment_days <= 30 ? 'text-emerald-600' : broker.avg_payment_days <= 45 ? 'text-amber-600' : 'text-red-600'}`}>
                  {Math.round(broker.avg_payment_days)}d
                </p>
                <p className="text-xs text-gray-400">{language === 'es' ? 'pago prom.' : 'avg. pay'}</p>
              </div>
            )}
          </div>
        </div>

        {/* TRAFFIC LIGHT — the hero trust score */}
        <TrustHero broker={broker} lang={language} />

        {/* Tabs */}
        <div className="flex bg-white border-b border-gray-200 mt-4 sticky top-0 z-10">
          {[
            { id: 'scores', label_es: 'Calificaciones', label_en: 'Scores' },
            { id: 'vote', label_es: 'Votar', label_en: 'Vote' },
            { id: 'mentions', label_es: `Menciones (${mentionedPosts.length})`, label_en: `Mentions (${mentionedPosts.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-[#0F1A2E] border-b-2 border-[#0F1A2E]'
                  : 'text-gray-400'
              }`}
            >
              {language === 'es' ? tab.label_es : tab.label_en}
            </button>
          ))}
        </div>

        {/* Scores tab */}
        {activeTab === 'scores' && (
          <div className="bg-white mx-4 mt-4 rounded-2xl p-5 space-y-5 border border-gray-100">
            {paysPct !== null ? (
              <ScoreBar value={broker.avg_pays_score} label={language === 'es' ? '¿Paga a tiempo?' : 'Pays on time?'} color="emerald" />
            ) : (
              <div className="py-3 text-center">
                <p className="text-sm text-gray-400">
                  {language === 'es' ? '¿Paga a tiempo? — Sin votos aún' : 'Pays on time? — No votes yet'}
                </p>
              </div>
            )}

            {broker.avg_payment_days && (
              <div className="flex justify-between items-center py-1">
                <span className="text-base text-gray-700">{language === 'es' ? 'Promedio días de pago' : 'Avg. payment days'}</span>
                <span className={`text-xl font-bold ${broker.avg_payment_days <= 30 ? 'text-emerald-600' : broker.avg_payment_days <= 45 ? 'text-amber-600' : 'text-red-600'}`}>
                  {Math.round(broker.avg_payment_days)} {language === 'es' ? 'días' : 'days'}
                </span>
              </div>
            )}

            {ratePct !== null ? (
              <ScoreBar value={ratePct / 100} label={language === 'es' ? '¿Tarifa exacta?' : 'Accurate rate?'} color="emerald" />
            ) : (
              <div className="py-3 text-center">
                <p className="text-sm text-gray-400">
                  {language === 'es' ? '¿Tarifa exacta? — Sin votos aún' : 'Accurate rate? — No votes yet'}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center py-1">
              <span className="text-base text-gray-700">{language === 'es' ? 'Doble brokerage' : 'Double brokering'}</span>
              <span className={`text-xl font-bold flex items-center gap-1 ${broker.double_broker_flags > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {broker.double_broker_flags > 0 && <AlertTriangle size={16} />}
                {broker.double_broker_flags === 0
                  ? (language === 'es' ? 'Ninguno' : 'None')
                  : `${broker.double_broker_flags} ${language === 'es' ? 'reportes' : 'reports'}`}
              </span>
            </div>

            {wouldPct !== null ? (
              <ScoreBar value={wouldPct / 100} label={language === 'es' ? '¿Lo usarías de nuevo?' : 'Would use again?'} color="emerald" />
            ) : (
              <div className="py-3 text-center">
                <p className="text-sm text-gray-400">
                  {language === 'es' ? '¿Lo usarías de nuevo? — Sin votos aún' : 'Would use again? — No votes yet'}
                </p>
              </div>
            )}

            {/* Empty state CTA */}
            {broker.total_poll_votes === 0 && (
              <div className="mt-2 pt-3 border-t border-gray-100 text-center">
                <p className="text-base font-semibold text-gray-700 mb-1">
                  {language === 'es' ? 'Sé el primero en opinar' : 'Be the first to review'}
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  {language === 'es'
                    ? 'Tu voto ayuda a toda la comunidad a tomar mejores decisiones.'
                    : 'Your vote helps the whole community make better decisions.'}
                </p>
                <button
                  onClick={() => setActiveTab('vote')}
                  className="px-5 py-2.5 bg-[#0F1A2E] text-white text-sm font-bold rounded-xl btn-press"
                >
                  {language === 'es' ? 'Votar ahora' : 'Vote now'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Vote tab */}
        {activeTab === 'vote' && (
          <div className="mx-4 mt-4 fade-in">
            <div className="bg-[#0F1A2E] rounded-2xl px-4 py-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <ThumbsUp size={16} className="text-emerald-400" />
                <p className="text-white font-bold text-base">
                  {language === 'es' ? '¿Has trabajado con ellos?' : 'Have you worked with them?'}
                </p>
              </div>
              <p className="text-white/60 text-sm">
                {language === 'es'
                  ? 'Tu voto es anónimo. Ayuda a la comunidad.'
                  : 'Your vote is anonymous. Help the community.'}
              </p>
            </div>
            <div className="bg-white rounded-2xl px-4 border border-gray-100">
              <PollQuestion broker={broker} questionKey="pays_on_time" lang={language} />
              <PollQuestion broker={broker} questionKey="rate_accuracy" lang={language} />
              <PollQuestion broker={broker} questionKey="double_broker" lang={language} />
              <PollQuestion broker={broker} questionKey="would_use_again" lang={language} />
            </div>
          </div>
        )}

        {/* Mentions tab */}
        {activeTab === 'mentions' && (
          <div className="mt-2 fade-in">
            {mentionedPosts.length === 0 ? (
              <div className="py-16 text-center px-8">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-gray-700 text-base font-semibold mb-1">
                  {language === 'es' ? 'Sin menciones aún' : 'No mentions yet'}
                </p>
                <p className="text-gray-400 text-sm">
                  {language === 'es'
                    ? 'Cuando alguien publique sobre este broker, aparecerá aquí.'
                    : "When someone posts about this broker, it'll appear here."}
                </p>
              </div>
            ) : (() => {
              // Unique authors as peer testimonials
              const authorIds = [...new Set(mentionedPosts.map(p => p.author_id))];
              const authors = authorIds.map(id => getUserById(id)).filter(Boolean).slice(0, 6);
              return (
                <>
                  {/* Peer testimonial cluster */}
                  <div className="bg-white mx-4 mt-3 mb-2 rounded-2xl p-4 border border-gray-100">
                    <div className="flex avatar-stack mb-2">
                      {authors.map(author => (
                        <div
                          key={author.id}
                          className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: author.avatar_color }}
                        >
                          {author.avatar_initials}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {language === 'es'
                        ? `${mentionedPosts.length} miembro${mentionedPosts.length > 1 ? 's' : ''} ha${mentionedPosts.length > 1 ? 'n' : ''} publicado sobre este broker`
                        : `${mentionedPosts.length} member${mentionedPosts.length > 1 ? 's have' : ' has'} posted about this broker`}
                    </p>
                  </div>
                  {mentionedPosts.map(post => <PostCard key={post.id} post={post} />)}
                </>
              );
            })()}
          </div>
        )}
      </div>

      <ShareSheet
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        type="broker"
        id={broker.id}
        title={`${broker.dba_name || broker.legal_name} en ASAP-DIN`}
        lang={language}
      />
    </div>
  );
}
