import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { auth } from "@/config/firebase";

const BASE_URL = "https://woa-backend.onrender.com";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const refreshApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.url?.includes("/auth/refresh")) {
      return config;
    }

    // Try to get token from localStorage first (backend auth)
    if (typeof window !== "undefined") {
      try {
        const authData = localStorage.getItem("authData");
        if (authData) {
          const parsedData = JSON.parse(authData);
          // Use accessToken from the tokens object
          if (parsedData.tokens?.accessToken) {
            config.headers.Authorization = `Bearer ${parsedData.tokens.accessToken}`;
            console.log("✅ Added backend token to request");
            return config;
          }
        }
      } catch (error) {
        console.error("Error reading auth token from localStorage:", error);
      }
    }

    const isAuthEndpoint = config.url?.includes("/auth/");
    if (isAuthEndpoint && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        if (token) {
          console.log("✅ Firebase user authenticated, token available");
        }
      } catch (error) {
        console.error("Error getting Firebase token:", error);
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

const refreshBackendToken = async (): Promise<string> => {
  try {
    if (typeof window === "undefined") {
      throw new Error("Window is not defined");
    }

    const authData = localStorage.getItem("authData");
    if (!authData) {
      throw new Error("No authentication data found");
    }

    const parsedData = JSON.parse(authData);
    const refreshToken = parsedData.tokens?.refreshToken;

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("🔄 Attempting to refresh backend token...");

    // Call refresh endpoint with refresh token as Authorization header
    const response = await refreshApi.post(
      "/api/v1/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    if (response.data.tokens?.accessToken) {
      // Update localStorage with new tokens, preserving user data
      const updatedAuthData = {
        ...parsedData,
        tokens: {
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken || refreshToken,
          tokenType: response.data.tokens.tokenType || "Bearer",
          expiresInSec: response.data.tokens.expiresInSec || 900,
          refreshExpiresInSec: response.data.tokens.refreshExpiresInSec || 604800,
        },
        tokenExpiry: Date.now() + ((response.data.tokens.expiresInSec || 900) * 1000),
      };

      localStorage.setItem("authData", JSON.stringify(updatedAuthData));

      // Update default headers
      api.defaults.headers.common.Authorization = `Bearer ${response.data.tokens.accessToken}`;

      console.log("✅ Backend token refreshed successfully");
      return response.data.tokens.accessToken;
    }

    throw new Error("Invalid refresh response format");
  } catch (error: any) {
    console.error("❌ Backend token refresh failed:", error);
    
    // Log more details about the error
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }

    throw error;
  }
};

// Function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minutes buffer
    return now >= expiry - buffer;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return false; // If can't parse, assume not expired
  }
};

// Response interceptor with enhanced token refresh
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    console.error("❌ API error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle 401 errors - token expired
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      // Don't retry auth endpoints
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshBackendToken();

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        
        // Don't redirect automatically
        // Just reject the promise and let components handle it
        processQueue(refreshError, null);
        
        // Clear auth data but don't redirect
        if (typeof window !== "undefined") {
          localStorage.removeItem("authData");
          localStorage.removeItem("user");
        }
        
        return Promise.reject(new Error("Session expired. Please login again."));
      } finally {
        isRefreshing = false;
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error - no response received");

      // Check if we should retry network errors
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

        // Only retry up to 3 times
        if (originalRequest._retryCount <= 3) {
          const retryDelay = originalRequest._retryCount * 1000;

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(api(originalRequest));
            }, Math.min(retryDelay, 5000));
          });
        }
      }
    }

    return Promise.reject(error);
  }
);

// Track if scheduler is running
let schedulerCleanup: (() => void) | null = null;

// Function to proactively refresh token before expiry
export const startTokenRefreshScheduler = () => {
  // Don't start if already running
  if (schedulerCleanup) {
    console.log("⚠️ Token refresh scheduler already running");
    return schedulerCleanup;
  }

  if (typeof window === "undefined") {
    console.log("⚠️ Window not defined, cannot start scheduler");
    return null;
  }

  const checkAndRefreshToken = async () => {
    try {
      const authData = localStorage.getItem("authData");
      if (!authData) return;

      const parsedData = JSON.parse(authData);
      const accessToken = parsedData.tokens?.accessToken;
      
      if (!accessToken) return;

      // Check if token is about to expire (within 5 minutes)
      if (isTokenExpired(accessToken)) {
        console.log("🔄 Token is about to expire, refreshing proactively...");
        await refreshBackendToken();
      }
    } catch (error) {
      console.error("Proactive token refresh failed:", error);
    }
  };

  // Check every minute
  const intervalId = setInterval(checkAndRefreshToken, 60 * 1000);

  // Also check on initial load
  checkAndRefreshToken();

  console.log("✅ Token refresh scheduler started");

  // Return cleanup function
  schedulerCleanup = () => {
    clearInterval(intervalId);
    schedulerCleanup = null;
    console.log("🛑 Token refresh scheduler stopped");
  };

  return schedulerCleanup;
};

