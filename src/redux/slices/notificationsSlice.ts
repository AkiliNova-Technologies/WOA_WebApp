import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import  api  from '@/utils/api';

export interface Notification {
  id: string;
  title: string;
  body: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    order_updates: boolean;
    promotions: boolean;
    security: boolean;
    system: boolean;
  };
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
    await api.patch('/notifications/read-all');
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
    const response = await api.put('/notifications/preferences', preferences);
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
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.page === 1) {
        state.notifications = action.payload.notifications;
      } else {
        state.notifications = [...state.notifications, ...action.payload.notifications];
      }
      state.unreadCount = action.payload.notifications.filter((n: Notification) => !n.isRead).length;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.hasMore = state.notifications.length < action.payload.total;
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
    builder.addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
      state.preferences = action.payload;
    });

    // Update preferences
    builder.addCase(updateNotificationPreferences.fulfilled, (state, action) => {
      state.preferences = action.payload;
    });

    // Reset preferences
    builder.addCase(resetNotificationPreferences.fulfilled, (state, action) => {
      state.preferences = action.payload;
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
} = notificationsSlice.actions;

export default notificationsSlice.reducer;