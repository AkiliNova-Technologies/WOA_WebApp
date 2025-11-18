import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/utils/api";

export interface User {
  id: string;
  userType: "APP_USER" | "SYSTEM_MANAGER" | string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  isActive: boolean;
  permissions: string[];
  roles: string[];
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initialLoading: true,
  error: null,
  token: null,
  refreshToken: null,
};

// 🗂️ localStorage utility functions
const storage = {
  getItem: (key: string) => {
    if (typeof window !== "undefined") {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return null;
      }
    }
    return null;
  },

  setItem: (key: string, value: any) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }
  },

  removeItem: (key: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error);
      }
    }
  },

  clear: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("authData");
      } catch (error) {
        console.error("Error clearing auth data from localStorage:", error);
      }
    }
  },
};

// 🔐 Load initial state from localStorage
// In your authSlice.ts
export const loadAuthState = createAsyncThunk(
  "auth/loadAuthState",
  async (_, { rejectWithValue }) => {
    try {
      const authData = storage.getItem("authData");
      if (authData && authData.token && authData.user) {
        console.log("✅ Auth state loaded from localStorage:", authData);
        return authData;
      }
      console.log("ℹ️ No auth data found in localStorage");
      return rejectWithValue("No persisted auth data found");
    } catch (error) {
      console.error("Error loading auth state from localStorage:", error);
      return rejectWithValue("Failed to load auth state");
    }
  }
);

// 🔐 Login Thunk - with localStorage persistence
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      // Handle the actual API response format
      if (response.data && response.data.accessToken && response.data.user) {
        const authData: AuthResponse = response.data;

        // Save to localStorage
        const authState = {
          user: authData.user,
          token: authData.accessToken,
          refreshToken: authData.refreshToken,
          tokenType: authData.tokenType,
        };

        storage.setItem("authData", authState);
        console.log("✅ Auth data saved to localStorage");

        return authState;
      }

      return rejectWithValue("Invalid login response format");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed";
      console.error("Login error:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// 🔐 Logout - with localStorage cleanup
export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      // If you have a logout endpoint, call it here
      await api.post("/api/v1/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
      // Even if logout API fails, we still logout locally
    } finally {
      // Clear localStorage
      storage.clear();
      console.log("✅ Auth data cleared from localStorage");

      // Always clear local auth state
      dispatch(logout());
      return true;
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
        token?: string;
        refreshToken?: string;
      }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token || null;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      state.error = null;

      // Save to localStorage when manually setting user
      storage.setItem("authData", {
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      });
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;

      // Clear localStorage
      storage.clear();
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };

        // Update localStorage
        storage.setItem("authData", {
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
        });
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;

      // Update localStorage
      if (state.user) {
        storage.setItem("authData", {
          user: state.user,
          token: action.payload,
          refreshToken: state.refreshToken,
        });
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;

        console.log("Auth state updated:", {
          user: action.payload.user,
          isAuthenticated: true,
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;

        // Clear localStorage on login failure
        storage.clear();
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loading = false;
      })
      .addCase(loadAuthState.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        console.log("✅ Auth state restored from localStorage");
      })
      .addCase(loadAuthState.rejected, (state) => {
        state.loading = false;
        // Don't set error here as it's normal for first-time users
        console.log("ℹ️ No persisted auth state found");
      })
      .addCase(loadAuthState.pending, (state) => {
        state.loading = true;
      });
  },
});

// 🎯 Export actions
export const { setUser, logout, updateUser, setToken, clearError } =
  authSlice.actions;

export default authSlice.reducer;

// 🧠 Selectors
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;