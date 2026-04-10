import { useEffect, useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';

export default function PollBlock({ post, stopPropagation = true }) {
  const { votePoll } = usePosts();
  const { language } = useAuth();
  const { poll_question, poll_options, poll_total_votes, poll_user_vote } = post;

  // Animate bars in when results appear
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    if (!poll_user_vote) { setAnimated(false); return; }
    const raf = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(raf);
  }, [poll_user_vote]);

  const handleVote = (e, optionId) => {
    if (stopPropagation) e.stopPropagation();
    if (poll_user_vote) return;
    votePoll(post.id, optionId);
  };

  const winnerVotes = Math.max(...poll_options.map(o => o.vote_count));

  return (
    <div
      className="mt-3 rounded-xl border border-gray-200 overflow-hidden bg-gray-50"
      onClick={stopPropagation ? e => e.stopPropagation() : undefined}
    >
      {/* Poll question */}
      {poll_question && (
        <div className="px-3.5 pt-3 pb-2">
          <p className="text-sm font-semibold text-gray-900 leading-snug">{poll_question}</p>
        </div>
      )}

      {/* Options / Results */}
      {!poll_user_vote ? (
        <div className="border-t border-gray-200">
          {poll_options.map((opt, i) => (
            <button
              key={opt.id}
              onClick={(e) => handleVote(e, opt.id)}
              className={`w-full flex items-center px-3.5 py-2.5 text-left btn-press hover:bg-white transition-colors text-sm font-medium text-gray-800 ${
                i < poll_options.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="px-3.5 pt-1 pb-3 space-y-2">
          {poll_options.map(opt => {
            const pct = poll_total_votes > 0 ? Math.round((opt.vote_count / poll_total_votes) * 100) : 0;
            const isVoted = poll_user_vote === opt.id;
            const isWinner = opt.vote_count === winnerVotes && winnerVotes > 0;
            return (
              <div key={opt.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm leading-tight ${isVoted ? 'font-bold text-[#0F1A2E]' : 'font-medium text-gray-600'}`}>
                    {isVoted ? '✓ ' : ''}{opt.text}
                  </span>
                  <span className={`text-sm font-bold ml-2 flex-shrink-0 ${isVoted ? 'text-[#0F1A2E]' : 'text-gray-400'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-[width] duration-500 ease-out ${
                      isWinner ? 'bg-[#0F1A2E]' : 'bg-gray-300'
                    }`}
                    style={{ width: animated ? `${pct}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: vote count */}
      <div className={`px-3.5 py-2 border-t border-gray-200 bg-white`}>
        <span className="text-xs text-gray-400">
          {poll_total_votes} {language === 'es' ? 'votos' : 'votes'}
          {!poll_user_vote && (
            <span className="ml-1 text-gray-300">· {language === 'es' ? 'Toca para votar' : 'Tap to vote'}</span>
          )}
        </span>
      </div>
    </div>
  );
}
