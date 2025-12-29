import axios from 'axios';
import { auth } from '@/config/firebase';

const BASE_URL = "https://woa-backend.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Try to get token from localStorage first (backend auth)
    if (typeof window !== 'undefined') {
      try {
        const authData = localStorage.getItem('authData');
        if (authData) {
          const parsedData = JSON.parse(authData);
          if (parsedData.token) {
            config.headers.Authorization = `Bearer ${parsedData.token}`;
            console.log('✅ Added backend token to request');
            return config;
          }
        }
      } catch (error) {
        console.error('Error reading auth token from localStorage:', error);
      }
    }
    
    // If no backend token, try Firebase token for specific endpoints
    // (Only for auth endpoints that accept Firebase tokens)
    const isAuthEndpoint = config.url?.includes('/auth/');
    if (isAuthEndpoint && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        if (token) {
          // For auth endpoints, we might send Firebase token in body or header
          // Based on your API design
          console.log('✅ Firebase user authenticated, token available');
        }
      } catch (error) {
        console.error('Error getting Firebase token:', error);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    // Handle 401 errors - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Check if this is a backend token that needs refresh
      const authData = localStorage.getItem('authData');
      if (authData) {
        const parsedData = JSON.parse(authData);
        if (parsedData.refreshToken) {
          try {
            // Try to refresh backend token
            const refreshResponse = await api.post('/api/v1/auth/refresh');
            
            if (refreshResponse.data.tokens?.accessToken) {
              // Update localStorage
              parsedData.token = refreshResponse.data.tokens.accessToken;
              localStorage.setItem('authData', JSON.stringify(parsedData));
              
              // Retry with new token
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.tokens.accessToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Backend token refresh failed:', refreshError);
          }
        }
      }
      
      // If backend refresh failed, try Firebase refresh
      if (auth.currentUser) {
        try {
          const newToken = await auth.currentUser.getIdToken(true);
          console.log('🔄 Firebase token refreshed automatically');
          
          // Update any stored Firebase token
          if (typeof window !== 'undefined') {
            const currentAuthData = localStorage.getItem('authData');
            if (currentAuthData) {
              const parsed = JSON.parse(currentAuthData);
              if (parsed.firebaseToken) {
                parsed.firebaseToken = newToken;
                localStorage.setItem('authData', JSON.stringify(parsed));
              }
            }
          }
        } catch (firebaseError) {
          console.error('Firebase token refresh failed:', firebaseError);
        }
      }
      
      // Clear auth data if all refresh attempts fail
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authData');
        localStorage.removeItem('user');
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - no response received');
    }
    
    return Promise.reject(error);
  }
);

export default api;