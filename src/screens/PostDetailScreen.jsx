import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, Share2, Pin, ImagePlus, X } from 'lucide-react';
import TopBar from '../components/TopBar';
import VerifiedBadge from '../components/VerifiedBadge';
import BrokerChip from '../components/BrokerChip';
import ReplyCard from '../components/ReplyCard';
import ShareSheet from '../components/ShareSheet';
import BrokerMentionInput from '../components/BrokerMentionInput';
import Avatar from '../components/Avatar';
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
  const { getPost, getReplies, upvotePost, hasUpvotedPost, createReply, togglePin } = usePosts();
  const [shareOpen, setShareOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replyMedia, setReplyMedia] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const mediaInputRef = useRef();

  const post = getPost(id);
  const replies = getReplies(id);

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

  const postAuthor = getUserById(post.author_id);
  const avatarColor = postAuthor ? (postAuthor.avatar_color || getAvatarColor(postAuthor.display_name)) : '#4B5563';
  const segments = parseMentions(post.body);
  const isUpvoted = hasUpvotedPost(post.id);
  const isOwnPost = currentUser?.id === post.author_id;

  const canReply = replyBody.trim().length > 0 || replyMedia.length > 0;

  const handleReply = () => {
    if (!canReply || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      createReply(post.id, replyBody.trim(), replyMedia);
      setReplyBody('');
      setReplyMedia([]);
      setSubmitting(false);
    }, 400);
  };

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const hasVideo = files.some(f => f.type.startsWith('video/'));
    if (hasVideo) {
      const file = files.find(f => f.type.startsWith('video/'));
      const reader = new FileReader();
      reader.onload = (ev) => setReplyMedia([{ type: 'video', url: ev.target.result }]);
      reader.readAsDataURL(file);
    } else {
      const remaining = 4 - replyMedia.filter(m => m.type === 'image').length;
      files.slice(0, remaining).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => setReplyMedia(prev => [...prev, { type: 'image', url: ev.target.result }]);
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const removeMedia = (idx) => setReplyMedia(prev => prev.filter((_, i) => i !== idx));

  const hasVideo = replyMedia.some(m => m.type === 'video');
  const canAddMedia = !hasVideo && replyMedia.length < 4;

  // Approximate composer height: base 64px + preview strip if media attached
  const composerHeight = replyMedia.length > 0 ? 148 : 72;

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      <TopBar showBack />

      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: `${composerHeight}px` }}>
        {/* Post */}
        <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3">
          {/* Author */}
          {postAuthor && (
            <button
              onClick={() => navigate(`/profile/${postAuthor.id}`)}
              className="flex items-center gap-2.5 mb-3"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                {postAuthor.avatar_initials || getInitials(postAuthor.display_name)}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm text-gray-900">{postAuthor.display_name}</span>
                  <VerifiedBadge size={14} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">{timeAgo(post.created_at, language)}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {EQUIPMENT_LABELS[postAuthor.equipment_type]}
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

          {/* Post media */}
          {post.media && post.media.length > 0 && (
            <div className="mb-3">
              {post.media.length === 1 && post.media[0].type === 'video' ? (
                <div className="rounded-2xl overflow-hidden bg-black">
                  <video src={post.media[0].url} controls className="w-full max-h-72 object-contain" />
                </div>
              ) : (
                <div className={`grid gap-1 rounded-2xl overflow-hidden ${post.media.length > 1 ? 'grid-cols-2' : ''}`}>
                  {post.media.map((item, i) => (
                    <img key={i} src={item.url} alt="" className={`w-full object-cover ${post.media.length === 1 ? 'max-h-80' : 'h-40'}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Poll */}
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

      {/* Reply composer — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 pt-2.5 pb-safe z-20">

        {/* Media preview strip */}
        {replyMedia.length > 0 && (
          <div className="flex gap-2 mb-2 pl-10">
            {replyMedia.map((item, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden flex-shrink-0">
                {item.type === 'video'
                  ? <video src={item.url} className="w-20 h-16 object-cover" muted />
                  : <img src={item.url} alt="" className="w-16 h-16 object-cover" />
                }
                <button
                  onClick={() => removeMedia(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 pb-1">
          {/* Current user avatar */}
          {currentUser && (
            <div className="flex-shrink-0 mb-0.5">
              <Avatar user={currentUser} className="w-8 h-8 text-xs" />
            </div>
          )}

          {/* Text input */}
          <div className="flex-1">
            <BrokerMentionInput
              value={replyBody}
              onChange={setReplyBody}
              placeholder={language === 'es' ? 'Escribe una respuesta...' : 'Write a reply...'}
              lang={language}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            />
          </div>

          {/* Media button */}
          <button
            onClick={() => canAddMedia && mediaInputRef.current?.click()}
            disabled={!canAddMedia}
            className={`flex-shrink-0 mb-0.5 p-2 rounded-full transition-colors btn-press ${
              replyMedia.length > 0 ? 'text-blue-600' : canAddMedia ? 'text-gray-400 hover:text-gray-600' : 'text-gray-200'
            }`}
          >
            <ImagePlus size={20} />
          </button>
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleMediaSelect}
          />

          {/* Send button */}
          <button
            onClick={handleReply}
            disabled={!canReply || submitting}
            className="flex-shrink-0 mb-0.5 bg-blue-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-2xl transition-colors btn-press"
          >
            {submitting ? '...' : (language === 'es' ? 'Responder' : 'Reply')}
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
    </div>
  );
}
