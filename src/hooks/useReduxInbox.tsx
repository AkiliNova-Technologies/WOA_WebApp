import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react'; 
import type { RootState } from '@/redux/store';
import {
  fetchThreads,
  fetchThreadDetail,
  fetchThreadMessages,
  createThread,
  sendMessage,
  editMessage,
  deleteMessage,
  markThreadAsRead,
  fetchPromotions,
  sendPromotion,
  setCurrentThread,
  addNewMessage,
  updateMessageLocally,
  deleteMessageLocally,
  clearError,
  clearInbox,
  type InboxMessage,
} from '@/redux/slices/inboxSlice';

export const useReduxInbox = () => {
  const dispatch = useDispatch();
  const inboxState = useSelector((state: RootState) => state.inbox);

  // Memoized selectors
  const threads = inboxState.threads;
  const promotions = inboxState.promotions;
  const currentThread = inboxState.currentThread;
  const threadMessages = inboxState.threadMessages;
  const loading = inboxState.loading;
  const error = inboxState.error;
  const pagination = inboxState.pagination;

  const getThreads = useCallback(async (params?: {
    page?: number;
    limit?: number;
    archived?: boolean;
  }) => {
    return dispatch(fetchThreads(params || {}) as any); 
  }, [dispatch]);

  const getThreadDetail = useCallback(async (threadId: string) => {
    return dispatch(fetchThreadDetail(threadId) as any);
  }, [dispatch]);

  const getThreadMessages = useCallback(async (threadId: string, page?: number, limit?: number) => {
    return dispatch(fetchThreadMessages({ threadId, page, limit }) as any);
  }, [dispatch]);

  const createNewThread = useCallback(async (participants: string[], title?: string, initialMessage?: string) => {
    return dispatch(createThread({ participants, title, initialMessage }) as any);
  }, [dispatch]);

  const sendNewMessage = useCallback(async (threadId: string, content: string, mediaFiles?: File[]) => {
    return dispatch(sendMessage({ threadId, content, mediaFiles }) as any);
  }, [dispatch]);

  const editExistingMessage = useCallback(async (messageId: string, content: string) => {
    return dispatch(editMessage({ messageId, content }) as any);
  }, [dispatch]);

  const deleteExistingMessage = useCallback(async (messageId: string) => {
    return dispatch(deleteMessage(messageId) as any);
  }, [dispatch]);

  const markThreadRead = useCallback(async (threadId: string) => {
    return dispatch(markThreadAsRead(threadId) as any);
  }, [dispatch]);

  const getPromotions = useCallback(async () => {
    return dispatch(fetchPromotions() as any);
  }, [dispatch]);

  const sendNewPromotion = useCallback(async (data: {
    title: string;
    description: string;
    imageUrl?: string;
    targetUsers?: string[];
  }) => {
    return dispatch(sendPromotion(data) as any);
  }, [dispatch]);

  const setCurrentThreadLocal = useCallback((threadId: string | null) => {
    dispatch(setCurrentThread(threadId));
  }, [dispatch]);

  const addMessageLocal = useCallback((threadId: string, message: InboxMessage) => {
    dispatch(addNewMessage({ threadId, message }));
  }, [dispatch]);

  const updateMessageLocal = useCallback((threadId: string, messageId: string, content: string) => {
    dispatch(updateMessageLocally({ threadId, messageId, content }));
  }, [dispatch]);

  const deleteMessageLocal = useCallback((threadId: string, messageId: string) => {
    dispatch(deleteMessageLocally({ threadId, messageId }));
  }, [dispatch]);

  const clearInboxError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const resetInbox = useCallback(() => {
    dispatch(clearInbox());
  }, [dispatch]);

  const getUnreadCountByType = useCallback((threadType?: string) => {
    if (!threadType) {
      return threads.reduce((total, thread) => total + thread.unreadCount, 0);
    }
    return threads
      .filter(thread => thread.threadType === threadType)
      .reduce((total, thread) => total + thread.unreadCount, 0);
  }, [threads]);

  const getCurrentThreadMessages = useCallback(() => {
    if (!currentThread?.id) return [];
    return threadMessages[currentThread.id] || [];
  }, [currentThread, threadMessages]);

  const getThreadById = useCallback((threadId: string) => {
    return threads.find(thread => thread.id === threadId);
  }, [threads]);

  const hasMoreMessages = useCallback((threadId: string) => {
    return inboxState.pagination.messagesHasMore[threadId] || false;
  }, [inboxState.pagination.messagesHasMore]);

  const getNextMessagesPage = useCallback((threadId: string) => {
    return (inboxState.pagination.messagesPage[threadId] || 0) + 1;
  }, [inboxState.pagination.messagesPage]);

  const markPromotionAsRead = useCallback((promotionId: string) => {
    
    const updatedPromotions = promotions.map(promo => 
      promo.id === promotionId ? { ...promo, read: true } : promo
    );
    return updatedPromotions;
  }, [promotions]);

  
  const getThreadsByType = useCallback((type: string) => {
    return threads.filter(thread => thread.threadType === type);
  }, [threads]);

  
  const getPromotionsByDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return promotions.filter(promo => 
      promo.sentAt.split('T')[0] === dateStr
    );
  }, [promotions]);

  const getUnreadPromotionsCount = useCallback(() => {
    return promotions.filter(promo => !promo.read).length;
  }, [promotions]);

  return {
    // State
    threads,
    promotions,
    currentThread,
    threadMessages,
    loading,
    error,
    pagination,
    
    // Getters
    getCurrentThreadMessages,
    getThreadById,
    getUnreadCountByType,
    getThreadsByType,
    getPromotionsByDate,
    getUnreadPromotionsCount,
    hasMoreMessages,
    getNextMessagesPage,
    
    // Actions
    getThreads,
    getThreadDetail,
    getThreadMessages,
    createNewThread,
    sendNewMessage,
    editExistingMessage,
    deleteExistingMessage,
    markThreadRead,
    getPromotions,
    sendNewPromotion,
    setCurrentThreadLocal,
    addMessageLocal,
    updateMessageLocal,
    deleteMessageLocal,
    clearInboxError,
    resetInbox,
    markPromotionAsRead,
  };
};

export type UseReduxInboxReturn = ReturnType<typeof useReduxInbox>;