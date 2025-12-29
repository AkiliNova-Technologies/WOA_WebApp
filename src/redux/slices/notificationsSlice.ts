import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';

export interface Notification {
  id: string;
  title: string;
  body: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Updated to match your notification settings structure
export interface NotificationPreferences {
  promotions: boolean;
  myActivity: boolean;
  orderUpdates: boolean;
  wishlistFavorites: boolean;
  messages: boolean;
  reviewsFeedback: boolean;
  // You can add more fields as needed
}

export interface NotificationsState {
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  preferences: null,
  unreadCount: 0,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 20,
  hasMore: false,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (page: number = 1, { getState }) => {
    const state = getState() as { notifications: NotificationsState };
    const response = await api.get(`/api/v1/notifications?page=${page}&limit=${state.notifications.limit}`);
    return response.data;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    await api.patch(`/api/v1/notifications/${notificationId}/read`);
    return notificationId;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    await api.patch('/api/v1/notifications/read-all');
    return null;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string) => {
    await api.delete(`/api/v1/notifications/${notificationId}`);
    return notificationId;
  }
);

export const fetchNotificationPreferences = createAsyncThunk(
  'notifications/fetchPreferences',
  async () => {
    const response = await api.get('/api/v1/notifications/preferences');
    return response.data;
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  'notifications/updatePreferences',
  async (preferences: Partial<NotificationPreferences>) => {
    const response = await api.put('/api/v1/notifications/preferences', preferences);
    return response.data;
  }
);

export const resetNotificationPreferences = createAsyncThunk(
  'notifications/resetPreferences',
  async () => {
    const response = await api.post('/api/v1/notifications/preferences/reset');
    return response.data;
  }
);

// Add test notification thunk
export const sendTestNotification = createAsyncThunk(
  'notifications/sendTest',
  async () => {
    const response = await api.post('/api/v1/notifications/send-test');
    return response.data;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
      state.total += 1;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.total = 0;
      state.page = 1;
      state.hasMore = false;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPreferences: (state, action: PayloadAction<NotificationPreferences>) => {
      state.preferences = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      const notifications = action.payload.data || action.payload.notifications || action.payload;
      const total = action.payload.total || action.payload.count || notifications.length;
      
      if (action.payload.page === 1 || action.payload.page === undefined) {
        state.notifications = notifications;
      } else {
        state.notifications = [...state.notifications, ...notifications];
      }
      
      state.unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
      state.total = total;
      state.page = action.payload.page || 1;
      state.hasMore = state.notifications.length < total;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch notifications';
    });

    // Mark as read
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // Mark all as read
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    });

    // Delete notification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    });

    // Fetch preferences
    builder.addCase(fetchNotificationPreferences.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
      state.loading = false;
      state.preferences = action.payload.data || action.payload;
    });
    builder.addCase(fetchNotificationPreferences.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch preferences';
    });

    // Update preferences
    builder.addCase(updateNotificationPreferences.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateNotificationPreferences.fulfilled, (state, action) => {
      state.loading = false;
      state.preferences = action.payload.data || action.payload;
    });
    builder.addCase(updateNotificationPreferences.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update preferences';
    });

    // Reset preferences
    builder.addCase(resetNotificationPreferences.fulfilled, (state, action) => {
      state.preferences = action.payload.data || action.payload;
    });
  },
});

export const {
  setNotifications,
  addNotification,
  clearNotifications,
  incrementUnreadCount,
  decrementUnreadCount,
  setPage,
  setPreferences,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;