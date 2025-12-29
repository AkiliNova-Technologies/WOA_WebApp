import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/utils/api";

// Types
export interface InboxMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  mediaUrls?: string[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InboxThread {
  id: string;
  title?: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: "user" | "admin" | "system";
  }>;
  lastMessage?: InboxMessage;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  threadType: "order" | "support" | "promotion" | "general";
}

export interface PromotionMessage {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetAudience?: string[];
  sentAt: string;
  read: boolean;
  actionUrl?: string;
}

export interface InboxState {
  threads: InboxThread[];
  promotions: PromotionMessage[];
  currentThread: InboxThread | null;
  threadMessages: Record<string, InboxMessage[]>; // threadId -> messages
  loading: boolean;
  error: string | null;
  pagination: {
    threadsPage: number;
    threadsTotal: number;
    threadsHasMore: boolean;
    messagesPage: Record<string, number>; // threadId -> page
    messagesTotal: Record<string, number>; // threadId -> total
    messagesHasMore: Record<string, boolean>; // threadId -> hasMore
  };
}

const initialState: InboxState = {
  threads: [],
  promotions: [],
  currentThread: null,
  threadMessages: {},
  loading: false,
  error: null,
  pagination: {
    threadsPage: 1,
    threadsTotal: 0,
    threadsHasMore: true,
    messagesPage: {},
    messagesTotal: {},
    messagesHasMore: {},
  },
};

// Async Thunks
export const fetchThreads = createAsyncThunk(
  "inbox/fetchThreads",
  async (
    params: { page?: number; limit?: number; archived?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/api/v1/inbox/threads", { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch threads"
      );
    }
  }
);

export const fetchThreadDetail = createAsyncThunk(
  "inbox/fetchThreadDetail",
  async (threadId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/inbox/threads/${threadId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch thread details"
      );
    }
  }
);

