import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api, { saveAuthData, clearAuthData } from "@/utils/api";
import type { User as FirebaseUser } from "firebase/auth";
import { getDeviceInfo, getFCMToken } from "@/utils/device";

export interface User {
  id: string;
  userType: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  isActive: boolean;
  emailVerified: boolean;
  forcePasswordChange: boolean;
  permissions: string[];
  roles: string[];
  avatar?: string;
  firebaseUid?: string;
  phoneNumber?: string;
  accountStatus?: string;
  avatarUrl?: string;
  createdAt?: string;
}

// Serializable Firebase user interface
export interface SerializableFirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerId: string;
  phoneNumber: string | null;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData: Array<{
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    providerId: string;
    phoneNumber: string | null;
  }>;
  tenantId: string | null;
}

export interface DeviceSession {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: "mobile" | "tablet" | "desktop" | "smart-tv" | "wearable";
  platform: "android" | "ios" | "windows" | "macos" | "linux" | "web";
  fcmToken?: string;
  appVersion: string;
  osVersion: string;
  browserName?: string;
  browserVersion?: string;
  screenResolution?: string;
  language: string;
  timezone: string;
  lastActiveAt: string;
  createdAt: string;
  isActive: boolean;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  firebaseUser: SerializableFirebaseUser | null;
  verification: {
    pending: boolean;
    email: string | null;
    lastSentAt: string | null;
    attempts: number;
  };
  deviceSessions: {
    currentSession: DeviceSession | null;
    allSessions: DeviceSession[];
    loading: boolean;
    error: string | null;
  };
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initialLoading: true,
  error: null,
  firebaseUser: null,
  verification: {
    pending: false,
    email: null,
    lastSentAt: null,
    attempts: 0,
  },
  deviceSessions: {
    currentSession: null,
    allSessions: [],
    loading: false,
    error: null,
  },
};

// Helper to extract serializable data from Firebase user
export const extractSerializableFirebaseUser = (
  firebaseUser: FirebaseUser | null
): SerializableFirebaseUser | null => {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    isAnonymous: firebaseUser.isAnonymous,
    providerId: firebaseUser.providerId,
    phoneNumber: firebaseUser.phoneNumber,
    metadata: {
      creationTime: firebaseUser.metadata.creationTime || undefined,
      lastSignInTime: firebaseUser.metadata.lastSignInTime || undefined,
    },
    providerData: firebaseUser.providerData.map((provider) => ({
      uid: provider.uid,
      displayName: provider.displayName,
      email: provider.email,
      photoURL: provider.photoURL,
      providerId: provider.providerId,
      phoneNumber: provider.phoneNumber,
    })),
    tenantId: firebaseUser.tenantId,
  };
};

// Helper function to map API response to User type
const mapApiResponseToUser = (
  apiData: any,
  additionalData?: any,
  _isRegistration = false
): User => {
  console.log("Mapping API response to user:", apiData);

  return {
    id: apiData.userId?.toString() || apiData.id || "",
    userType: apiData.role || "APP_USER" || "client",
    email: apiData.email || "",
    firstName: additionalData?.firstName || apiData.firstName || "",
    lastName: additionalData?.lastName || apiData.lastName || "",
    username: apiData.email || "",
    forcePasswordChange: apiData.forcePasswordChange,

    // Use emailVerified from API, fallback to isActive or false
    emailVerified: apiData.emailVerified || apiData.isActive === true || false,

    // For backward compatibility, set isActive based on emailVerified
    isActive:
      apiData.emailVerified === true || apiData.isActive === true || false,

    permissions: apiData.permissions || [],
    roles: apiData.roles || [apiData.role || "client"],
    avatar: apiData.avatar || additionalData?.photoURL,
    firebaseUid: apiData.firebaseUid || additionalData?.uid,
    phoneNumber: apiData.phoneNumber || additionalData?.phoneNumber,
    accountStatus: apiData.accountStatus,
    avatarUrl: apiData.avatarUrl,
  };
};

