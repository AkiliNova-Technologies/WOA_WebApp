import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  login,
  logoutAsync,
  updateUser,
  setUser,
  clearError,
  logout,
  loadUserFromStorage,
  checkAuth,
  refreshAccessToken,
  register,
  loginWithGoogle,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectInitialLoading,
  selectFirebaseUser,
  extractSerializableFirebaseUser,
  setSerializableFirebaseUser,
} from "@/redux/slices/authSlice";
import type { User } from "@/redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { auth } from "@/config/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseSignUp,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { toast } from "sonner";

export function useReduxAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Use selectors directly for better performance
  const user = useAppSelector(selectCurrentUser);
  const firebaseUser = useAppSelector(selectFirebaseUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const initialLoading = useAppSelector(selectInitialLoading);
  const error = useAppSelector(selectAuthError);

  // Local state for Firebase auth status
  const [firebaseAuthLoading, setFirebaseAuthLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Use the helper function to extract serializable data
        const serializableUser = extractSerializableFirebaseUser(user);
        // Use setSerializableFirebaseUser instead of setFirebaseUser
        dispatch(setSerializableFirebaseUser(serializableUser));
      } else {
        dispatch(setSerializableFirebaseUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Convert Firebase error to user-friendly message
  const getFirebaseErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      "auth/invalid-email": "Invalid email address.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/email-already-in-use": "This email is already in use.",
      "auth/weak-password": "Password is too weak. Use at least 6 characters.",
      "auth/operation-not-allowed": "Email/password accounts are not enabled.",
      "auth/account-exists-with-different-credential":
        "An account already exists with the same email.",
      "auth/popup-closed-by-user":
        "Sign-in popup was closed. Please try again.",
      "auth/cancelled-popup-request": "Sign-in cancelled.",
      "auth/popup-blocked": "Sign-in popup was blocked. Please allow popups.",
      "auth/network-request-failed":
        "Network error. Please check your internet.",
      default: "An error occurred. Please try again.",
    };

    return errorMessages[errorCode] || errorMessages.default;
  };

  // ========================
  // EXISTING REDUX AUTH METHODS
  // ========================

  const signin = useCallback(
    async (email: string, password: string) => {
      return dispatch(login({ email, password })).unwrap();
    },
    [dispatch]
  );

  const signup = useCallback(
    async (registrationData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      [key: string]: any;
    }) => {
      return dispatch(register(registrationData)).unwrap();
    },
    [dispatch]
  );

  const signout = useCallback(async () => {
    try {
      // Logout from Firebase if signed in
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }

      // Logout from Redux/backend
      await dispatch(logoutAsync()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logout());
    }
  }, [dispatch, navigate]);

  const updateCurrentUser = useCallback(
    (userData: Partial<User>) => {
      dispatch(updateUser(userData));
    },
    [dispatch]
  );

  const setUserData = useCallback(
    (userData: { user: User }) => {
      dispatch(setUser(userData));
    },
    [dispatch]
  );

  const verifyAuth = useCallback(async () => {
    try {
      await dispatch(checkAuth()).unwrap();
      return true;
    } catch (error) {
      console.error("Auth verification failed:", error);
      return false;
    }
  }, [dispatch]);

  const refreshToken = useCallback(async () => {
    try {
      await dispatch(refreshAccessToken()).unwrap();
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // ========================
  // GOOGLE AUTH WITH BACKEND ENDPOINT
  // ========================

  const signInWithGoogle = useCallback(
    async (retryCount = 0) => {
      try {
        setFirebaseAuthLoading(true);

        const provider = new GoogleAuthProvider();
        provider.addScope("email");
        provider.addScope("profile");
        provider.setCustomParameters({
          prompt: "select_account",
        });

        // Sign in with Firebase Google OAuth
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Get Firebase ID token
        const idToken = await user.getIdToken();

        console.log(
          "Firebase Google login successful, sending token to backend:",
          {
            email: user.email,
            uid: user.uid,
            tokenPreview: idToken.substring(0, 20) + "...",
          }
        );

        // Send Firebase token to your backend with abort controller
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 45000); // 45 second timeout

        try {
          const response = await dispatch(
            loginWithGoogle({
              idToken,
              signal: abortController.signal,
            } as any)
          ).unwrap(); // Cast as any if TypeScript complains

          clearTimeout(timeoutId);
          toast.success("Google login successful!");
          return response.user;
        } catch (error: any) {
          clearTimeout(timeoutId);

          // Retry logic (max 2 retries)
          if (
            retryCount < 2 &&
            (error.includes("timeout") || error.includes("network"))
          ) {
            console.log(`Retrying Google login (attempt ${retryCount + 1})...`);
            return signInWithGoogle(retryCount + 1);
          }

          throw error;
        }
      } catch (error: any) {
        console.error("Google sign-in failed:", error);

        let errorMessage = "Google sign-in failed";
        if (error.code) {
          errorMessage = getFirebaseErrorMessage(error.code);
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
        throw error;
      } finally {
        setFirebaseAuthLoading(false);
      }
    },
    [dispatch]
  );

  // ========================
  // FIREBASE AUTH METHODS (Alternative)
  // ========================

  const signInWithFacebook = useCallback(async () => {
    try {
      setFirebaseAuthLoading(true);

      const provider = new FacebookAuthProvider();
      provider.addScope("email");
      provider.addScope("public_profile");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // You could create a similar Facebook endpoint or use Google endpoint
      const response = await dispatch(loginWithGoogle({ idToken })).unwrap();

      toast.success("Facebook login successful!");
      return response.user;
    } catch (error: any) {
      console.error("Facebook sign-in failed:", error);

      let errorMessage = "Facebook sign-in failed";
      if (error.code) {
        errorMessage = getFirebaseErrorMessage(error.code);
      }

      toast.error(errorMessage);
      throw error;
    } finally {
      setFirebaseAuthLoading(false);
    }
  }, [dispatch]);

  const signInWithEmailAndPasswordFirebase = useCallback(
    async (email: string, password: string) => {
      try {
        setFirebaseAuthLoading(true);

        const result = await firebaseSignIn(auth, email, password);
        const user = result.user;

        // Get Firebase ID token
        const idToken = await user.getIdToken();

        // Use your Google endpoint for Firebase email/password auth too
        const response = await dispatch(loginWithGoogle({ idToken })).unwrap();

        toast.success("Login successful!");
        return response.user;
      } catch (error: any) {
        console.error("Firebase email/password login failed:", error);

        let errorMessage = "Login failed";
        if (error.code) {
          errorMessage = getFirebaseErrorMessage(error.code);
        }

        toast.error(errorMessage);
        throw error;
      } finally {
        setFirebaseAuthLoading(false);
      }
    },
    [dispatch]
  );

  const signUpWithEmailAndPasswordFirebase = useCallback(
    async (email: string, password: string, displayName?: string) => {
      try {
        setFirebaseAuthLoading(true);

        const result = await firebaseSignUp(auth, email, password);
        const user = result.user;

        if (displayName) {
          await firebaseUpdateProfile(user, { displayName });
        }

        await sendEmailVerification(user);

        // Get Firebase ID token
        const idToken = await user.getIdToken();

        // Send to your backend
        const response = await dispatch(loginWithGoogle({ idToken })).unwrap();

        toast.success(
          "Account created successfully! Please check your email to verify your account."
        );
        return response.user;
      } catch (error: any) {
        console.error("Firebase registration failed:", error);

        let errorMessage = "Registration failed";
        if (error.code) {
          errorMessage = getFirebaseErrorMessage(error.code);
        }

        toast.error(errorMessage);
        throw error;
      } finally {
        setFirebaseAuthLoading(false);
      }
    },
    [dispatch]
  );

  const getFirebaseToken = useCallback(
    async (forceRefresh = false): Promise<string | null> => {
      if (!auth.currentUser) return null;
      return await auth.currentUser.getIdToken(forceRefresh);
    },
    []
  );

  const syncCurrentFirebaseUser = useCallback(async () => {
    if (auth.currentUser) {
      try {
        const idToken = await auth.currentUser.getIdToken();
        return await dispatch(loginWithGoogle({ idToken })).unwrap();
      } catch (error) {
        console.error("Failed to sync Firebase user:", error);
        throw error;
      }
    }
    return null;
  }, [dispatch]);

  // ========================
  // HELPER FUNCTIONS
  // ========================

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user || !user.permissions) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      if (!user || !user.roles) return false;
      return user.roles.includes(role);
    },
    [user]
  );

  const isUserType = useCallback(
    (userType: string): boolean => {
      if (!user) return false;
      return user.userType === userType;
    },
    [user]
  );

  const getFullName = useCallback((): string => {
    if (!user) return "";
    return `${user.firstName} ${user.lastName}`.trim();
  }, [user]);

  const getAvatar = useCallback((): string | undefined => {
    if (!user) return undefined;

    if (user.avatar) return user.avatar;

    if (firebaseUser?.photoURL) return firebaseUser.photoURL;

    return undefined;
  }, [user, firebaseUser]);

  const isFirebaseAuth = useCallback((): boolean => {
    return !!auth.currentUser;
  }, []);

  const getAuthMethod = useCallback((): "firebase" | "backend" | "mixed" => {
    const hasFirebase = !!auth.currentUser;
    const hasBackend = !!user;

    if (hasFirebase && hasBackend) return "mixed";
    if (hasFirebase) return "firebase";
    if (hasBackend) return "backend";
    return "backend";
  }, [user]);

  const getCombinedLoading = useCallback((): boolean => {
    return loading || firebaseAuthLoading;
  }, [loading, firebaseAuthLoading]);

  return {
    // State
    user,
    firebaseUser,
    isAuthenticated,
    loading: getCombinedLoading(),
    initialLoading,
    error,

    // Existing Redux Auth Actions
    signin,
    signup,
    signout,
    updateCurrentUser,
    setUser: setUserData,
    verifyAuth,
    refreshToken,
    clearError: clearAuthError,

    // Google Auth (uses your backend endpoint)
    signInWithGoogle,

    // Firebase Auth Methods
    signInWithFacebook,
    signInWithEmailAndPassword: signInWithEmailAndPasswordFirebase,
    signUpWithEmailAndPassword: signUpWithEmailAndPasswordFirebase,
    getFirebaseToken,
    syncCurrentFirebaseUser,

    // Helper functions
    hasPermission,
    hasRole,
    isUserType,
    getFullName,
    getAvatar,
    isFirebaseAuth,
    getAuthMethod,
  };
}
