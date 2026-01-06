import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/utils/api";
import type { User as FirebaseUser } from "firebase/auth";

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

// 🔄 Refresh token logic - UPDATED to use Authorization header
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      // Get refresh token from localStorage
      if (typeof window !== "undefined") {
        const authData = localStorage.getItem("authData");
        if (!authData) {
          throw new Error("No authentication data found");
        }

        const { refreshToken } = JSON.parse(authData);

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Send refresh token as Authorization header
        const response = await api.post(
          "/api/v1/auth/refresh",
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        // Update localStorage with new tokens
        const updatedAuthData = {
          ...JSON.parse(authData),
          token: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken || refreshToken,
        };
        localStorage.setItem("authData", JSON.stringify(updatedAuthData));

        return {
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          user: response.data.user,
        };
      }

      throw new Error("Window is not defined");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);

      // If refresh token is invalid/expired, clear storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authData");
        localStorage.removeItem("user");
      }

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
    { rejectWithValue }
  ) => {
    try {
      console.log("Login - Attempting login for:", email);

      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });

      console.log("Login - Response received:", response.data);

      if (response.data && response.data.userId) {
        // First, create a basic user object from login response
        const basicUser = {
          id: response.data.userId,
          email: response.data.email,
          role: response.data.role,
          // We don't have emailVerified in login response yet
        };

        // Now fetch the full user profile to get emailVerified status
        try {
          // Set the token for the profile request
          if (response.data.tokens?.accessToken) {
            // You might need to set the token in api headers
            // This depends on how your api utility is set up
          }

          // Fetch user profile to get emailVerified status
          const profileResponse = await api.get("/api/v1/user/profile");
          console.log("Login - Profile response:", profileResponse.data);

          const combinedData = {
            ...basicUser,
            ...profileResponse.data,
            emailVerified: profileResponse.data.emailVerified || false,
          };

          const user = mapApiResponseToUser(combinedData, {}, false);

          console.log("Login - Mapped user with profile data:", user);

          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));

            const authData = {
              user: user,
              token: response.data.tokens?.accessToken,
              refreshToken: response.data.tokens?.refreshToken,
            };
            localStorage.setItem("authData", JSON.stringify(authData));
          }

          return { user, tokens: response.data.tokens };
        } catch (profileError) {
          console.error("Failed to fetch profile after login:", profileError);
          const user = mapApiResponseToUser(basicUser, {}, false);

          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
            const authData = {
              user: user,
              token: response.data.tokens?.accessToken,
              refreshToken: response.data.tokens?.refreshToken,
            };
            localStorage.setItem("authData", JSON.stringify(authData));
          }

          return { user, tokens: response.data.tokens };
        }
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
    { rejectWithValue, signal } // Add signal for abort controller
  ) => {
    try {
      console.log("Google Login - Sending token to backend");

      // Create a custom axios instance with longer timeout
      const googleAuthApi = api.create({
        timeout: 45000, // 45 seconds for Google auth
      });

      const response = await googleAuthApi.post(
        "/api/v1/auth/google",
        {
          idToken,
        },
        {
          signal, // Pass the abort signal
        }
      );

      console.log("Google Login - Response received:", response.data);

      if (response.data && response.data.userId) {
        const user = mapApiResponseToUser(response.data);

        console.log("Google Login - Mapped user:", user);

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user));

          const authData = {
            user: user,
            token: response.data.tokens?.accessToken,
            refreshToken: response.data.tokens?.refreshToken,
            isGoogleAuth: true,
          };
          localStorage.setItem("authData", JSON.stringify(authData));
        }

        return { user, tokens: response.data.tokens };
      }

      return rejectWithValue("Invalid Google login response format");
    } catch (error: unknown) {
      const err = error as any;

      // Handle timeout specifically
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        console.error("Google login timeout - backend not responding");
        return rejectWithValue(
          "Backend server is taking too long to respond. Please try again or contact support."
        );
      }

      // Handle abort (user cancelled)
      if (err.name === "AbortError") {
        console.error("Google login aborted by user");
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
      if (typeof window !== "undefined") {
        const authData = localStorage.getItem("authData");

        if (authData) {
          const parsedData = JSON.parse(authData);
          if (parsedData.token) {
            await api.post(
              "/api/v1/auth/logout",
              {},
              {
                headers: {
                  Authorization: `Bearer ${parsedData.token}`,
                },
              }
            );
          }
        }
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("authData");
        // Also clear any Firebase-related storage
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
      console.log("Register - Sending registration data:", {
        ...registrationData,
        password: "***HIDDEN***",
      });

      const response = await api.post(
        "/api/v1/auth/register",
        registrationData
      );

      console.log("Register - Response received:", response.data);

      if (response.data && response.data.userId) {
        // IMPORTANT: Pass true as third parameter to indicate this is a registration
        const user = mapApiResponseToUser(
          response.data,
          registrationData,
          true
        );

        console.log("Register - Mapped user (isActive forced to false):", user);

        if (typeof window !== "undefined") {
          // Don't save user to localStorage yet - wait for verification
          // localStorage.setItem("user", JSON.stringify(user));

          const authData = {
            user: user,
            token: response.data.tokens?.accessToken,
            refreshToken: response.data.tokens?.refreshToken,
          };
          localStorage.setItem("authData", JSON.stringify(authData));
        }

        return { user, tokens: response.data.tokens };
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
        localStorage.removeItem("authData");
        localStorage.removeItem("firebase_user");
      }
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    },

    clearError: (state) => {
      state.error = null;
    },

    loadUserFromStorage: (state) => {
      if (typeof window !== "undefined") {
        try {
          // Load your app user
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);

            // CRITICAL: Check if there's pending verification
            const hasPendingVerification = localStorage.getItem(
              "pendingVerificationEmail"
            );

            // Check if email is verified
            const isEmailVerified = user.emailVerified === true;

            // FIX: Always set user as authenticated if we have a user in localStorage
            // Email verification will be handled separately in the UI
            state.user = user;
            state.isAuthenticated = true; 

            if (hasPendingVerification || !isEmailVerified) {
              console.log(
                "⚠️ User email not verified or has pending verification"
              );
              state.verification = {
                pending: true,
                email: hasPendingVerification || user.email,
                lastSentAt: null,
                attempts: 0,
              };
            } else {
              state.verification = initialState.verification;
            }

            console.log(
              "✅ User loaded from localStorage (authenticated: true, email verified:",
              isEmailVerified,
              ")"
            );
          }

          // Load Firebase user (serializable version)
          const firebaseUserStr = localStorage.getItem("firebase_user");
          if (firebaseUserStr) {
            try {
              const firebaseUser = JSON.parse(firebaseUserStr);
              state.firebaseUser = firebaseUser;
              console.log("✅ Firebase user loaded from localStorage");
            } catch (e) {
              console.error("Error parsing Firebase user:", e);
              localStorage.removeItem("firebase_user");
            }
          }

          const authDataStr = localStorage.getItem("authData");
          if (authDataStr) {
            console.log("✅ Auth data loaded from localStorage");
          }
        } catch (error) {
          console.error("Error loading from localStorage:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("authData");
          localStorage.removeItem("firebase_user");
          localStorage.removeItem("pendingVerificationEmail");
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
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;

        // TEMPORARILY: Don't check emailVerified for login
        // We'll assume the user can log in, and check emailVerified later

        state.isAuthenticated = true;

        // Still set verification state if email is not verified
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

        state.error = null;
        console.log("Login - State updated with user:", action.payload.user);
        console.log("Email verified:", isEmailVerified);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }
      })

      // Google Login cases
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
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
          "Google Login - State updated with user:",
          action.payload.user
        );
        console.log("Email verified:", isEmailVerified);
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }
      })

      // Register cases
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

        // Set verification as pending
        state.verification = {
          pending: true,
          email: user.email,
          lastSentAt: new Date().toISOString(),
          attempts: 1,
        };

        state.isAuthenticated = false;

        // DO NOT save to localStorage yet - wait for verification
        // if (typeof window !== "undefined") {
        //   localStorage.setItem("user", JSON.stringify(user));
        // }

        state.error = null;
        console.log(
          "Register - User registered, email verification pending, NOT authenticated"
        );
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

      // Refresh token cases
      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user.userId) {
          const user = mapApiResponseToUser(action.payload);

          // Check if email is verified before authenticating
          const isEmailVerified = user.emailVerified === true;
          state.user = user;
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

          console.log(
            "Token refresh successful, email verified:",
            isEmailVerified
          );
        }
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }
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
                if (authData.user) {
                  authData.user.emailVerified = true;
                  authData.user.isActive = true;
                  localStorage.setItem("authData", JSON.stringify(authData));
                }
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