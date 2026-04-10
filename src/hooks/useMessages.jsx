import { createContext, useContext, useState, useCallback } from 'react';
import { mockConversations, mockGroups, getOtherUserId } from '../data/mockMessages';
import { CURRENT_USER_ID } from '../data/mockUsers';

const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
  const [conversations, setConversations] = useState(mockConversations);
  const [groups, setGroups] = useState(mockGroups);

  // Sorted by most recent message
  const getConversationsForUser = useCallback((userId) => {
    return [...conversations]
      .filter(c => c.participant_ids.includes(userId))
      .sort((a, b) => {
        const aLast = a.messages[a.messages.length - 1]?.created_at || '';
        const bLast = b.messages[b.messages.length - 1]?.created_at || '';
        return bLast.localeCompare(aLast);
      });
  }, [conversations]);

  // Get groups for current user
  const getGroups = useCallback(() => {
    return [...groups]
      .filter(g => g.members.includes(CURRENT_USER_ID))
      .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
  }, [groups]);

  // Get or create conversation between two users
  const getOrCreateConversation = useCallback((otherUserId) => {
    const existing = conversations.find(c =>
      c.participant_ids.includes(CURRENT_USER_ID) &&
      c.participant_ids.includes(otherUserId)
    );
    if (existing) return existing;

    // Create new empty conversation
    const newConv = {
      id: `conv-new-${Date.now()}`,
      participant_ids: [CURRENT_USER_ID, otherUserId],
      messages: [],
      unread_count: 0,
    };
    setConversations(prev => [...prev, newConv]);
    return newConv;
  }, [conversations]);

  const sendVoiceMessage = useCallback((otherUserId, _blob, duration, waveform, audioUrl) => {
    const newMsg = {
      id: `msg-voice-${Date.now()}`,
      sender_id: CURRENT_USER_ID,
      type: 'voice',
      duration,
      waveform,
      audio_url: audioUrl || null,
      created_at: new Date().toISOString(),
      status: 'sent',
    };

    const convId = conversations.find(c =>
      c.participant_ids.includes(CURRENT_USER_ID) &&
      c.participant_ids.includes(otherUserId)
    )?.id;

    if (convId) {
      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, messages: [...c.messages, newMsg] } : c
      ));
    } else {
      setConversations(prev => [...prev, {
        id: `conv-new-${Date.now()}`,
        participant_ids: [CURRENT_USER_ID, otherUserId],
        messages: [newMsg],
        unread_count: 0,
      }]);
    }
  }, [conversations]);

  const sendMessage = useCallback((otherUserId, text) => {
    const convId = conversations.find(c =>
      c.participant_ids.includes(CURRENT_USER_ID) &&
      c.participant_ids.includes(otherUserId)
    )?.id;

    const newMsg = {
      id: `msg-new-${Date.now()}`,
      sender_id: CURRENT_USER_ID,
      type: 'text',
      text,
      created_at: new Date().toISOString(),
      status: 'sent',
    };

    if (convId) {
      setConversations(prev => prev.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, newMsg] }
          : c
      ));
    } else {
      // Create conversation with first message
      const newConv = {
        id: `conv-new-${Date.now()}`,
        participant_ids: [CURRENT_USER_ID, otherUserId],
        messages: [newMsg],
        unread_count: 0,
      };
      setConversations(prev => [...prev, newConv]);
    }
  }, [conversations]);

  const sendSharedPost = useCallback((otherUserId, postId) => {
    const newMsg = {
      id: `msg-shared-${Date.now()}`,
      sender_id: CURRENT_USER_ID,
      type: 'shared_post',
      shared_post_id: postId,
      created_at: new Date().toISOString(),
      status: 'sent',
    };

    const convId = conversations.find(c =>
      c.participant_ids.includes(CURRENT_USER_ID) &&
      c.participant_ids.includes(otherUserId)
    )?.id;

    if (convId) {
      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, messages: [...c.messages, newMsg] } : c
      ));
    } else {
      setConversations(prev => [...prev, {
        id: `conv-new-${Date.now()}`,
        participant_ids: [CURRENT_USER_ID, otherUserId],
        messages: [newMsg],
        unread_count: 0,
      }]);
    }
  }, [conversations]);

  const markConversationRead = useCallback((otherUserId) => {
    setConversations(prev => prev.map(c =>
      c.participant_ids.includes(CURRENT_USER_ID) &&
      c.participant_ids.includes(otherUserId)
        ? {
            ...c,
            unread_count: 0,
            messages: c.messages.map(m =>
              m.sender_id !== CURRENT_USER_ID ? { ...m, read: true } : m
            ),
          }
        : c
    ));
  }, []);

  const getTotalUnreadCount = useCallback(() => {
    const dmUnread = conversations
      .filter(c => c.participant_ids.includes(CURRENT_USER_ID))
      .reduce((sum, c) => sum + c.unread_count, 0);
    return dmUnread;
  }, [conversations]);

  // Get messages for a specific conversation (between current user and other)
  const getMessages = useCallback((otherUserId) => {
    const conv = conversations.find(c =>
      c.participant_ids.includes(CURRENT_USER_ID) &&
      c.participant_ids.includes(otherUserId)
    );
    return conv?.messages || [];
  }, [conversations]);

  // Group message operations
  const getGroup = useCallback((groupId) => {
    return groups.find(g => g.id === groupId) || null;
  }, [groups]);

  const getGroupMessages = useCallback((groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group?.messages || [];
  }, [groups]);

  const sendGroupMessage = useCallback((groupId, text) => {
    const newMsg = {
      id: `gm-new-${Date.now()}`,
      sender_id: CURRENT_USER_ID,
      type: 'text',
      body: text,
      created_at: new Date().toISOString(),
      status: 'sent',
    };
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, messages: [...g.messages, newMsg], last_message_at: newMsg.created_at }
        : g
    ));
  }, []);

  const sendGroupVoiceMessage = useCallback((groupId, _blob, duration, waveform, audioUrl) => {
    const newMsg = {
      id: `gm-voice-${Date.now()}`,
      sender_id: CURRENT_USER_ID,
      type: 'voice',
      duration,
      waveform,
      audio_url: audioUrl || null,
      created_at: new Date().toISOString(),
      status: 'sent',
    };
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, messages: [...g.messages, newMsg], last_message_at: newMsg.created_at }
        : g
    ));
  }, []);

  const createGroup = useCallback((name, emoji, memberIds) => {
    const newGroup = {
      id: `grp-new-${Date.now()}`,
      name,
      emoji,
      members: [CURRENT_USER_ID, ...memberIds],
      created_by: CURRENT_USER_ID,
      last_message_at: new Date().toISOString(),
      messages: [],
    };
    setGroups(prev => [...prev, newGroup]);
    return newGroup;
  }, []);

  const leaveGroup = useCallback((groupId) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, members: g.members.filter(id => id !== CURRENT_USER_ID) }
        : g
    ));
  }, []);

  return (
    <MessagesContext.Provider value={{
      conversations,
      groups,
      getConversationsForUser,
      getGroups,
      getGroup,
      getGroupMessages,
      getOrCreateConversation,
      sendMessage,
      sendVoiceMessage,
      sendSharedPost,
      sendGroupMessage,
      sendGroupVoiceMessage,
      createGroup,
      leaveGroup,
      markConversationRead,
      getTotalUnreadCount,
      getMessages,
      getOtherUserId,
    }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages must be used within MessagesProvider');
  return ctx;
}
