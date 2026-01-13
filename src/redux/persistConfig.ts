import storage from 'redux-persist/lib/storage';
import type { PersistConfig } from 'redux-persist';

// AuthState interface - matches your authSlice
interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  firebaseUser: any | null;
  verification: {
    pending: boolean;
    email: string | null;
    lastSentAt: string | null;
    attempts: number;
  };
}

// Persist configuration for auth slice
export const authPersistConfig: PersistConfig<AuthState> = {
  key: 'auth',
  storage,
  version: 1,
  // Only persist these fields
  whitelist: ['user', 'isAuthenticated', 'firebaseUser'],
  // Don't persist loading states and errors
  blacklist: ['loading', 'error', 'initialLoading', 'verification'],
  // Add throttle to reduce writes (in ms)
  throttle: 1000,
};

// You can add more persist configs for other slices if needed
// export const usersPersistConfig: PersistConfig<UsersState> = { ... };