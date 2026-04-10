import { ThumbsUp } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import BrokerChip from './BrokerChip';
import { parseMentions } from '../utils/mentionParser';
import { timeAgo } from '../utils/timeAgo';
import { getAvatarColor, getInitials } from '../utils/avatarColor';
import { getUserById } from '../data/mockUsers';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function ReplyCard({ reply }) {
  const { upvoteReply, hasUpvotedReply } = usePosts();
  const { language } = useAuth();
  const navigate = useNavigate();
  const author = getUserById(reply.author_id);
  if (!author) return null;

  const avatarColor = author.avatar_color || getAvatarColor(author.display_name);
  const isUpvoted = hasUpvotedReply(reply.id);
  const segments = parseMentions(reply.body);

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/profile/${author.id}`)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
          style={{ backgroundColor: avatarColor }}
        >
          {author.avatar_initials || getInitials(author.display_name)}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <button
              onClick={() => navigate(`/profile/${author.id}`)}
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              {author.display_name}
            </button>
            <VerifiedBadge size={12} />
            <span className="text-xs text-gray-400">{timeAgo(reply.created_at, language)}</span>
          </div>

          <p className="text-sm text-gray-800 leading-relaxed">
            {segments.map((seg, i) => (
              seg.type === 'mention'
                ? <BrokerChip key={i} brokerId={seg.brokerId} brokerName={seg.brokerName} inline />
                : <span key={i}>{seg.content}</span>
            ))}
          </p>

          <button
            onClick={() => upvoteReply(reply.id)}
            className={`flex items-center gap-1 text-xs mt-1.5 transition-colors ${
              isUpvoted ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ThumbsUp size={12} fill={isUpvoted ? 'currentColor' : 'none'} />
            <span>{reply.upvote_count}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
