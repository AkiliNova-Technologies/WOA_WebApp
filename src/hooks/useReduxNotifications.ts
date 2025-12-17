import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';
import { type RootState } from '@/redux/store';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  fetchNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  addNotification,
  clearNotifications,
  setPage,
  type Notification,
  type NotificationPreferences,
} from '@/redux/slices/notificationsSlice';

// Define the dispatch type that can handle thunks
export type AppThunkDispatch = ThunkDispatch<RootState, any, AnyAction>;

export const useReduxNotifications = () => {
  // Use the typed dispatch
  const dispatch = useDispatch<AppThunkDispatch>();
  
  const {
    notifications,
    preferences,
    unreadCount,
    loading,
    error,
    total,
    page,
    limit,
    hasMore,
  } = useSelector((state: RootState) => state.notifications);

  return {
    // State
    notifications,
    preferences,
    unreadCount,
    loading,
    error,
    total,
    page,
    limit,
    hasMore,

    // Actions - Now properly typed
    getNotifications: (pageNumber?: number) => 
      dispatch(fetchNotifications(pageNumber || page)),
    markAsRead: (notificationId: string) => 
      dispatch(markNotificationAsRead(notificationId)),
    markAllAsRead: () => 
      dispatch(markAllNotificationsAsRead()),
    deleteNotification: (notificationId: string) => 
      dispatch(deleteNotification(notificationId)),
    getPreferences: () => 
      dispatch(fetchNotificationPreferences()),
    updatePreferences: (prefs: Partial<NotificationPreferences>) => 
      dispatch(updateNotificationPreferences(prefs)),
    resetPreferences: () => 
      dispatch(resetNotificationPreferences()),
    addNotification: (notification: Notification) => 
      dispatch(addNotification(notification)),
    clearNotifications: () => 
      dispatch(clearNotifications()),
    setPage: (pageNumber: number) => 
      dispatch(setPage(pageNumber)),

    // Helper methods
    getUnreadNotifications: () => 
      notifications.filter(n => !n.isRead),
    getReadNotifications: () => 
      notifications.filter(n => n.isRead),
    getNotificationsByCategory: (category: string) => 
      notifications.filter(n => n.category === category),
    
    // Real-time updates
    receiveRealTimeNotification: (notification: Notification) => {
      dispatch(addNotification(notification));
    },
  };
};