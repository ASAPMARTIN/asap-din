import { ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VerifiedBadge from './VerifiedBadge';
import BrokerChip from './BrokerChip';
import Avatar from './Avatar';
import { parseMentions } from '../utils/mentionParser';
import { timeAgo } from '../utils/timeAgo';
import { getUserById } from '../data/mockUsers';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';

function ReplyMedia({ media }) {
  if (!media || media.length === 0) return null;

  if (media.length === 1) {
    const item = media[0];
    if (item.type === 'video') {
      return (
        <div className="mt-2 rounded-xl overflow-hidden bg-black">
          <video src={item.url} controls className="w-full max-h-52 object-contain" />
        </div>
      );
    }
    return (
      <div className="mt-2 rounded-xl overflow-hidden">
        <img src={item.url} alt="" className="w-full max-h-56 object-cover" />
      </div>
    );
  }

  return (
    <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
      {media.slice(0, 4).map((item, i) => (
        <img key={i} src={item.url} alt="" className="w-full h-28 object-cover" />
      ))}
    </div>
  );
}

export default function ReplyCard({ reply }) {
  const { upvoteReply, hasUpvotedReply } = usePosts();
  const { language, currentUser } = useAuth();
  const navigate = useNavigate();

  const authorFromMock = getUserById(reply.author_id);
  const author = reply.author_id === currentUser?.id ? currentUser : authorFromMock;
  if (!author) return null;

  const isUpvoted = hasUpvotedReply(reply.id);
  const segments = parseMentions(reply.body);

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/profile/${author.id}`)}
          className="flex-shrink-0 mt-0.5"
        >
          <Avatar user={author} className="w-8 h-8 text-xs" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <button
              onClick={() => navigate(`/profile/${author.id}`)}
              className="text-sm font-semibold text-gray-900 hover:underline"
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

          <ReplyMedia media={reply.media} />

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