// Helper function to handle API errors
const handleApiError = (error: unknown): string => {
  const err = error as {
    response?: {
      status?: number;
      data?: {
        message?: string;
        error?: string;
        errors?: Array<{ field: string; message: string }>;
      };
    };
    message?: string;
  };

  if (err.response?.data?.message) {
    return err.response.data.message;
  } else if (err.response?.data?.error) {
    return err.response.data.error;
  } else if (err.response?.data?.errors) {
    // Handle validation errors
    return err.response.data.errors
      .map(
        (e: { field: string; message: string }) => `${e.field}: ${e.message}`
      )
      .join(", ");
  } else if (err.message) {
    return err.message;
  }

  return "An unexpected error occurred";
};

// 🔄 Refresh token logic - UPDATED: HttpOnly cookie approach
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Refreshing token via HttpOnly cookie");

      // CRITICAL: Just call refresh endpoint - cookie is sent automatically
      // Backend reads refresh token from HttpOnly cookie
      const response = await api.post("/api/v1/auth/refresh", {});

      console.log("✅ Refresh response received:", response.data);

      // IMPORTANT: Return user data AND new access token
      return {
        user: response.data, // Contains userId, email, role, emailVerified
        tokens: response.data.tokens, // Contains accessToken, tokenType, expiresInSec
      };
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("❌ Refresh token error:", errorMessage);

      // Clear invalid auth data
      clearAuthData();

      return rejectWithValue(errorMessage);
    }
  }
);

// 🔐 Check authentication status
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/auth/me");

      if (response.data) {
        const user = mapApiResponseToUser(response.data);
        return { user };
      }

      return rejectWithValue("No authenticated user found");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };

      // If 401, it's just not authenticated (not an error)
      if (err.response?.status === 401) {
        return rejectWithValue("Not authenticated");
      }

      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔐 Login Thunk - updated to match API response
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log("Login - Attempting login for:", email);

      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });

      console.log("Login - Response received:", response.data);

      if (response.data && response.data.userId) {
        const user = mapApiResponseToUser(response.data, {}, false);

        console.log("Login - Mapped user:", user);
        console.log("Login - Tokens:", response.data.tokens);

        try {
          await dispatch(registerDeviceSession()).unwrap();
        } catch (deviceError) {
          console.warn("Device session registration failed:", deviceError);
        }

        return {
          user,
          tokens: response.data.tokens,
        };
      }

      return rejectWithValue("Invalid login response format");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("Login error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔐 Google OAuth Login - Sends Firebase token to your backend
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (
    { idToken }: { idToken: string },
    { rejectWithValue, signal, dispatch }
  ) => {
    try {
      console.log("Google Login - Sending token to backend");

      const googleAuthApi = api.create({
        timeout: 45000,
      });

      const response = await googleAuthApi.post(
        "/api/v1/auth/google",
        { idToken },
        { signal }
      );

      console.log("Google Login - Response received:", response.data);

      if (response.data && response.data.userId) {
        const user = mapApiResponseToUser(response.data);

        try {
          await dispatch(registerDeviceSession()).unwrap();
        } catch (deviceError) {
          console.warn("Device session registration failed:", deviceError);
        }

        console.log("Google Login - Mapped user:", user);
        console.log("Google Login - Tokens:", response.data.tokens);

        return {
          user,
          tokens: response.data.tokens,
        };
      }

      return rejectWithValue("Invalid Google login response format");
    } catch (error: unknown) {
      const err = error as any;

      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        return rejectWithValue(
          "Backend server is taking too long to respond. Please try again or contact support."
        );
      }

      if (err.name === "AbortError") {
        return rejectWithValue("Login cancelled");
      }

      const errorMessage = handleApiError(error);
      console.error("Google login error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔐 Logout - with cookie cleanup
export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await dispatch(removeCurrentDeviceSession()).unwrap();

      // Call backend logout to clear HttpOnly cookie
      await api.post("/api/v1/auth/logout", {});
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local auth data
      clearAuthData();

      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("deviceName");
        localStorage.removeItem("deviceId");
        localStorage.removeItem("firebase_user");
      }

      dispatch(logout());
      return true;
    }
  }
);

