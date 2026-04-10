import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Repeat2, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import BrokerChip from './BrokerChip';
import ShareSheet from './ShareSheet';
import PollBlock from './PollBlock';
import Avatar from './Avatar';
import { parseMentions } from '../utils/mentionParser';
import { timeAgo } from '../utils/timeAgo';
import { getUserById } from '../data/mockUsers';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { useFollows } from '../hooks/useFollows';

const EQUIPMENT_LABELS = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
};

const THREAD_COLORS = {
  alertas_brokers: 'border-l-red-400',
  tarifas_rutas: 'border-l-blue-400',
};

function MentionText({ body, truncated = false }) {
  const [expanded, setExpanded] = useState(false);
  const segments = parseMentions(body);
  const shouldTruncate = truncated && !expanded;

  return (
    <div>
      <p className={`text-base text-gray-800 leading-relaxed ${shouldTruncate ? 'line-clamp-4' : ''}`}>
        {segments.map((seg, i) =>
          seg.type === 'mention'
            ? <BrokerChip key={i} brokerId={seg.brokerId} brokerName={seg.brokerName} inline />
            : <span key={i}>{seg.content}</span>
        )}
      </p>
      {truncated && body.length > 200 && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="text-sm text-blue-600 font-medium mt-1.5 flex items-center gap-0.5"
        >
          {expanded ? 'ver menos' : 'ver más'}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </div>
  );
}

function MediaGrid({ media }) {
  if (!media || media.length === 0) return null;

  if (media.length === 1) {
    const item = media[0];
    if (item.type === 'video') {
      return (
        <div className="mt-3 rounded-2xl overflow-hidden bg-black">
          <video
            src={item.url}
            controls
            className="w-full max-h-72 object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      );
    }
    return (
      <div className="mt-3 rounded-2xl overflow-hidden">
        <img src={item.url} alt="" className="w-full max-h-80 object-cover" />
      </div>
    );
  }

  if (media.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl overflow-hidden">
        {media.map((item, i) => (
          <img key={i} src={item.url} alt="" className="w-full h-44 object-cover" />
        ))}
      </div>
    );
  }

  if (media.length === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl overflow-hidden" style={{ gridTemplateRows: 'auto auto' }}>
        <img src={media[0].url} alt="" className="w-full object-cover row-span-2" style={{ height: '192px' }} />
        <img src={media[1].url} alt="" className="w-full object-cover" style={{ height: '94px' }} />
        <img src={media[2].url} alt="" className="w-full object-cover" style={{ height: '94px' }} />
      </div>
    );
  }

  // 4 images
  return (
    <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl overflow-hidden">
      {media.map((item, i) => (
        <img key={i} src={item.url} alt="" className="w-full h-36 object-cover" />
      ))}
    </div>
  );
}

export default function PostCard({ post, onClick }) {
  const navigate = useNavigate();
  const { upvotePost, hasUpvotedPost, repostPost, hasReposted } = usePosts();
  const { language, currentUser } = useAuth();
  const { isFollowing } = useFollows();
  const [shareOpen, setShareOpen] = useState(false);

  // Use live currentUser data for own posts so profile edits reflect immediately
  const authorFromMock = getUserById(post.author_id);
  const author = (post.author_id === currentUser?.id) ? currentUser : authorFromMock;
  if (!author) return null;

  const isUpvoted = hasUpvotedPost(post.id);
  const isReposted = hasReposted(post.id);
  const threadBorder = THREAD_COLORS[post.thread] || 'border-l-gray-200';
  const following = isFollowing(author.id);

  const handleCardClick = () => {
    if (onClick) onClick(post);
    else navigate(`/post/${post.id}`);
  };

  const handleUpvote = (e) => {
    e.stopPropagation();
    upvotePost(post.id);
  };

  const handleRepost = (e) => {
    e.stopPropagation();
    repostPost(post.id);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShareOpen(true);
  };

  return (
    <>
      <div
        className={`bg-white border-b border-gray-100 px-4 pt-5 pb-4 card-tap cursor-pointer border-l-4 ${threadBorder} fade-in`}
        onClick={handleCardClick}
      >
        {/* Author row */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar user={author} className="w-11 h-11 text-base shadow-sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-base text-gray-900 truncate">{author.display_name}</span>
              <VerifiedBadge size={16} />
              {following && (
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 flex-shrink-0">
                  {language === 'es' ? 'Siguiendo' : 'Following'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-400">{timeAgo(post.created_at, language)}</span>
              <span className="text-gray-200">·</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                {EQUIPMENT_LABELS[author.equipment_type] || author.equipment_type}
              </span>
            </div>
          </div>
        </div>

        {/* Post body */}
        <div className="mb-3 pl-14">
          <MentionText body={post.body} truncated />

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div onClick={e => e.stopPropagation()}>
              <MediaGrid media={post.media} />
            </div>
          )}

          {/* Poll block */}
          {post.poll_options && (
            <PollBlock post={post} stopPropagation />
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-1 pl-14">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all btn-press ${
              isUpvoted
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
          >
            <ThumbsUp size={16} fill={isUpvoted ? 'currentColor' : 'none'} />
            <span>{post.upvote_count}</span>
          </button>

          <button
            onClick={handleCardClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all btn-press"
          >
            <MessageCircle size={16} />
            <span>{post.reply_count}</span>
          </button>

          <button
            onClick={handleRepost}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all btn-press ${
              isReposted
                ? 'bg-green-50 text-green-600'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
          >
            <Repeat2 size={16} />
            <span>{post.repost_count > 0 ? post.repost_count : ''}</span>
          </button>

          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all btn-press"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <ShareSheet
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        type="post"
        id={post.id}
        title="Publicación en ASAP-DIN"
        lang={language}
      />
    </>
  );
}
