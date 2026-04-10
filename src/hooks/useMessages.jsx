import { createContext, useContext, useState, useCallback } from 'react';
import { mockConversations, getOtherUserId } from '../data/mockMessages';
import { CURRENT_USER_ID } from '../data/mockUsers';

const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
  const [conversations, setConversations] = useState(mockConversations);

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

  const sendMessage = useCallback((otherUserId, text) => {
    const convId = conversations.find(c =>
      c.participant_ids.includes(CURRENT_USER_ID) &&
      c.participant_ids.includes(otherUserId)
    )?.id;

    const newMsg = {
      id: `msg-new-${Date.now()}`,
      sender_id: CURRENT_USER_ID,
      text,
      created_at: new Date().toISOString(),
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

  const markConversationRead = useCallback((otherUserId) => {
    setConversations(prev => prev.map(c =>
      c.participant_ids.includes(CURRENT_USER_ID) &&
      c.participant_ids.includes(otherUserId)
        ? { ...c, unread_count: 0 }
        : c
    ));
  }, []);

  const getTotalUnreadCount = useCallback(() => {
    return conversations
      .filter(c => c.participant_ids.includes(CURRENT_USER_ID))
      .reduce((sum, c) => sum + c.unread_count, 0);
  }, [conversations]);

  // Get messages for a specific conversation (between current user and other)
  const getMessages = useCallback((otherUserId) => {
    const conv = conversations.find(c =>
      c.participant_ids.includes(CURRENT_USER_ID) &&
      c.participant_ids.includes(otherUserId)
    );
    return conv?.messages || [];
  }, [conversations]);

  return (
    <MessagesContext.Provider value={{
      conversations,
      getConversationsForUser,
      getOrCreateConversation,
      sendMessage,
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