export const fetchThreadMessages = createAsyncThunk(
  "inbox/fetchThreadMessages",
  async (
    {
      threadId,
      page = 1,
      limit = 20,
    }: { threadId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/api/v1/inbox/threads/${threadId}/messages`,
        {
          params: { page, limit },
        }
      );
      return { threadId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

export const createThread = createAsyncThunk(
  "inbox/createThread",
  async (
    data: { participants: string[]; title?: string; initialMessage?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/api/v1/inbox/threads", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create thread"
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "inbox/sendMessage",
  async (
    {
      threadId,
      content,
      mediaFiles,
    }: { threadId: string; content: string; mediaFiles?: File[] },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (mediaFiles) {
        mediaFiles.forEach((file) => {
          formData.append("media", file);
        });
      }

      const response = await api.post(
        `/api/v1/inbox/threads/${threadId}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return { threadId, message: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

export const editMessage = createAsyncThunk(
  "inbox/editMessage",
  async (
    { messageId, content }: { messageId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/api/v1/inbox/messages/${messageId}`, {
        content,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to edit message"
      );
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "inbox/deleteMessage",
  async (messageId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/v1/inbox/messages/${messageId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete message"
      );
    }
  }
);

export const markThreadAsRead = createAsyncThunk(
  "inbox/markThreadAsRead",
  async (threadId: string, { rejectWithValue }) => {
    try {
      await api.post(`/api/v1/inbox/threads/${threadId}/read`);
      return threadId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark thread as read"
      );
    }
  }
);

export const fetchPromotions = createAsyncThunk(
  "inbox/fetchPromotions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/inbox/promotions");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch promotions"
      );
    }
  }
);

export const sendPromotion = createAsyncThunk(
  "inbox/sendPromotion",
  async (
    data: {
      title: string;
      description: string;
      imageUrl?: string;
      targetUsers?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/api/v1/inbox/promotions", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send promotion"
      );
    }
  }
);

// Slice
const inboxSlice = createSlice({
  name: "inbox",
  initialState,
  reducers: {
    setCurrentThread: (state, action: PayloadAction<string | null>) => {
      if (action.payload) {
        state.currentThread =
          state.threads.find((t) => t.id === action.payload) || null;
      } else {
        state.currentThread = null;
      }
    },
    addNewMessage: (
      state,
      action: PayloadAction<{ threadId: string; message: InboxMessage }>
    ) => {
      const { threadId, message } = action.payload;

      // Add to thread messages
      if (!state.threadMessages[threadId]) {
        state.threadMessages[threadId] = [];
      }
      state.threadMessages[threadId].unshift(message);

      // Update thread's last message
      const threadIndex = state.threads.findIndex((t) => t.id === threadId);
      if (threadIndex !== -1) {
        state.threads[threadIndex].lastMessage = message;
        state.threads[threadIndex].updatedAt = message.createdAt;

        // Move thread to top
        const thread = state.threads.splice(threadIndex, 1)[0];
        state.threads.unshift(thread);
      }

      // If it's not from current user, increment unread count
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (
        message.senderId !== currentUser.id &&
        state.currentThread?.id !== threadId
      ) {
        state.threads[0].unreadCount += 1;
      }
    },
    updateMessageLocally: (
      state,
      action: PayloadAction<{
        threadId: string;
        messageId: string;
        content: string;
      }>
    ) => {
      const { threadId, messageId, content } = action.payload;
      const messages = state.threadMessages[threadId];
      if (messages) {
        const messageIndex = messages.findIndex((m) => m.id === messageId);
        if (messageIndex !== -1) {
          messages[messageIndex].content = content;
          messages[messageIndex].isEdited = true;
          messages[messageIndex].updatedAt = new Date().toISOString();
        }
      }

      // Update last message if needed
      const threadIndex = state.threads.findIndex((t) => t.id === threadId);
      if (
        threadIndex !== -1 &&
        state.threads[threadIndex].lastMessage?.id === messageId
      ) {
        state.threads[threadIndex].lastMessage!.content = content;
        state.threads[threadIndex].lastMessage!.isEdited = true;
        state.threads[threadIndex].lastMessage!.updatedAt =
          new Date().toISOString();
      }
    },
    deleteMessageLocally: (
      state,
      action: PayloadAction<{ threadId: string; messageId: string }>
    ) => {
      const { threadId, messageId } = action.payload;
      const messages = state.threadMessages[threadId];
      if (messages) {
        const messageIndex = messages.findIndex((m) => m.id === messageId);
        if (messageIndex !== -1) {
          messages[messageIndex].isDeleted = true;
          messages[messageIndex].content = "This message was deleted";
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearInbox: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Threads
      .addCase(fetchThreads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads =
          action.payload.threads || action.payload.data || action.payload;
        state.pagination.threadsTotal =
          action.payload.total || action.payload.threads?.length || 0;
        state.pagination.threadsHasMore = action.payload.hasMore || false;
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Thread Detail
      .addCase(fetchThreadDetail.fulfilled, (state, action) => {
        state.currentThread = action.payload;
        // Update thread in threads list
        const index = state.threads.findIndex(
          (t) => t.id === action.payload.id
        );
        if (index !== -1) {
          state.threads[index] = action.payload;
        }
      })

      // Fetch Thread Messages
      .addCase(fetchThreadMessages.fulfilled, (state, action) => {
        const { threadId, data } = action.payload;
        const messages = data.messages || data.data || data;

        if (!state.threadMessages[threadId]) {
          state.threadMessages[threadId] = [];
        }

        // For pagination, we append messages
        if (state.pagination.messagesPage[threadId] > 1) {
          state.threadMessages[threadId].push(...messages);
        } else {
          state.threadMessages[threadId] = messages;
        }

        state.pagination.messagesTotal[threadId] =
          data.total || messages.length;
        state.pagination.messagesHasMore[threadId] = data.hasMore || false;
      })

      // Create Thread
      .addCase(createThread.fulfilled, (state, action) => {
        state.threads.unshift(action.payload);
      })

      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { threadId, message } = action.payload;

        // Add message to thread
        if (!state.threadMessages[threadId]) {
          state.threadMessages[threadId] = [];
        }
        state.threadMessages[threadId].unshift(message);

        // Update thread's last message and move to top
        const threadIndex = state.threads.findIndex((t) => t.id === threadId);
        if (threadIndex !== -1) {
          state.threads[threadIndex].lastMessage = message;
          state.threads[threadIndex].updatedAt = message.createdAt;
          state.threads[threadIndex].unreadCount = 0; // Reset unread count for sent messages

          // Move thread to top
          const thread = state.threads.splice(threadIndex, 1)[0];
          state.threads.unshift(thread);
        }
      })

      // Edit Message
      .addCase(editMessage.fulfilled, (state, action) => {
        const updatedMessage = action.payload;

        // Find and update message in threadMessages
        Object.keys(state.threadMessages).forEach((threadId) => {
          const messages = state.threadMessages[threadId];
          if (!messages) return;

          const messageIndex = messages.findIndex(
            (m) => m.id === updatedMessage.id
          );
          if (messageIndex !== -1) {
            messages[messageIndex] = updatedMessage;

            // Update last message if needed
            const threadIndex = state.threads.findIndex(
              (t) => t.id === threadId
            );
            if (threadIndex !== -1) {
              const thread = state.threads[threadIndex];
              if (thread.lastMessage?.id === updatedMessage.id) {
                thread.lastMessage = updatedMessage;
              }
            }
          }
        });
      })

      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const deletedMessage = action.payload;
        // Mark message as deleted in threadMessages
        Object.keys(state.threadMessages).forEach((threadId) => {
          const messages = state.threadMessages[threadId];
          const messageIndex = messages.findIndex(
            (m) => m.id === deletedMessage.id
          );
          if (messageIndex !== -1) {
            messages[messageIndex].isDeleted = true;
            messages[messageIndex].content = "This message was deleted";
          }
        });
      })

      // Mark Thread as Read
      .addCase(markThreadAsRead.fulfilled, (state, action) => {
        const threadId = action.payload;
        const threadIndex = state.threads.findIndex((t) => t.id === threadId);
        if (threadIndex !== -1) {
          state.threads[threadIndex].unreadCount = 0;
        }
      })

      // Fetch Promotions
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.promotions =
          action.payload.promotions || action.payload.data || action.payload;
      })

      // Send Promotion
      .addCase(sendPromotion.fulfilled, (state, action) => {
        state.promotions.unshift(action.payload);
      });
  },
});

export const {
  setCurrentThread,
  addNewMessage,
  updateMessageLocally,
  deleteMessageLocally,
  clearError,
  clearInbox,
} = inboxSlice.actions;

export default inboxSlice.reducer;
