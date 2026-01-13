import { store } from '@/redux/store';
import { 
  fetchDeviceSessions, 
  logout
} from '@/redux/slices/authSlice';

class DeviceSyncService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.init();
  }

  private init() {
    this.setupWebSocket();
  }

  private setupWebSocket() {
    if (typeof window === 'undefined') return;

    // Get token from localStorage
    const authData = localStorage.getItem('authData');
    if (!authData) return;

    const parsedData = JSON.parse(authData);
    const token = parsedData.tokens?.accessToken;
    if (!token) return;

    const wsUrl = `wss://woa-backend.onrender.com/ws?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected for device sync');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'SESSION_UPDATE':
          // Update device sessions list
          store.dispatch(fetchDeviceSessions());
          break;
          
        case 'DEVICE_REMOVED':
          const { deviceId } = message.payload;
          const state = store.getState();
          const currentDeviceId = state.auth.deviceSessions.currentSession?.deviceId;
          
          // If current device was removed, log out
          if (deviceId === currentDeviceId) {
            store.dispatch(logout());
          } else {
            // Just refresh the device sessions list
            store.dispatch(fetchDeviceSessions());
          }
          break;
          
        case 'FORCE_LOGOUT':
          // Force logout on all devices
          store.dispatch(logout());
          break;
          
        case 'DATA_UPDATE':
          // Handle real-time data updates
          this.handleDataUpdate(message.payload);
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleDataUpdate(payload: any) {
    // Dispatch actions based on data type
    const { dataType, data } = payload;
    
    switch (dataType) {
      case 'USER_UPDATE':
        // Update user in store
        store.dispatch({ type: 'auth/updateUser', payload: data });
        break;
        
      // Add more cases as needed
    }
  }


  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.setupWebSocket();
    }, delay);
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton instance
let deviceSyncService: DeviceSyncService | null = null;

export const getDeviceSyncService = () => {
  if (!deviceSyncService && typeof window !== 'undefined') {
    deviceSyncService = new DeviceSyncService();
  }
  return deviceSyncService;
};

export const destroyDeviceSyncService = () => {
  if (deviceSyncService) {
    deviceSyncService.disconnect();
    deviceSyncService = null;
  }
};