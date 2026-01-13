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

// Interface for auth state
interface AuthData {
  userId: string;
  email: string;
  role: string;
  emailVerified: boolean;
  forcePasswordChange?: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresInSec: number;
    refreshExpiresInSec: number;
  };
  tokenExpiry: number;
}

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
      user: null,
    };
  }

  try {
    const authData = localStorage.getItem("authData");
    if (!authData) {
      return {
        hasToken: false,
        accessToken: null,
        refreshToken: null,
        user: null,
      };
    }

    const parsedData: AuthData = JSON.parse(authData);
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
      user: null,
    };
  }
};

// Function to check if token is expired or about to expire
const isTokenExpired = (token: string, bufferMinutes: number = 5): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const buffer = bufferMinutes * 60 * 1000; // Buffer in milliseconds
    return now >= expiry - buffer;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true; // If can't parse, assume expired to be safe
  }
};

// Helper function to save auth data after login
export const saveAuthData = (loginResponse: {
  userId: string;
  email: string;
  role: string;
  emailVerified: boolean;
  forcePasswordChange?: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresInSec: number;
    refreshExpiresInSec: number;
  };
}) => {
  if (typeof window === "undefined") return;

  try {
    const authData: AuthData = {
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
      tokenExpiry: Date.now() + loginResponse.tokens.expiresInSec * 1000,
    };

    localStorage.setItem("authData", JSON.stringify(authData));

    // Set default authorization header
    api.defaults.headers.common.Authorization = `Bearer ${loginResponse.tokens.accessToken}`;

    console.log("✅ Auth data saved successfully");
  } catch (error) {
    console.error("Error saving auth data:", error);
  }
};

