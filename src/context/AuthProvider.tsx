import { createContext, useContext, type ReactNode } from "react";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import type { User as ReduxUser } from "@/redux/slices/authSlice";
import { type User as FirebaseUser } from "firebase/auth";

// Extended user type that can come from either source
export type UnifiedUser = ReduxUser | FirebaseUser | null;

interface AuthContextType {
  user: UnifiedUser;
  isAuthenticated: boolean;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;

  // Auth Methods
  signin: (email: string, password: string) => Promise<ReduxUser>;
  signup: (registrationData: any) => Promise<ReduxUser>;
  signout: () => Promise<void>;

  // Firebase-specific methods - Change return type to ReduxUser
  signInWithGoogle: () => Promise<ReduxUser>; // Changed from FirebaseUser
  signInWithFacebook: () => Promise<ReduxUser>; // Changed from FirebaseUser
  signInWithEmailAndPassword: (
    email: string,
    password: string
  ) => Promise<ReduxUser>; // Changed from FirebaseUser
  signUpWithEmailAndPassword: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<ReduxUser>;

  // Helper methods
  updateCurrentUser: (userData: Partial<ReduxUser>) => void;
  setUser: (userData: { user: ReduxUser }) => void;
  verifyAuth: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  getFirebaseToken: (forceRefresh?: boolean) => Promise<string | null>;

  // Helper functions
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isUserType: (userType: string) => boolean;
  getFullName: () => string;
  isFirebaseAuth: () => boolean;
  getAuthMethod: () => "firebase" | "backend" | "mixed";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const reduxAuth = useReduxAuth();

  // Determine which user to use (Firebase takes precedence for display)
  const getUnifiedUser = (): UnifiedUser => {
    // If you want Firebase user for UI but Redux user for permissions,
    // you could return a combined object or choose one
    return reduxAuth.user; // Currently returns Redux user
  };

  const authContext: AuthContextType = {
    // State
    user: getUnifiedUser(),
    isAuthenticated: reduxAuth.isAuthenticated,
    loading: reduxAuth.loading,
    initialLoading: reduxAuth.initialLoading,
    error: reduxAuth.error,

    // Auth Methods
    signin: async (email: string, password: string) => {
      const result = await reduxAuth.signin(email, password);
      return result.user;
    },
    signup: async (registrationData: any) => {
      const result = await reduxAuth.signup(registrationData);
      return result.user;
    },
    signout: reduxAuth.signout,

    // Firebase-specific methods
    signInWithGoogle: reduxAuth.signInWithGoogle,
    signInWithFacebook: reduxAuth.signInWithFacebook,
    signInWithEmailAndPassword: reduxAuth.signInWithEmailAndPassword,
    signUpWithEmailAndPassword: reduxAuth.signUpWithEmailAndPassword,

    // Helper methods
    updateCurrentUser: reduxAuth.updateCurrentUser,
    setUser: reduxAuth.setUser,
    verifyAuth: reduxAuth.verifyAuth,
    refreshToken: reduxAuth.refreshToken,
    clearError: reduxAuth.clearError,
    getFirebaseToken: reduxAuth.getFirebaseToken,

    // Helper functions
    hasPermission: reduxAuth.hasPermission,
    hasRole: reduxAuth.hasRole,
    isUserType: reduxAuth.isUserType,
    getFullName: reduxAuth.getFullName,
    isFirebaseAuth: reduxAuth.isFirebaseAuth,
    getAuthMethod: reduxAuth.getAuthMethod,
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};
