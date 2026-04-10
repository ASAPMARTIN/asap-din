import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Share2, ChevronDown, ChevronUp, Repeat2, Bookmark, MoreHorizontal } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import BrokerChip from './BrokerChip';
import ShareSheet from './ShareSheet';
import PollBlock from './PollBlock';
import ReactionBar from './ReactionBar';
import ImageLightbox from './ImageLightbox';
import OptionsMenu from './OptionsMenu';
import BottomSheet from './BottomSheet';
import { parseMentions } from '../utils/mentionParser';
import { timeAgo } from '../utils/timeAgo';
import { getAvatarColor, getInitials } from '../utils/avatarColor';
import { getUserById } from '../data/mockUsers';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { useFollows } from '../hooks/useFollows';
import { useBlocked } from '../hooks/useBlocked';

const EQUIPMENT_LABELS = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
};

const THREAD_COLORS = {
  alertas_brokers: 'border-l-red-400',
  tarifas_rutas: 'border-l-blue-400',
};

const REACTION_EMOJIS = {
  thumbs: '👍',
  fire: '🔥',
  confirmed: '💯',
  warning: '⚠️',
  frustrated: '😤',
};

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam o publicidad' },
  { id: 'false', label: 'Información falsa' },
  { id: 'inappropriate', label: 'Contenido inapropiado' },
  { id: 'scam', label: 'Fraude o estafa' },
  { id: 'other', label: 'Otro motivo' },
];

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

function MiniPostCard({ post }) {
  if (!post) return null;
  const author = getUserById(post.author_id);
  if (!author) return null;
  const avatarColor = author.avatar_color || getAvatarColor(author.display_name);
  return (
    <div className="mt-2 border border-gray-200 rounded-xl p-3 bg-gray-50">
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {author.avatar_initials || getInitials(author.display_name)}
        </div>
        <span className="text-xs font-semibold text-gray-700">{author.display_name}</span>
      </div>
      <p className="text-xs text-gray-600 line-clamp-3">{post.body}</p>
    </div>
  );
}