// Function to refresh backend token
const refreshBackendToken = async (): Promise<string> => {
  try {
    if (typeof window === "undefined") {
      throw new Error("Window is not defined");
    }

    const authData = localStorage.getItem("authData");
    if (!authData) {
      throw new Error("No authentication data found");
    }

    const parsedData: AuthData = JSON.parse(authData);
    const refreshToken = parsedData.tokens?.refreshToken;

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("🔄 Attempting to refresh backend token...");

    // IMPORTANT: Send refresh token in Authorization header
    const response = await refreshApi.post(
      "/api/v1/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    if (response.data.tokens?.accessToken && response.data.tokens?.refreshToken) {
      // Update localStorage with new tokens
      const updatedAuthData: AuthData = {
        userId: response.data.userId,
        email: response.data.email,
        role: response.data.role,
        emailVerified: response.data.emailVerified,
        forcePasswordChange: parsedData.forcePasswordChange,
        tokens: {
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          tokenType: response.data.tokens.tokenType || "Bearer",
          expiresInSec: response.data.tokens.expiresInSec || 900,
          refreshExpiresInSec: response.data.tokens.refreshExpiresInSec || 604800,
        },
        tokenExpiry: Date.now() + (response.data.tokens.expiresInSec || 900) * 1000,
      };

      localStorage.setItem("authData", JSON.stringify(updatedAuthData));

      // Update default headers
      api.defaults.headers.common.Authorization = `Bearer ${response.data.tokens.accessToken}`;

      // Also update user in localStorage if needed
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.emailVerified = response.data.emailVerified;
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
          console.error("Error updating user data:", e);
        }
      }

      console.log("✅ Backend token refreshed successfully");
      return response.data.tokens.accessToken;
    }

    throw new Error("Invalid refresh response format");
  } catch (error: any) {
    console.error("❌ Backend token refresh failed:", error);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }

    // Clear invalid auth data
    if (typeof window !== "undefined") {
      localStorage.removeItem("authData");
      localStorage.removeItem("user");
      delete api.defaults.headers.common.Authorization;
    }

    throw error;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth for refresh endpoint
    if (config.url?.includes("/auth/refresh")) {
      return config;
    }

    // Try to get token from localStorage
    if (typeof window !== "undefined") {
      try {
        const authData = localStorage.getItem("authData");
        if (authData) {
          const parsedData: AuthData = JSON.parse(authData);
          
          if (parsedData.tokens?.accessToken) {
            // Check if token is expired or about to expire
            if (isTokenExpired(parsedData.tokens.accessToken, 5)) {
              console.log("⚠️ Token expired or about to expire, refreshing...");
              
              // If not already refreshing, trigger refresh
              if (!isRefreshing) {
                try {
                  const newToken = await refreshBackendToken();
                  config.headers.Authorization = `Bearer ${newToken}`;
                  return config;
                } catch (error) {
                  console.error("Failed to refresh token in request interceptor:", error);
                  // Continue with existing token, let response interceptor handle it
                }
              }
            }
            
            config.headers.Authorization = `Bearer ${parsedData.tokens.accessToken}`;
            return config;
          }
        }
      } catch (error) {
        console.error("Error reading auth token from localStorage:", error);
      }
    }

    // Fallback to Firebase auth for specific endpoints
    const isAuthEndpoint = config.url?.includes("/auth/");
    if (isAuthEndpoint && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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

// Response interceptor with enhanced token refresh
api.interceptors.response.use(
  (response) => {
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
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh")
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
        console.error("❌ Token refresh failed, clearing auth:", refreshError);
        processQueue(refreshError, null);
        
        // Clear auth data
        if (typeof window !== "undefined") {
          localStorage.removeItem("authData");
          localStorage.removeItem("user");
          delete api.defaults.headers.common.Authorization;
        }
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent("auth:logout"));
        
        return Promise.reject(new Error("Session expired. Please login again."));
      } finally {
        isRefreshing = false;
      }
    }

    // Handle network errors with retry
    if (!error.response) {
      console.error("Network error - no response received");

      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

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
let schedulerInterval: NodeJS.Timeout | null = null;

// Function to proactively refresh token before expiry
export const startTokenRefreshScheduler = (): (() => void) | null => {
  if (schedulerInterval) {
    console.log("⚠️ Token refresh scheduler already running");
    return () => stopTokenRefreshScheduler();
  }

  if (typeof window === "undefined") {
    console.log("⚠️ Window not defined, cannot start scheduler");
    return null;
  }

  const checkAndRefreshToken = async () => {
    try {
      const authData = localStorage.getItem("authData");
      if (!authData) return;

      const parsedData: AuthData = JSON.parse(authData);
      const accessToken = parsedData.tokens?.accessToken;

      if (!accessToken) return;

      // Check if token is about to expire (within 5 minutes)
      if (isTokenExpired(accessToken, 5)) {
        console.log("🔄 Token expiring soon, refreshing proactively...");
        await refreshBackendToken();
      }
    } catch (error) {
      console.error("Proactive token refresh failed:", error);
    }
  };

  // Check immediately on start
  checkAndRefreshToken();

  // Then check every 4 minutes
  schedulerInterval = setInterval(checkAndRefreshToken, 4 * 60 * 1000);

  console.log("✅ Token refresh scheduler started");

  return () => stopTokenRefreshScheduler();
};

// Function to stop the scheduler
export const stopTokenRefreshScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("🛑 Token refresh scheduler stopped");
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

// Function to check if user session is valid
export const checkAuthSession = (): boolean => {
  if (typeof window === "undefined") return false;

  const authData = localStorage.getItem("authData");
  if (!authData) return false;

  try {
    const parsedData: AuthData = JSON.parse(authData);

    // Check if we have both access and refresh tokens
    if (!parsedData.tokens?.accessToken || !parsedData.tokens?.refreshToken) {
      return false;
    }

    // Check if refresh token is expired
    if (isTokenExpired(parsedData.tokens.refreshToken, 0)) {
      console.log("❌ Refresh token expired");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking auth session:", error);
    return false;
  }
};

// Helper function to clear auth data
export const clearAuthData = () => {
  if (typeof window === "undefined") return;

  stopTokenRefreshScheduler();

  localStorage.removeItem("authData");
  localStorage.removeItem("user");
  delete api.defaults.headers.common.Authorization;

  console.log("✅ Auth data cleared");
};

export default api;