// Function to stop the scheduler
export const stopTokenRefreshScheduler = () => {
  if (schedulerCleanup) {
    schedulerCleanup();
  }
};

// Function to manually refresh token
export const manualTokenRefresh = async (): Promise<boolean> => {
  try {
    await refreshBackendToken();
    return true;
  } catch (error) {
    console.error("Manual token refresh failed:", error);
    return false;
  }
};

// Interface for auth state
interface AuthState {
  hasToken: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: any;
  tokenExpiry?: number;
  userId?: string;
  email?: string;
  role?: string;
  emailVerified?: boolean;
}

// Function to get current auth state
export const getAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return { 
      hasToken: false, 
      accessToken: null, 
      refreshToken: null,
      user: null 
    };
  }

  try {
    const authData = localStorage.getItem("authData");
    if (!authData) {
      return { 
        hasToken: false, 
        accessToken: null, 
        refreshToken: null,
        user: null 
      };
    }

    const parsedData = JSON.parse(authData);
    return {
      hasToken: !!parsedData.tokens?.accessToken,
      accessToken: parsedData.tokens?.accessToken || null,
      refreshToken: parsedData.tokens?.refreshToken || null,
      tokenExpiry: parsedData.tokenExpiry,
      userId: parsedData.userId,
      email: parsedData.email,
      role: parsedData.role,
      emailVerified: parsedData.emailVerified,
      user: parsedData,
    };
  } catch (error) {
    console.error("Error getting auth state:", error);
    return { 
      hasToken: false, 
      accessToken: null, 
      refreshToken: null,
      user: null 
    };
  }
};

// Function to check if user should be logged out
export const checkAuthSession = (): boolean => {
  if (typeof window === "undefined") return false;

  const authData = localStorage.getItem("authData");
  if (!authData) return false;

  try {
    const parsedData = JSON.parse(authData);

    // Check if we have both access and refresh tokens
    if (!parsedData.tokens?.accessToken || !parsedData.tokens?.refreshToken) {
      return false;
    }

    // Check if access token is expired
    if (isTokenExpired(parsedData.tokens.accessToken)) {
      console.log("⚠️ Access token expired, attempting refresh...");
      // Don't return false immediately, let the refresh happen
      return true; // Still valid session, refresh will happen automatically
    }

    return true;
  } catch (error) {
    console.error("Error checking auth session:", error);
    return false;
  }
};

// Helper function to save auth data after login
export const saveAuthData = (loginResponse: any) => {
  if (typeof window === "undefined") return;

  try {
    const authData = {
      userId: loginResponse.userId,
      email: loginResponse.email,
      role: loginResponse.role,
      emailVerified: loginResponse.emailVerified,
      forcePasswordChange: loginResponse.forcePasswordChange,
      tokens: {
        accessToken: loginResponse.tokens.accessToken,
        refreshToken: loginResponse.tokens.refreshToken,
        tokenType: loginResponse.tokens.tokenType,
        expiresInSec: loginResponse.tokens.expiresInSec,
        refreshExpiresInSec: loginResponse.tokens.refreshExpiresInSec,
      },
      tokenExpiry: Date.now() + (loginResponse.tokens.expiresInSec * 1000),
    };

    localStorage.setItem("authData", JSON.stringify(authData));
    
    // Set default authorization header
    api.defaults.headers.common.Authorization = `Bearer ${loginResponse.tokens.accessToken}`;
    
    console.log("✅ Auth data saved successfully");
  } catch (error) {
    console.error("Error saving auth data:", error);
  }
};

// Helper function to clear auth data
export const clearAuthData = () => {
  if (typeof window === "undefined") return;

  // Stop the scheduler when clearing auth
  stopTokenRefreshScheduler();

  localStorage.removeItem("authData");
  localStorage.removeItem("user");
  delete api.defaults.headers.common.Authorization;
  
  console.log("✅ Auth data cleared");
};

// DON'T auto-initialize the scheduler here!
// Instead, it should be started by the AuthInitializer component

export default api;