// 🔐 Register Thunk - updated to match API response
export const register = createAsyncThunk(
  "auth/register",
  async (
    registrationData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("Register - Sending registration data");

      const response = await api.post(
        "/api/v1/auth/register",
        registrationData
      );

      console.log("Register - Response received:", response.data);

      if (response.data && response.data.userId) {
        const user = mapApiResponseToUser(
          response.data,
          registrationData,
          true
        );

        console.log("Register - Mapped user:", user);
        console.log("Register - Tokens:", response.data.tokens);

        // CRITICAL: Return both user and tokens
        return {
          user,
          tokens: response.data.tokens,
        };
      }

      return rejectWithValue("Invalid registration response format");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("Register error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔐 Email Verification - Verify email with OTP
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (
    { email, otp }: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      console.log(
        "Email Verification - Verifying email:",
        email,
        "with code:",
        otp
      );

      const response = await api.post("/api/v1/auth/email-verification", {
        email,
        code: otp,
      });

      console.log("Email Verification - Response received:", response.data);

      // Check for different success responses
      if (
        response.data &&
        (response.data.ok === true || response.data.success === true)
      ) {
        return {
          email,
          message: response.data.message || "Email verified successfully!",
        };
      }

      return rejectWithValue(
        response.data?.message || "Email verification failed"
      );
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("Email verification error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔐 Resend Email Verification OTP
export const resendVerificationEmail = createAsyncThunk(
  "auth/resendVerificationEmail",
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      console.log("Resend Verification - Requesting for email:", email);

      const response = await api.post(
        "/api/v1/auth/email-verification/resend",
        {
          email,
        }
      );

      console.log("Resend Verification - Response received:", response.data);

      // Check for different success responses
      if (
        response.data &&
        (response.data.ok === true || response.data.success === true)
      ) {
        return {
          email,
          message:
            response.data.message || "Verification email resent successfully!",
        };
      }

      return rejectWithValue(
        response.data?.message || "Failed to resend verification email"
      );
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("Resend verification error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔐 Forgot Password - Request password reset OTP
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      console.log("Forgot Password - Requesting for email:", email);

      const response = await api.post("/api/v1/auth/forgot-password", {
        email,
      });

      console.log("Forgot Password - Response received:", response.data);

      // Check for both "ok: true" and "success: true"
      if (
        response.data &&
        (response.data.ok === true || response.data.success === true)
      ) {
        return {
          email,
          message: response.data.message || "Password reset email sent!",
        };
      }

      return rejectWithValue(
        response.data?.message || "Failed to send password reset email"
      );
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("Forgot password error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔐 Reset Password with OTP
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    {
      email,
      otp,
      newPassword,
    }: { email: string; otp: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Reset Password - Resetting for email:", email);

      const response = await api.post("/api/v1/auth/password-reset", {
        email,
        otp,
        newPassword,
      });

      console.log("Reset Password - Response received:", response.data);

      // Check for both "ok: true" and "success: true"
      if (
        response.data &&
        (response.data.ok === true || response.data.success === true)
      ) {
        return {
          email,
          message: response.data.message || "Password reset successfully!",
        };
      }

      return rejectWithValue(response.data?.message || "Password reset failed");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("Reset password error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔐 Change Password (authenticated)
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Change Password - Changing password");

      const response = await api.post("/api/v1/auth/password-change", {
        currentPassword,
        newPassword,
      });

      console.log("Change Password - Response received:", response.data);

      // Check for both "ok: true" and "success: true" response formats
      if (
        response.data &&
        (response.data.ok === true || response.data.success === true)
      ) {
        return {
          message: response.data.message || "Password changed successfully!",
        };
      }

      return rejectWithValue(
        response.data?.message || "Password change failed"
      );
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("Change password error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔐 Check Email Availability
export const checkEmailAvailability = createAsyncThunk(
  "auth/checkEmailAvailability",
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      console.log("Check Email Availability - Checking:", email);

      const response = await api.get(
        `/api/v1/auth/email-availability?email=${encodeURIComponent(email)}`
      );

      console.log("Email Availability - Response received:", response.data);

      if (response.data && typeof response.data.available === "boolean") {
        return {
          email,
          available: response.data.available,
          message: response.data.message,
        };
      }

      return rejectWithValue("Invalid response format");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("Email availability check error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Register a new device session on login
export const registerDeviceSession = createAsyncThunk(
  "auth/registerDeviceSession",
  async (fcmToken: string | undefined, { rejectWithValue }) => {
    try {
      const deviceInfo = getDeviceInfo();

      // Get FCM token if not provided
      let finalFcmToken = fcmToken;
      if (!finalFcmToken && typeof window !== "undefined") {
        const token = await getFCMToken();
        finalFcmToken = token || undefined;
      }

      const deviceSessionData = {
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        platform: deviceInfo.platform,
        fcmToken: finalFcmToken, // This can be undefined, which is fine
        appVersion: deviceInfo.appVersion,
        osVersion: deviceInfo.osVersion,
        browserName: deviceInfo.browserName,
        browserVersion: deviceInfo.browserVersion,
        screenResolution: deviceInfo.screenResolution,
        language: deviceInfo.language,
        timezone: deviceInfo.timezone,
        manufacturer: deviceInfo.manufacturer,
        model: deviceInfo.model,
      };

      const response = await api.post(
        "/api/v1/device-sessions",
        deviceSessionData
      );

      return {
        session: response.data,
        deviceId: deviceInfo.deviceId,
      };
    } catch (error: unknown) {
      console.error("Failed to register device session:", error);
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Get all device sessions for current user
export const fetchDeviceSessions = createAsyncThunk(
  "auth/fetchDeviceSessions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/device-sessions");
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Update FCM token for current device session
export const updateDeviceFCMToken = createAsyncThunk(
  "auth/updateDeviceFCMToken",
  async (fcmToken: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const deviceId = state.auth.deviceSessions.currentSession?.deviceId;

      if (!deviceId) {
        throw new Error("No active device session");
      }

      const response = await api.put(
        `/api/v1/device-sessions/${deviceId}/token`,
        { fcmToken }
      );

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Remove a device session (logout from specific device)
export const removeDeviceSession = createAsyncThunk(
  "auth/removeDeviceSession",
  async (deviceId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/device-sessions/${deviceId}`);
      return deviceId;
    } catch (error: unknown) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Remove current device session (on logout)
export const removeCurrentDeviceSession = createAsyncThunk(
  "auth/removeCurrentDeviceSession",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const deviceId = state.auth.deviceSessions.currentSession?.deviceId;

      if (deviceId) {
        await api.delete(`/api/v1/device-sessions/${deviceId}`);
        return deviceId;
      }

      return null;
    } catch (error: unknown) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// 🧠 Slice logic
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(
      state,
      action: PayloadAction<{
        user: User;
      }>
    ) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },

    setRawFirebaseUser(state, action: PayloadAction<FirebaseUser | null>) {
      if (!action.payload) {
        state.firebaseUser = null;
      } else {
        state.firebaseUser = {
          uid: action.payload.uid,
          email: action.payload.email,
          displayName: action.payload.displayName,
          photoURL: action.payload.photoURL,
          emailVerified: action.payload.emailVerified,
          isAnonymous: action.payload.isAnonymous,
          providerId: action.payload.providerId,
          phoneNumber: action.payload.phoneNumber,
          metadata: {
            creationTime: action.payload.metadata.creationTime || undefined,
            lastSignInTime: action.payload.metadata.lastSignInTime || undefined,
          },
          providerData: action.payload.providerData.map((provider) => ({
            uid: provider.uid,
            displayName: provider.displayName,
            email: provider.email,
            photoURL: provider.photoURL,
            providerId: provider.providerId,
            phoneNumber: provider.phoneNumber,
          })),
          tenantId: action.payload.tenantId,
        };
      }

      // Store serializable version in localStorage
      if (typeof window !== "undefined" && state.firebaseUser) {
        localStorage.setItem(
          "firebase_user",
          JSON.stringify(state.firebaseUser)
        );
      }
    },

    setSerializableFirebaseUser(
      state,
      action: PayloadAction<SerializableFirebaseUser | null>
    ) {
      state.firebaseUser = action.payload;

      if (typeof window !== "undefined" && action.payload) {
        localStorage.setItem("firebase_user", JSON.stringify(action.payload));
      }
    },

    logout(state) {
      state.user = null;
      state.firebaseUser = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.verification = initialState.verification;

      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("firebase_user");
      }
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));

          // Also update authData if it exists
          const authDataStr = localStorage.getItem("authData");
          if (authDataStr) {
            try {
              const authData = JSON.parse(authDataStr);
              authData.emailVerified = state.user.emailVerified;
              localStorage.setItem("authData", JSON.stringify(authData));
            } catch (e) {
              console.error("Error updating authData:", e);
            }
          }
        }
      }
    },

    clearError: (state) => {
      state.error = null;
    },

    loadUserFromStorage: (state) => {
      // Redux-persist handles rehydration automatically
      // This reducer now only sets initialLoading to false and validates authData

      if (state.user) {
        console.log("✅ User rehydrated from persist:", state.user.email);

        // Validate that authData exists in localStorage
        if (typeof window !== "undefined") {
          const authData = localStorage.getItem("authData");
          if (!authData) {
            console.warn("⚠️ User exists but authData missing - clearing user");
            state.user = null;
            state.isAuthenticated = false;
            state.firebaseUser = null;
          } else {
            // Check for pending verification
            const hasPendingVerification = localStorage.getItem(
              "pendingVerificationEmail"
            );
            const isEmailVerified = state.user.emailVerified === true;

            if (hasPendingVerification || !isEmailVerified) {
              state.verification = {
                pending: true,
                email: hasPendingVerification || state.user.email,
                lastSentAt: null,
                attempts: 0,
              };
            }
          }
        }
      }

      state.initialLoading = false;
    },

    setVerificationPending: (
      state,
      action: PayloadAction<{ email: string }>
    ) => {
      state.verification = {
        pending: true,
        email: action.payload.email,
        lastSentAt: new Date().toISOString(),
        attempts: 1,
      };
    },

    clearVerification: (state) => {
      state.verification = initialState.verification;
    },

    incrementVerificationAttempts: (state) => {
      state.verification.attempts += 1;
      state.verification.lastSentAt = new Date().toISOString();
    },

    setCurrentDeviceSession: (state, action: PayloadAction<DeviceSession>) => {
      state.deviceSessions.currentSession = action.payload;
    },

    clearDeviceSessions: (state) => {
      state.deviceSessions = initialState.deviceSessions;
    },

    updateFCMTokenLocally: (state, action: PayloadAction<string>) => {
      if (state.deviceSessions.currentSession) {
        state.deviceSessions.currentSession.fcmToken = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ========================================
      // Login cases - UPDATED for HttpOnly cookies
      // ========================================
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;

        // CRITICAL: Save auth data (only access token, refresh token is in HttpOnly cookie)
        if (typeof window !== "undefined" && action.payload.tokens) {
          saveAuthData({
            userId: action.payload.user.id,
            email: action.payload.user.email,
            role: action.payload.user.userType,
            emailVerified: action.payload.user.emailVerified,
            forcePasswordChange:
              action.payload.user.forcePasswordChange || false,
            tokens: action.payload.tokens,
          });

          // Also save user for convenience
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }

        // Handle verification state
        const isEmailVerified = action.payload.user.emailVerified === true;
        if (!isEmailVerified) {
          state.verification = {
            pending: true,
            email: action.payload.user.email,
            lastSentAt: new Date().toISOString(),
            attempts: 0,
          };
        } else {
          state.verification = initialState.verification;
        }

        console.log("✅ Login successful, auth data saved");
        console.log("Email verified:", isEmailVerified);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;

        clearAuthData();
      })

      // ========================================
      // Google Login cases - UPDATED
      // ========================================
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;

        // CRITICAL: Save auth data (only access token)
        if (typeof window !== "undefined" && action.payload.tokens) {
          saveAuthData({
            userId: action.payload.user.id,
            email: action.payload.user.email,
            role: action.payload.user.userType,
            emailVerified: action.payload.user.emailVerified,
            forcePasswordChange:
              action.payload.user.forcePasswordChange || false,
            tokens: action.payload.tokens,
          });

          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }

        const isEmailVerified = action.payload.user.emailVerified === true;
        state.isAuthenticated = isEmailVerified;

        if (!isEmailVerified) {
          state.verification = {
            pending: true,
            email: action.payload.user.email,
            lastSentAt: new Date().toISOString(),
            attempts: 0,
          };
        } else {
          state.verification = initialState.verification;
        }

        console.log("✅ Google login successful, auth data saved");
        console.log("Email verified:", isEmailVerified);
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;

        clearAuthData();
      })

      // ========================================
      // Register cases - UPDATED
      // ========================================
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;

        const user = {
          ...action.payload.user,
          emailVerified: false,
          isActive: false,
        };

        state.user = user;

        // CRITICAL: Save auth data even for unverified users
        if (typeof window !== "undefined" && action.payload.tokens) {
          saveAuthData({
            userId: user.id,
            email: user.email,
            role: user.userType,
            emailVerified: false,
            forcePasswordChange: user.forcePasswordChange || false,
            tokens: action.payload.tokens,
          });
        }

        // Set verification pending
        state.verification = {
          pending: true,
          email: user.email,
          lastSentAt: new Date().toISOString(),
          attempts: 1,
        };

        state.isAuthenticated = false;
        state.error = null;

        console.log("✅ Registration successful, awaiting email verification");
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // Logout cases
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.firebaseUser = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loading = false;
        state.verification = initialState.verification;
        state.deviceSessions = initialState.deviceSessions;
      })

      // Check auth cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;

        // Check if email is verified before authenticating
        const isEmailVerified = action.payload.user.emailVerified === true;
        state.isAuthenticated = isEmailVerified;

        if (!isEmailVerified) {
          state.verification = {
            pending: true,
            email: action.payload.user.email,
            lastSentAt: new Date().toISOString(),
            attempts: 0,
          };
        } else {
          state.verification = initialState.verification;
        }

        state.error = null;
        console.log(
          "Check Auth - State updated with user:",
          action.payload.user
        );
        console.log("Email verified:", isEmailVerified);
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        if (action.payload !== "Not authenticated") {
          state.error = action.payload as string;
        }
      })

      // ========================================
      // Refresh token cases - UPDATED for HttpOnly cookies
      // ========================================
      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.user) {
          const user = mapApiResponseToUser(action.payload.user);
          state.user = user;

          // CRITICAL: Update auth data with new access token
          if (typeof window !== "undefined" && action.payload.tokens) {
            saveAuthData({
              userId: user.id,
              email: user.email,
              role: user.userType,
              emailVerified: user.emailVerified,
              forcePasswordChange: user.forcePasswordChange || false,
              tokens: action.payload.tokens,
            });

            localStorage.setItem("user", JSON.stringify(user));
          }

          const isEmailVerified = user.emailVerified === true;
          state.isAuthenticated = isEmailVerified;

          if (!isEmailVerified) {
            state.verification = {
              pending: true,
              email: user.email,
              lastSentAt: new Date().toISOString(),
              attempts: 0,
            };
          } else {
            state.verification = initialState.verification;
          }

          console.log("✅ Token refreshed successfully");
        }
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;

        clearAuthData();
      })

      // Email Verification cases
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.verification.pending = false;

        if (state.user && state.user.email === action.payload.email) {
          // Update both emailVerified and isActive
          state.user.emailVerified = true;
          state.user.isActive = true;
          state.isAuthenticated = true;

          if (typeof window !== "undefined") {
            localStorage.removeItem("pendingVerificationEmail");
            localStorage.setItem("user", JSON.stringify(state.user));

            // Also update authData in localStorage
            const authDataStr = localStorage.getItem("authData");
            if (authDataStr) {
              try {
                const authData = JSON.parse(authDataStr);
                authData.emailVerified = true;
                localStorage.setItem("authData", JSON.stringify(authData));
              } catch (error) {
                console.error("Error updating authData:", error);
              }
            }
          }
        }

        console.log(
          "✅ Email verification successful, user is now authenticated"
        );
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error("Email verification failed:", action.payload);
      })

      // Resend Verification Email cases
      .addCase(resendVerificationEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.verification.lastSentAt = new Date().toISOString();
        state.verification.attempts += 1;
        console.log("Verification email resent:", action.payload.message);
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error("Resend verification failed:", action.payload);
      })

      // Forgot Password cases
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Password reset email sent:", action.payload.message);
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error("Forgot password failed:", action.payload);
      })

      // Reset Password cases
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Password reset successful:", action.payload.message);
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error("Reset password failed:", action.payload);
      })

      // Change Password cases
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        // Clear any previous errors
        state.error = null;
        console.log("Password changed successfully:", action.payload.message);
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error("Change password failed:", action.payload);
      })

      // Email Availability cases
      .addCase(checkEmailAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkEmailAvailability.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Email availability check:", action.payload);
      })
      .addCase(checkEmailAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error("Email availability check failed:", action.payload);
      })

      // Register device session
      .addCase(registerDeviceSession.pending, (state) => {
        state.deviceSessions.loading = true;
        state.deviceSessions.error = null;
      })
      .addCase(registerDeviceSession.fulfilled, (state, action) => {
        state.deviceSessions.loading = false;
        state.deviceSessions.currentSession = action.payload.session;

        // Add to all sessions if not already present
        const exists = state.deviceSessions.allSessions.some(
          (session) => session.deviceId === action.payload.session.deviceId
        );
        if (!exists) {
          state.deviceSessions.allSessions.push(action.payload.session);
        }
      })
      .addCase(registerDeviceSession.rejected, (state, action) => {
        state.deviceSessions.loading = false;
        state.deviceSessions.error = action.payload as string;
      })

      // Fetch device sessions
      .addCase(fetchDeviceSessions.pending, (state) => {
        state.deviceSessions.loading = true;
        state.deviceSessions.error = null;
      })
      .addCase(fetchDeviceSessions.fulfilled, (state, action) => {
        state.deviceSessions.loading = false;
        state.deviceSessions.allSessions = action.payload;

        // Update current session from list
        const deviceId = localStorage.getItem("deviceId");
        if (deviceId) {
          const current = action.payload.find(
            (session: DeviceSession) => session.deviceId === deviceId
          );
          if (current) {
            state.deviceSessions.currentSession = current;
          }
        }
      })
      .addCase(fetchDeviceSessions.rejected, (state, action) => {
        state.deviceSessions.loading = false;
        state.deviceSessions.error = action.payload as string;
      })

      // Update FCM token
      .addCase(updateDeviceFCMToken.fulfilled, (state, action) => {
        if (state.deviceSessions.currentSession) {
          state.deviceSessions.currentSession.fcmToken =
            action.payload.fcmToken;
        }
      })

      // Remove device session
      .addCase(removeDeviceSession.fulfilled, (state, action) => {
        state.deviceSessions.allSessions =
          state.deviceSessions.allSessions.filter(
            (session) => session.deviceId !== action.payload
          );

        // If removing current session, clear it
        if (state.deviceSessions.currentSession?.deviceId === action.payload) {
          state.deviceSessions.currentSession = null;
        }
      })

      // Remove current device session
      .addCase(removeCurrentDeviceSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.deviceSessions.allSessions =
            state.deviceSessions.allSessions.filter(
              (session) => session.deviceId !== action.payload
            );
        }
        state.deviceSessions.currentSession = null;
      });
  },
});

// 🎯 Export actions
export const {
  setUser,
  setRawFirebaseUser,
  setSerializableFirebaseUser,
  logout,
  updateUser,
  clearError,
  loadUserFromStorage,
  setVerificationPending,
  clearVerification,
  incrementVerificationAttempts,
  setCurrentDeviceSession,
  clearDeviceSessions,
  updateFCMTokenLocally,
} = authSlice.actions;

// Keep setFirebaseUser as an alias for backward compatibility
export const setFirebaseUser = setRawFirebaseUser;

export default authSlice.reducer;

// 🧠 Selectors
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectInitialLoading = (state: { auth: AuthState }) =>
  state.auth.initialLoading;
export const selectFirebaseUser = (state: { auth: AuthState }) =>
  state.auth.firebaseUser;
export const selectVerificationState = (state: { auth: AuthState }) =>
  state.auth.verification;
export const selectVerificationPending = (state: { auth: AuthState }) =>
  state.auth.verification.pending;
export const selectVerificationEmail = (state: { auth: AuthState }) =>
  state.auth.verification.email;
export const selectVerificationLastSent = (state: { auth: AuthState }) =>
  state.auth.verification.lastSentAt;
export const selectVerificationAttempts = (state: { auth: AuthState }) =>
  state.auth.verification.attempts;
export const selectCurrentDeviceSession = (state: { auth: AuthState }) =>
  state.auth.deviceSessions.currentSession;
export const selectAllDeviceSessions = (state: { auth: AuthState }) =>
  state.auth.deviceSessions.allSessions;
export const selectDeviceSessionsLoading = (state: { auth: AuthState }) =>
  state.auth.deviceSessions.loading;
export const selectDeviceSessionsError = (state: { auth: AuthState }) =>
  state.auth.deviceSessions.error;