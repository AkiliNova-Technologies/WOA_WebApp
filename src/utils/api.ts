import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

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
  withCredentials: false,
});

const refreshApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

interface AuthData {
  userId: string;
  email: string;
  role: string;
  emailVerified: boolean;
  forcePasswordChange?: boolean;
  tokenExpiry: number;
}

interface AuthState {
  hasToken: boolean;
  accessToken: string | null;
  user: any;
  tokenExpiry?: number;
  userId?: string;
  email?: string;
  role?: string;
  emailVerified?: boolean;
}


let inMemoryAccessToken: string | null = null;


export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};


export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};


export const getAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return { hasToken: false, accessToken: null, user: null };
  }

  try {
    const authDataStr = localStorage.getItem("authData");
    if (!authDataStr) {
      return { hasToken: false, accessToken: null, user: null };
    }

    const parsedData: AuthData = JSON.parse(authDataStr);

    return {
      hasToken: !!inMemoryAccessToken,
      accessToken: inMemoryAccessToken,
      tokenExpiry: parsedData.tokenExpiry,
      userId: parsedData.userId,
      email: parsedData.email,
      role: parsedData.role,
      emailVerified: parsedData.emailVerified,
      user: parsedData,
    };
  } catch (error) {
    console.error("Error getting auth state:", error);
    return { hasToken: false, accessToken: null, user: null };
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

// Helper function to save auth data after login - UPDATED: Only access token
export const saveAuthData = (loginResponse: {
  userId: string;
  email: string;
  role: string;
  emailVerified: boolean;
  forcePasswordChange?: boolean;
  tokens: {
    accessToken: string;
    expiresInSec: number;
  };
}) => {
  if (typeof window === "undefined") return;

  const authData: AuthData = {
    userId: loginResponse.userId,
    email: loginResponse.email,
    role: loginResponse.role,
    emailVerified: loginResponse.emailVerified,
    forcePasswordChange: loginResponse.forcePasswordChange,
    tokenExpiry: Date.now() + loginResponse.tokens.expiresInSec * 1000,
  };

  localStorage.setItem("authData", JSON.stringify(authData));
  setAccessToken(loginResponse.tokens.accessToken);
};

// Function to refresh backend token - UPDATED: No manual refresh token handling
const refreshBackendToken = async (): Promise<string> => {
  const response = await refreshApi.post("/api/v1/auth/refresh");

  const { accessToken, expiresInSec } = response.data.tokens;

  const authDataStr = localStorage.getItem("authData");
  if (authDataStr) {
    const authData: AuthData = JSON.parse(authDataStr);
    authData.tokenExpiry = Date.now() + expiresInSec * 1000;
    localStorage.setItem("authData", JSON.stringify(authData));
  }

  setAccessToken(accessToken);
  return accessToken;
};

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
        clearAuthData();

        // Dispatch logout event
        window.dispatchEvent(new CustomEvent("auth:logout"));

        return Promise.reject(
          new Error("Session expired. Please login again."),
        );
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
            setTimeout(
              () => {
                resolve(api(originalRequest));
              },
              Math.min(retryDelay, 5000),
            );
          });
        }
      }
    }

    return Promise.reject(error);
  },
);

// Track if scheduler is running
let schedulerInterval: ReturnType<typeof setInterval> | null = null;

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
      const token = getAccessToken();
      if (!token) return;

      // Check if token is about to expire (within 5 minutes)
      if (isTokenExpired(token, 5)) {
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

  const token = getAccessToken();
  if (!token) {
    // No in-memory token — session may still be valid via refresh cookie
    return true; // allow app to attempt silent refresh
  }

  if (isTokenExpired(token, 0)) {
    console.log("❌ Access token expired");
    return false;
  }

  return true;
};

// Helper function to clear auth data - UPDATED
export const clearAuthData = () => {
  if (typeof window === "undefined") return;

  stopTokenRefreshScheduler();

  // Clear in-memory token
  setAccessToken(null);

  // Clear localStorage
  localStorage.removeItem("authData");
  localStorage.removeItem("user");

  console.log("✅ Auth data cleared");
};

export default api;
