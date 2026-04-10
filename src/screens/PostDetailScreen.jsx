import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, Share2, Pin, Bookmark } from 'lucide-react';
import TopBar from '../components/TopBar';
import VerifiedBadge from '../components/VerifiedBadge';
import BrokerChip from '../components/BrokerChip';
import ReplyCard from '../components/ReplyCard';
import ShareSheet from '../components/ShareSheet';
import BrokerMentionInput from '../components/BrokerMentionInput';
import ImageLightbox from '../components/ImageLightbox';
import { parseMentions } from '../utils/mentionParser';
import { timeAgo } from '../utils/timeAgo';
import { getAvatarColor, getInitials } from '../utils/avatarColor';
import { getUserById } from '../data/mockUsers';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import PollBlock from '../components/PollBlock';

const EQUIPMENT_LABELS = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
};

export default function PostDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, currentUser } = useAuth();
  const { getPost, getReplies, upvotePost, hasUpvotedPost, createReply, togglePin, savePost, unsavePost, isSaved } = usePosts();
  const [shareOpen, setShareOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const post = getPost(id);
  const replies = getReplies(id);
  const bookmarked = post ? isSaved(post.id) : false;

  if (!post) {
    return (
      <div className="min-h-dvh bg-gray-50 flex flex-col">
        <TopBar showBack title="" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">{language === 'es' ? 'Publicación no encontrada' : 'Post not found'}</p>
        </div>
      </div>
    );
  }

  const author = getUserById(post.author_id);
  const avatarColor = author ? (author.avatar_color || getAvatarColor(author.display_name)) : '#4B5563';
  const segments = parseMentions(post.body);
  const isUpvoted = hasUpvotedPost(post.id);
  const isOwnPost = currentUser?.id === post.author_id;

  const handleReply = () => {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      createReply(post.id, replyBody.trim());
      setReplyBody('');
      setSubmitting(false);
    }, 400);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      <TopBar showBack />

      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '80px' }}>
        {/* Post */}
        <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3">
          {/* Author */}
          {author && (
            <button
              onClick={() => navigate(`/profile/${author.id}`)}
              className="flex items-center gap-2.5 mb-3"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                {author.avatar_initials || getInitials(author.display_name)}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm text-gray-900">{author.display_name}</span>
                  <VerifiedBadge size={14} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">{timeAgo(post.created_at, language)}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {EQUIPMENT_LABELS[author.equipment_type]}
                  </span>
                </div>
              </div>
            </button>
          )}

          {/* Body */}
          <p className="text-base text-gray-900 leading-relaxed mb-3">
            {segments.map((seg, i) => (
              seg.type === 'mention'
                ? <BrokerChip key={i} brokerId={seg.brokerId} brokerName={seg.brokerName} inline />
                : <span key={i}>{seg.content}</span>
            ))}
          </p>

          {/* Image */}
          {post.image_url && (
            <div
              className="mb-3 rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={post.image_url}
                alt="Imagen adjunta"
                className="w-full object-cover rounded-xl"
                style={{ maxHeight: '220px' }}
              />
            </div>
          )}

          {/* Poll (always fully visible in detail view) */}
          {post.poll_options && (
            <div className="mb-3">
              <PollBlock post={post} stopPropagation={false} />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
            <button
              onClick={() => upvotePost(post.id)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isUpvoted ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ThumbsUp size={16} fill={isUpvoted ? 'currentColor' : 'none'} />
              <span>{post.upvote_count}</span>
            </button>

            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <Share2 size={16} />
              <span>{language === 'es' ? 'Compartir' : 'Share'}</span>
            </button>

            <button
              onClick={() => {
                if (bookmarked) { unsavePost(post.id); } else { savePost(post.id); }
              }}
              className={`flex items-center gap-1.5 text-sm transition-colors ${bookmarked ? 'text-[#0F1A2E]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
              <span>{bookmarked ? (language === 'es' ? 'Guardado' : 'Saved') : (language === 'es' ? 'Guardar' : 'Save')}</span>
            </button>

            {isOwnPost && (
              <button
                onClick={() => togglePin(post.id)}
                className={`flex items-center gap-1.5 text-sm ml-auto ${post.is_pinned_to_profile ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Pin size={16} fill={post.is_pinned_to_profile ? 'currentColor' : 'none'} />
                <span>{post.is_pinned_to_profile ? (language === 'es' ? 'Fijado' : 'Pinned') : (language === 'es' ? 'Fijar' : 'Pin')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Replies section header */}
        <div className="px-4 py-2 bg-gray-50">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {replies.length} {language === 'es' ? (replies.length === 1 ? 'respuesta' : 'respuestas') : (replies.length === 1 ? 'reply' : 'replies')}
          </span>
        </div>

        {/* Replies */}
        <div className="bg-white">
          {replies.length === 0 ? (
            <div className="py-10 text-center px-8">
              <p className="text-gray-400 text-sm">
                {language === 'es' ? 'Sé el primero en responder.' : 'Be the first to reply.'}
              </p>
            </div>
          ) : (
            replies.map(reply => <ReplyCard key={reply.id} reply={reply} />)
          )}
        </div>
      </div>

      {/* Reply composer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2.5 pb-safe z-20">
        <div className="flex items-end gap-2">
          {currentUser && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-0.5"
              style={{ backgroundColor: currentUser.avatar_color || '#1d4ed8' }}
            >
              {currentUser.avatar_initials}
            </div>
          )}
          <div className="flex-1 relative">
            <BrokerMentionInput
              value={replyBody}
              onChange={setReplyBody}
              placeholder={language === 'es' ? 'Escribe una respuesta... usa @ para mencionar un broker' : 'Write a reply... use @ to mention a broker'}
              lang={language}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            />
          </div>
          <button
            onClick={handleReply}
            disabled={!replyBody.trim() || submitting}
            className="bg-blue-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-2xl flex-shrink-0 transition-colors mb-0.5"
          >
            {language === 'es' ? 'Responder' : 'Reply'}
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

      {lightboxOpen && post.image_url && (
        <ImageLightbox src={post.image_url} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}
