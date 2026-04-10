import { createContext, useContext, useState, useCallback } from 'react';
import { mockPosts, mockReplies, pollPosts } from '../data/mockPosts';
import { CURRENT_USER_ID } from '../data/mockUsers';
import { INITIAL_SAVED } from '../data/mockSavedPosts';

const PostsContext = createContext(null);

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([...mockPosts, ...pollPosts]);
  const [replies, setReplies] = useState(mockReplies);
  const [userUpvotes, setUserUpvotes] = useState(new Set());
  const [userReposts, setUserReposts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set(INITIAL_SAVED));

  const getPost = useCallback((id) => {
    return posts.find(p => p.id === id) || null;
  }, [posts]);

  const getReplies = useCallback((postId) => {
    return replies.filter(r => r.post_id === postId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [replies]);

  const getPostsByThread = useCallback((thread) => {
    return posts.filter(p => p.thread === thread)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [posts]);

  const getPostsByUser = useCallback((userId) => {
    return posts.filter(p => p.author_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [posts]);

  const getPinnedPostsByUser = useCallback((userId) => {
    return posts.filter(p => p.author_id === userId && p.is_pinned_to_profile)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [posts]);

  const upvotePost = useCallback((postId) => {
    const key = `post_${postId}`;
    if (userUpvotes.has(key)) {
      setUserUpvotes(prev => { const n = new Set(prev); n.delete(key); return n; });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvote_count: Math.max(0, p.upvote_count - 1) } : p));
    } else {
      setUserUpvotes(prev => new Set([...prev, key]));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvote_count: p.upvote_count + 1 } : p));
    }
  }, [userUpvotes]);

  const upvoteReply = useCallback((replyId) => {
    const key = `reply_${replyId}`;
    if (userUpvotes.has(key)) {
      setUserUpvotes(prev => { const n = new Set(prev); n.delete(key); return n; });
      setReplies(prev => prev.map(r => r.id === replyId ? { ...r, upvote_count: Math.max(0, r.upvote_count - 1) } : r));
    } else {
      setUserUpvotes(prev => new Set([...prev, key]));
      setReplies(prev => prev.map(r => r.id === replyId ? { ...r, upvote_count: r.upvote_count + 1 } : r));
    }
  }, [userUpvotes]);

  const hasUpvotedPost = useCallback((postId) => userUpvotes.has(`post_${postId}`), [userUpvotes]);
  const hasUpvotedReply = useCallback((replyId) => userUpvotes.has(`reply_${replyId}`), [userUpvotes]);

  const createPost = useCallback((thread, body, isPinned = false) => {
    const newPost = {
      id: `p-new-${Date.now()}`,
      author_id: CURRENT_USER_ID,
      thread,
      body,
      upvote_count: 0,
      reply_count: 0,
      is_pinned_to_profile: isPinned,
      created_at: new Date().toISOString(),
      mentions: [],
    };
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  }, []);

  const createReply = useCallback((postId, body) => {
    const newReply = {
      id: `r-new-${Date.now()}`,
      post_id: postId,
      author_id: CURRENT_USER_ID,
      body,
      upvote_count: 0,
      created_at: new Date().toISOString(),
      mentions: [],
    };
    setReplies(prev => [...prev, newReply]);
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, reply_count: p.reply_count + 1 } : p
    ));
    return newReply;
  }, []);

  const togglePin = useCallback((postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, is_pinned_to_profile: !p.is_pinned_to_profile } : p
    ));
  }, []);

  const votePoll = useCallback((postId, optionId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId || !p.poll_options || p.poll_user_vote) return p;
      return {
        ...p,
        poll_user_vote: optionId,
        poll_total_votes: p.poll_total_votes + 1,
        poll_options: p.poll_options.map(opt =>
          opt.id === optionId ? { ...opt, vote_count: opt.vote_count + 1 } : opt
        ),
      };
    }));
  }, []);

  const hasReposted = useCallback((postId) => userReposts.has(postId), [userReposts]);

  const repostPost = useCallback((postId) => {
    if (userReposts.has(postId)) return;
    const original = posts.find(p => p.id === postId);
    if (!original) return;

    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, repost_count: (p.repost_count || 0) + 1 } : p
    ));

    const repostEntry = {
      ...original,
      id: `p-repost-${Date.now()}`,
      is_repost: true,
      repost_author_id: CURRENT_USER_ID,
      created_at: new Date().toISOString(),
      is_pinned_to_profile: false,
    };
    setPosts(prev => [repostEntry, ...prev]);
    setUserReposts(prev => new Set([...prev, postId]));
  }, [posts, userReposts]);

  const createPostWithPoll = useCallback((thread, body, isPinned = false, pollData = null, imageUrl = null, quotedPostId = null, flair = null) => {
    const newPost = {
      id: `p-new-${Date.now()}`,
      author_id: CURRENT_USER_ID,
      thread,
      body,
      upvote_count: 0,
      reply_count: 0,
      repost_count: 0,
      is_pinned_to_profile: isPinned,
      created_at: new Date().toISOString(),
      mentions: [],
      ...(flair ? { flair } : {}),
      ...(pollData ? {
        poll_question: pollData.question,
        poll_options: pollData.options.map((text, i) => ({ id: `po-new-${Date.now()}-${i}`, text, vote_count: 0 })),
        poll_total_votes: 0,
        poll_user_vote: null,
      } : {}),
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(quotedPostId ? { is_quote_repost: true, original_post_id: quotedPostId } : {}),
    };
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  }, []);

  // Save/Bookmark
  const savePost = useCallback((postId) => {
    setSavedPosts(prev => new Set([...prev, postId]));
  }, []);

  const unsavePost = useCallback((postId) => {
    setSavedPosts(prev => { const n = new Set(prev); n.delete(postId); return n; });
  }, []);

  const isSaved = useCallback((postId) => savedPosts.has(postId), [savedPosts]);

  const getSavedPosts = useCallback(() => {
    return posts.filter(p => savedPosts.has(p.id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [posts, savedPosts]);

  // Reactions
  const reactToPost = useCallback((postId, reactionType) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId || !p.reactions) return p;
      const currentReaction = p.reactions.user_reaction;
      if (currentReaction === reactionType) {
        // Toggle off
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [reactionType]: Math.max(0, (p.reactions[reactionType] || 0) - 1),
            user_reaction: null,
          },
        };
      } else {
        const updated = { ...p.reactions, user_reaction: reactionType };
        if (currentReaction) {
          updated[currentReaction] = Math.max(0, (p.reactions[currentReaction] || 0) - 1);
        }
        updated[reactionType] = (p.reactions[reactionType] || 0) + 1;
        return { ...p, reactions: updated };
      }
    }));
  }, []);

  // Edit/Delete/Report
  const editPost = useCallback((postId, newBody) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, body: newBody, updated_at: new Date().toISOString() } : p
    ));
  }, []);

  const deletePost = useCallback((postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  const canEdit = useCallback((postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return false;
    if (post.author_id !== CURRENT_USER_ID) return false;
    const created = new Date(post.created_at);
    const now = new Date();
    return (now - created) < 15 * 60 * 1000;
  }, [posts]);

  const reportPost = useCallback((postId, reason) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, reported: true, report_reason: reason } : p
    ));
  }, []);

  return (
    <PostsContext.Provider value={{
      posts,
      replies,
      getPost,
      getReplies,
      getPostsByThread,
      getPostsByUser,
      getPinnedPostsByUser,
      upvotePost,
      upvoteReply,
      hasUpvotedPost,
      hasUpvotedReply,
      createPost,
      createReply,
      togglePin,
      votePoll,
      createPostWithPoll,
      repostPost,
      hasReposted,
      savePost,
      unsavePost,
      isSaved,
      getSavedPosts,
      reactToPost,
      editPost,
      deletePost,
      canEdit,
      reportPost,
    }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}