export default function PostCard({ post, onClick }) {
  const navigate = useNavigate();
  const { upvotePost, hasUpvotedPost, repostPost, hasReposted, savePost, unsavePost, isSaved, reactToPost, posts, editPost, deletePost, canEdit, reportPost } = usePosts();
  const { language, currentUser } = useAuth();
  const { isFollowing } = useFollows();
  const { isBlocked } = useBlocked();
  const [shareOpen, setShareOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [reactionBarOpen, setReactionBarOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [repostSheetOpen, setRepostSheetOpen] = useState(false);

  const longPressTimer = useRef(null);

  const author = getUserById(post.author_id);

  // Block check
  if (!author) return null;
  if (isBlocked(post.author_id)) return null;

  const avatarColor = author.avatar_color || getAvatarColor(author.display_name);
  const isUpvoted = hasUpvotedPost(post.id);
  const isReposted = hasReposted(post.id);
  const bookmarked = isSaved(post.id);
  const threadBorder = THREAD_COLORS[post.thread] || 'border-l-gray-200';
  const following = isFollowing(author.id);
  const isOwn = currentUser?.id === post.author_id;

  const repostAuthor = post.is_repost ? getUserById(post.repost_author_id) : null;

  // Original post for quote reposts
  const originalPost = post.is_quote_repost ? posts.find(p => p.id === post.original_post_id) : null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleCardClick = () => {
    if (onClick) onClick(post);
    else navigate(`/post/${post.id}`);
  };

  const handleUpvoteStart = (e) => {
    e.stopPropagation();
    if (post.reactions) {
      longPressTimer.current = setTimeout(() => {
        setReactionBarOpen(true);
      }, 500);
    }
  };

  const handleUpvoteEnd = (e) => {
    e.stopPropagation();
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      if (!reactionBarOpen) {
        upvotePost(post.id);
      }
    }
  };

  const handleUpvoteClick = (e) => {
    e.stopPropagation();
    if (!reactionBarOpen) {
      upvotePost(post.id);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShareOpen(true);
  };

  const handleRepost = (e) => {
    e.stopPropagation();
    setRepostSheetOpen(true);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (bookmarked) {
      unsavePost(post.id);
      showToast(language === 'es' ? '✓ Guardado eliminado' : '✓ Removed from saved');
    } else {
      savePost(post.id);
      showToast(language === 'es' ? '🔖 Guardado' : '🔖 Saved');
    }
  };

  const handleReact = (reactionType) => {
    reactToPost(post.id, reactionType);
  };

  const handleInstantRepost = () => {
    if (isReposted) { setRepostSheetOpen(false); return; }
    repostPost(post.id);
    setRepostSheetOpen(false);
    showToast(language === 'es' ? '✓ Reposteado' : '✓ Reposted');
  };

  const handleQuoteRepost = () => {
    setRepostSheetOpen(false);
    navigate('/', { state: { quotePost: post } });
  };

  const handleDelete = () => {
    deletePost(post.id);
    setDeleteSheetOpen(false);
  };

  const handleReport = (reason) => {
    reportPost(post.id, reason);
    setReportSheetOpen(false);
    showToast(language === 'es' ? '✓ Reporte enviado' : '✓ Report sent');
  };

  // Build options menu items
  const menuItems = isOwn
    ? [
        ...(canEdit(post.id) ? [{
          label: language === 'es' ? '✏️ Editar' : '✏️ Edit',
          onClick: () => editPost(post.id, post.body),
        }] : []),
        {
          label: language === 'es' ? '🗑️ Eliminar' : '🗑️ Delete',
          onClick: () => setDeleteSheetOpen(true),
          danger: true,
        },
      ]
    : [
        {
          label: language === 'es' ? '🚩 Reportar' : '🚩 Report',
          onClick: () => setReportSheetOpen(true),
          danger: true,
        },
      ];

  // Reaction pills to show
  const reactionPills = post.reactions
    ? Object.entries(post.reactions)
        .filter(([key, val]) => key !== 'user_reaction' && val > 0)
        .map(([key, val]) => ({ key, emoji: REACTION_EMOJIS[key], count: val }))
    : [];

  return (
    <>
      {/* Toast */}
      {toastVisible && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#0F1A2E] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg fade-in pointer-events-none">
          {toastMsg}
        </div>
      )}

      <div
        className={`relative bg-white border-b border-gray-100 px-4 pb-4 card-tap cursor-pointer border-l-4 ${threadBorder} fade-in ${post.is_repost ? 'pt-2' : 'pt-5'}`}
        onClick={handleCardClick}
      >
        {/* Repost header */}
        {post.is_repost && repostAuthor && (
          <div className="flex items-center gap-1.5 mb-3 text-gray-400">
            <Repeat2 size={13} />
            <span className="text-xs font-semibold">
              {repostAuthor.display_name} {language === 'es' ? 'reposteó' : 'reposted'}
            </span>
          </div>
        )}

        {/* ... options menu button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev); }}
            className="p-1.5 rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors btn-press"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <OptionsMenu
              items={menuItems}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>

        {/* Author row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-sm"
            style={{ backgroundColor: avatarColor }}
          >
            {author.avatar_initials || getInitials(author.display_name)}
          </div>
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
              {post.updated_at && (
                <span className="text-xs text-gray-400 italic">(editado)</span>
              )}
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

          {/* Image */}
          {post.image_url && (
            <div
              className="mt-2 rounded-xl overflow-hidden cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
            >
              <img
                src={post.image_url}
                alt="Imagen adjunta"
                className="w-full object-cover rounded-xl"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}

          {/* Quote repost embedded card */}
          {post.is_quote_repost && (
            <MiniPostCard post={originalPost} />
          )}

          {/* Poll block */}
          {post.poll_options && (
            <PollBlock post={post} stopPropagation />
          )}

          {/* Reaction pills */}
          {reactionPills.length > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {reactionPills.map(({ key, emoji, count }) => (
                <span
                  key={key}
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ${
                    post.reactions?.user_reaction === key ? 'ring-2 ring-[#0F1A2E] bg-[#0F1A2E]/10' : ''
                  }`}
                >
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 pl-14">
          {/* Upvote with long press for reactions */}
          <div className="relative">
            <button
              onMouseDown={post.reactions ? handleUpvoteStart : undefined}
              onMouseUp={post.reactions ? handleUpvoteEnd : undefined}
              onTouchStart={post.reactions ? handleUpvoteStart : undefined}
              onTouchEnd={post.reactions ? handleUpvoteEnd : undefined}
              onClick={post.reactions ? undefined : handleUpvoteClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all btn-press ${
                isUpvoted
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              <ThumbsUp size={16} fill={isUpvoted ? 'currentColor' : 'none'} />
              <span>{post.upvote_count}</span>
            </button>
            {reactionBarOpen && (
              <ReactionBar
                onReact={handleReact}
                onClose={() => setReactionBarOpen(false)}
                userReaction={post.reactions?.user_reaction}
              />
            )}
          </div>

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
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
          >
            <Repeat2 size={16} />
            {(post.repost_count || 0) > 0 && <span>{post.repost_count}</span>}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all btn-press"
          >
            <Share2 size={16} />
          </button>

          <button
            onClick={handleBookmark}
            className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all btn-press ${
              bookmarked
                ? 'text-[#0F1A2E]'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
          >
            <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Share sheet */}
      <ShareSheet
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        type="post"
        id={post.id}
        title="Publicación en ASAP-DIN"
        lang={language}
      />

      {/* Image lightbox */}
      {lightboxOpen && post.image_url && (
        <ImageLightbox src={post.image_url} onClose={() => setLightboxOpen(false)} />
      )}

      {/* Repost bottom sheet */}
      <BottomSheet isOpen={repostSheetOpen} onClose={() => setRepostSheetOpen(false)}>
        <div className="px-4 pb-6 pt-2">
          <h3 className="text-base font-bold text-gray-900 mb-4 text-center">
            {language === 'es' ? 'Compartir publicación' : 'Share post'}
          </h3>
          <button
            onClick={handleInstantRepost}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 rounded-2xl mb-3 btn-press hover:bg-gray-100 transition-colors"
          >
            <Repeat2 size={20} className="text-emerald-600" />
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-900">{language === 'es' ? 'Repostear' : 'Repost'}</p>
              <p className="text-xs text-gray-500">{language === 'es' ? 'Comparte al instante' : 'Share instantly'}</p>
            </div>
          </button>
          <button
            onClick={handleQuoteRepost}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 rounded-2xl btn-press hover:bg-gray-100 transition-colors"
          >
            <MessageCircle size={20} className="text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-900">{language === 'es' ? 'Citar publicación' : 'Quote post'}</p>
              <p className="text-xs text-gray-500">{language === 'es' ? 'Agrega tu comentario' : 'Add your comment'}</p>
            </div>
          </button>
        </div>
      </BottomSheet>

      {/* Delete confirm bottom sheet */}
      <BottomSheet isOpen={deleteSheetOpen} onClose={() => setDeleteSheetOpen(false)}>
        <div className="px-4 pb-6 pt-2">
          <h3 className="text-base font-bold text-red-600 mb-2 text-center">
            {language === 'es' ? '¿Eliminar publicación?' : 'Delete post?'}
          </h3>
          <p className="text-sm text-gray-500 mb-5 text-center">
            {language === 'es' ? 'Esta acción no se puede deshacer.' : 'This action cannot be undone.'}
          </p>
          <button
            onClick={handleDelete}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl mb-3 btn-press"
          >
            {language === 'es' ? 'Eliminar' : 'Delete'}
          </button>
          <button
            onClick={() => setDeleteSheetOpen(false)}
            className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl btn-press"
          >
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </button>
        </div>
      </BottomSheet>

      {/* Report bottom sheet */}
      <BottomSheet isOpen={reportSheetOpen} onClose={() => setReportSheetOpen(false)}>
        <div className="px-4 pb-6 pt-2">
          <h3 className="text-base font-bold text-gray-900 mb-1 text-center">
            {language === 'es' ? 'Reportar publicación' : 'Report post'}
          </h3>
          <p className="text-xs text-gray-500 mb-4 text-center">
            {language === 'es' ? '¿Por qué quieres reportar esto?' : 'Why are you reporting this?'}
          </p>
          <div className="space-y-2">
            {REPORT_REASONS.map(reason => (
              <button
                key={reason.id}
                onClick={() => handleReport(reason.id)}
                className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors btn-press"
              >
                {reason.label}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
