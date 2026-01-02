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
          if (parsedData.token) {
            config.headers.Authorization = `Bearer ${parsedData.token}`;
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
    const refreshToken = parsedData.refreshToken;

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("🔄 Attempting to refresh backend token...");

    // Call refresh endpoint with refresh token
    const response = await refreshApi.post("/api/v1/auth/refresh", {
      refreshToken: refreshToken,
    });

    if (response.data.tokens?.accessToken) {
      // Update localStorage with new tokens
      const updatedAuthData = {
        ...parsedData,
        token: response.data.tokens.accessToken,
        refreshToken: response.data.tokens.refreshToken || refreshToken,
        tokenExpiry: Date.now() + (response.data.tokens.expiresIn || 3600000),
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

    throw error;
  }
};

// Function to refresh Firebase token
// const refreshFirebaseToken = async (): Promise<string | null> => {
//   try {
//     if (!auth.currentUser) {
//       return null;
//     }

//     console.log("🔄 Refreshing Firebase token...");
//     const newToken = await auth.currentUser.getIdToken(true);

//     // Update stored Firebase token
//     if (typeof window !== "undefined") {
//       const currentAuthData = localStorage.getItem("authData");
//       if (currentAuthData) {
//         const parsed = JSON.parse(currentAuthData);
//         if (parsed.firebaseToken) {
//           parsed.firebaseToken = newToken;
//           localStorage.setItem("authData", JSON.stringify(parsed));
//         }
//       }
//     }

//     console.log("✅ Firebase token refreshed");
//     return newToken;
//   } catch (error) {
//     console.error("❌ Firebase token refresh failed:", error);
//     return null;
//   }
// };

// Function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minutes buffer
    return now >= expiry - buffer;
  } catch {
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

        const retryDelay = (originalRequest._retryCount || 0) * 1000;

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(api(originalRequest));
          }, Math.min(retryDelay, 5000));
        });
      }
    }

    return Promise.reject(error);
  }
);

// Function to proactively refresh token before expiry
export const startTokenRefreshScheduler = () => {
  if (typeof window === "undefined") return;

  const checkAndRefreshToken = async () => {
    try {
      const authData = localStorage.getItem("authData");
      if (!authData) return;

      const parsedData = JSON.parse(authData);
      if (!parsedData.token) return;

      // Check if token is about to expire (within 5 minutes)
      if (isTokenExpired(parsedData.token)) {
        console.log("🔄 Token is about to expire, refreshing proactively...");
        await refreshBackendToken();
      }
    } catch (error) {
      console.error("Proactive token refresh failed:", error);
    }
  };

  // Check every minute
  const intervalId = setInterval(checkAndRefreshToken, 60 * 1000);

  // Also check on user activity
  const handleUserActivity = () => {
    checkAndRefreshToken();
  };

  window.addEventListener("mousemove", handleUserActivity);
  window.addEventListener("keydown", handleUserActivity);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    window.removeEventListener("mousemove", handleUserActivity);
    window.removeEventListener("keydown", handleUserActivity);
  };
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

// Function to get current auth state
export const getAuthState = () => {
  if (typeof window === "undefined") {
    return { hasToken: false, token: null, refreshToken: null };
  }

  try {
    const authData = localStorage.getItem("authData");
    if (!authData) {
      return { hasToken: false, token: null, refreshToken: null };
    }

    const parsedData = JSON.parse(authData);
    return {
      hasToken: !!parsedData.token,
      token: parsedData.token,
      refreshToken: parsedData.refreshToken,
      tokenExpiry: parsedData.tokenExpiry,
      user: parsedData.user,
    };
  } catch (error) {
    console.error("Error getting auth state:", error);
    return { hasToken: false, token: null, refreshToken: null };
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
    if (!parsedData.token || !parsedData.refreshToken) {
      return false;
    }

    // Check if access token is expired
    if (parsedData.token && isTokenExpired(parsedData.token)) {
      console.log("⚠️ Access token expired, attempting refresh...");
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Initialize token refresh scheduler
if (typeof window !== "undefined") {
  // Start scheduler after a short delay to avoid initial load interference
  setTimeout(() => {
    startTokenRefreshScheduler();
  }, 3000);
}

export default api;
