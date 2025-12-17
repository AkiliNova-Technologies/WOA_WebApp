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
  permissions: string[];
  roles: string[];
  avatar?: string;
  firebaseUid?: string;
  phoneNumber?: string;
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
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initialLoading: true,
  error: null,
  firebaseUser: null,
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
const mapApiResponseToUser = (apiData: any, additionalData?: any): User => {
  return {
    id: apiData.userId?.toString() || apiData.id || "",
    userType: apiData.role || "APP_USER",
    email: apiData.email || "",
    firstName: additionalData?.firstName || apiData.firstName || "",
    lastName: additionalData?.lastName || apiData.lastName || "",
    username: apiData.email || "", // Using email as username
    isActive: true,
    permissions: apiData.permissions || [],
    roles: apiData.roles || [apiData.role || "client"],
    avatar: apiData.avatar || additionalData?.photoURL,
    firebaseUid: apiData.firebaseUid || additionalData?.uid,
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

// 🔄 Refresh token logic
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/v1/auth/refresh");
      return response.data;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
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
        const user = mapApiResponseToUser(response.data);

        console.log("Login - Mapped user:", user);

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
        const user = mapApiResponseToUser(response.data, registrationData);

        console.log("Register - Mapped user:", user);

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

      return rejectWithValue("Invalid registration response format");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("Register error:", errorMessage);
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
            state.user = user;
            state.isAuthenticated = true;
            console.log("✅ User loaded from localStorage:", user);
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
        }
      }
      state.initialLoading = false;
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
        state.isAuthenticated = true;
        state.error = null;
        console.log("Login - State updated with user:", action.payload.user);
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
        state.isAuthenticated = true;
        state.error = null;
        console.log(
          "Google Login - State updated with user:",
          action.payload.user
        );
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
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        console.log("Register - State updated with user:", action.payload.user);
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
      })

      // Check auth cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
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
        if (action.payload.userId) {
          const user = mapApiResponseToUser(action.payload);
          state.user = user;
          state.isAuthenticated = true;
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
