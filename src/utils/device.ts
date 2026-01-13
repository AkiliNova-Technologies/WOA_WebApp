// Device detection utilities
export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'smart-tv' | 'wearable';
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web';
  appVersion: string;
  osVersion: string;
  browserName?: string;
  browserVersion?: string;
  screenResolution?: string;
  language: string;
  timezone: string;
  manufacturer?: string;
  model?: string;
}

// Generate a unique device ID
export const generateDeviceId = (): string => {
  if (typeof window === 'undefined') {
    return 'server-side-' + Date.now();
  }
  
  // Try to get existing device ID from localStorage
  const storedDeviceId = localStorage.getItem('deviceId');
  if (storedDeviceId) {
    return storedDeviceId;
  }
  
  // Generate new device ID
  const deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('deviceId', deviceId);
  return deviceId;
};

// Get current device info
export const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {
      deviceId: 'server-side',
      deviceName: 'Server',
      deviceType: 'desktop',
      platform: 'web',
      appVersion: '1.0.0',
      osVersion: 'Unknown',
      language: 'en-US',
      timezone: 'UTC',
    };
  }

  const ua = navigator.userAgent;
  const deviceId = generateDeviceId();
  
  // Detect device type
  let deviceType: DeviceInfo['deviceType'] = 'desktop';
  let deviceName = 'Unknown Device';
  let platform: DeviceInfo['platform'] = 'web';
  let osVersion = 'Unknown';
  let manufacturer, model;

  // iOS detection
  if (/iPhone|iPad|iPod/.test(ua)) {
    deviceType = /iPad/.test(ua) ? 'tablet' : 'mobile';
    platform = 'ios';
    deviceName = /iPhone/.test(ua) ? 'iPhone' : 'iPad';
    const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (match) {
      osVersion = `iOS ${match[1]}.${match[2]}`;
    }
  }
  // Android detection
  else if (/Android/.test(ua)) {
    deviceType = /Mobile/.test(ua) ? 'mobile' : 'tablet';
    platform = 'android';
    deviceName = 'Android Device';
    const match = ua.match(/Android (\d+\.\d+)/);
    if (match) {
      osVersion = `Android ${match[1]}`;
    }
  }
  // Windows detection
  else if (/Windows/.test(ua)) {
    platform = 'windows';
    deviceName = 'Windows PC';
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    if (match) {
      osVersion = `Windows ${match[1]}`;
    }
  }
  // macOS detection
  else if (/Macintosh|Mac OS X/.test(ua)) {
    platform = 'macos';
    deviceName = 'Mac';
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    if (match) {
      osVersion = `macOS ${match[1].replace('_', '.')}`;
    }
  }
  // Linux detection
  else if (/Linux/.test(ua)) {
    platform = 'linux';
    deviceName = 'Linux PC';
    osVersion = 'Linux';
  }

  // Browser detection
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (/Firefox/.test(ua)) {
    browserName = 'Firefox';
    const match = ua.match(/Firefox\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (/Chrome/.test(ua) && !/Edge/.test(ua)) {
    browserName = 'Chrome';
    const match = ua.match(/Chrome\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    browserName = 'Safari';
    const match = ua.match(/Version\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (/Edge/.test(ua)) {
    browserName = 'Edge';
    const match = ua.match(/Edge\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }

  // Screen resolution
  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  // Get user's custom device name if available
  const customDeviceName = localStorage.getItem('deviceName');
  if (customDeviceName) {
    deviceName = customDeviceName;
  }

  // Get app version from package.json or environment
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

  return {
    deviceId,
    deviceName,
    deviceType,
    platform,
    appVersion,
    osVersion,
    browserName,
    browserVersion,
    screenResolution,
    language: navigator.language || 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    manufacturer,
    model,
  };
};

// Get FCM token (you'll need to integrate Firebase Messaging)
export const getFCMToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  
  // Check if Firebase Messaging is available
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      // Initialize Firebase Messaging
      const { getMessaging, getToken } = await import('firebase/messaging');
      const messaging = getMessaging();
      
      // Request permission and get token
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        return token;
      }
    } catch (error) {
      console.warn('Failed to get FCM token:', error);
    }
  }
  return null;
};

// Set custom device name
export const setDeviceName = (name: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('deviceName', name);
  }
};