import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store'; 
import { 
  registerDeviceSession, 
  updateDeviceFCMToken,
  selectCurrentDeviceSession,
  selectIsAuthenticated,
  logoutAsync 
} from '@/redux/slices/authSlice';
import { getFCMToken } from '@/utils/device';
import { getDeviceSyncService, destroyDeviceSyncService } from '@/services/deviceSyncService';

export const useDeviceSession = () => {
  const dispatch = useDispatch<AppDispatch>(); 
  const currentSession = useSelector(selectCurrentDeviceSession);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Initialize device session on app start
  const initDeviceSession = useCallback(async () => {
    try {
      // Only register if we are authenticated but no active session
      if (isAuthenticated && !currentSession) {
        const fcmToken = await getFCMToken();
        await dispatch(registerDeviceSession(fcmToken || undefined)).unwrap();
      }
      
      // Initialize WebSocket connection for real-time updates
      if (isAuthenticated) {
        getDeviceSyncService();
      }
    } catch (error) {
      console.warn('Device session initialization failed:', error);
    }
  }, [dispatch, currentSession, isAuthenticated]);

  // Update FCM token when it changes
  const updateFCMToken = useCallback(async () => {
    try {
      const fcmToken = await getFCMToken();
      if (fcmToken) {
        await dispatch(updateDeviceFCMToken(fcmToken)).unwrap();
      }
    } catch (error) {
      console.warn('Failed to update FCM token:', error);
    }
  }, [dispatch]);

  // Cleanup on logout or unmount
  const cleanupDeviceSession = useCallback(() => {
    destroyDeviceSyncService();
  }, []);

  // Force logout from all devices
  const logoutAllDevices = useCallback(async () => {
    try {
      await dispatch(logoutAsync()).unwrap(); // Use logoutAsync
      destroyDeviceSyncService();
    } catch (error) {
      console.error('Failed to logout from all devices:', error);
    }
  }, [dispatch]);

  return {
    initDeviceSession,
    updateFCMToken,
    cleanupDeviceSession,
    logoutAllDevices,
    currentSession,
  };
};