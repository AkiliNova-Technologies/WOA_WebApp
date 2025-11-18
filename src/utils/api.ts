import axios from 'axios';

const BASE_URL = "https://kampala-nights-backend.onrender.com";

if (!BASE_URL) {
  console.warn("❌ BASE_URL is not defined in Constants.expoConfig.extra");
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      try {
        const authData = localStorage.getItem('authData');
        if (authData) {
          const parsedData = JSON.parse(authData);
          if (parsedData.token) {
            config.headers.Authorization = `Bearer ${parsedData.token}`;
            console.log('✅ Added auth token to request');
          }
        }
      } catch (error) {
        console.error('Error reading auth token from localStorage:', error);
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
  (error) => {
    console.error('❌ API error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    // Handle 401 errors specifically
    if (error.response?.status === 401) {
      // Token is invalid/expired - clear it
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authData');
      }
      console.warn('🔐 Authentication failed - token cleared');
    }
    
    return Promise.reject(error);
  }
);

export default api;