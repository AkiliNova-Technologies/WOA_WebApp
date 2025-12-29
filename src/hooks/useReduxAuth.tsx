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
  // Email verification and password management
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  checkEmailAvailability,
  selectVerificationState,
  selectVerificationPending,
  selectVerificationEmail,
  selectVerificationLastSent,
  selectVerificationAttempts,
  setVerificationPending,
  clearVerification,
  incrementVerificationAttempts,
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
import { selectUserProfile } from "@/redux/slices/usersSlice";

export function useReduxAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Use selectors directly for better performance
  const user = useAppSelector(selectCurrentUser);
  const profile = useAppSelector(selectUserProfile);
  const firebaseUser = useAppSelector(selectFirebaseUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const initialLoading = useAppSelector(selectInitialLoading);
  const error = useAppSelector(selectAuthError);

  // Verification state selectors
  const verificationState = useAppSelector(selectVerificationState);
  const verificationPending = useAppSelector(selectVerificationPending);
  const verificationEmail = useAppSelector(selectVerificationEmail);
  const verificationLastSent = useAppSelector(selectVerificationLastSent);
  const verificationAttempts = useAppSelector(selectVerificationAttempts);

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
      "auth/requires-recent-login":
        "Please log in again to perform this action.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/invalid-verification-code": "Invalid verification code.",
      "auth/invalid-verification-id": "Invalid verification ID.",
      "auth/expired-action-code": "The action code has expired.",
      "auth/invalid-action-code": "The action code is invalid.",
      default: "An error occurred. Please try again.",
    };

    return errorMessages[errorCode] || errorMessages.default;
  };

  // ========================
  // EXISTING REDUX AUTH METHODS
  // ========================

  const signin = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await dispatch(login({ email, password })).unwrap();

        // Only show success toast if user is authenticated
        if (result.user && result.user.isActive) {
          toast.success("Login successful!");
        } else if (result.user && !result.user.emailVerified) {
          // Set verification pending state
          dispatch(setVerificationPending({ email: result.user.email }));
        }

        return result;
      } catch (error: any) {
        console.error("Login failed:", error);
        toast.error(error || "Login failed");
        throw error;
      }
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
      try {
        const result = await dispatch(register(registrationData)).unwrap();

        // Show verification message instead of success
        toast.success(
          "Account created successfully! Please check your email for verification instructions."
        );

        // Set verification pending state
        dispatch(setVerificationPending({ email: result.user.email }));

        return result;
      } catch (error: any) {
        console.error("Registration failed:", error);
        toast.error(error || "Registration failed");
        throw error;
      }
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
      toast.success("Logged out successfully");
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
  // EMAIL VERIFICATION & PASSWORD MANAGEMENT
  // ========================

  const verifyEmailWithOTP = useCallback(
    async (email: string, otp: string) => {
      try {
        const result = await dispatch(verifyEmail({ email, otp })).unwrap();
        toast.success(result.message || "Email verified successfully!");

        // Clear verification state
        dispatch(clearVerification());

        // Navigate to login or dashboard
        navigate("/login");

        return result;
      } catch (error: any) {
        console.error("Email verification failed:", error);
        toast.error(error || "Email verification failed");
        throw error;
      }
    },
    [dispatch, navigate]
  );

  const resendVerificationOTP = useCallback(
    async (email: string) => {
      try {
        // Check if we've sent too many attempts
        if (verificationAttempts >= 3) {
          const lastSent = new Date(verificationLastSent || 0);
          const now = new Date();
          const minutesDiff =
            (now.getTime() - lastSent.getTime()) / (1000 * 60);

          if (minutesDiff < 5) {
            throw new Error(
              "Please wait 5 minutes before requesting another verification email."
            );
          }
        }

        const result = await dispatch(
          resendVerificationEmail({ email })
        ).unwrap();
        toast.success(result.message || "Verification email resent!");

        // Update verification attempts
        dispatch(incrementVerificationAttempts());

        return result;
      } catch (error: any) {
        console.error("Failed to resend verification:", error);
        toast.error(error || "Failed to resend verification email");
        throw error;
      }
    },
    [dispatch, verificationAttempts, verificationLastSent]
  );

  const requestPasswordReset = useCallback(
    async (email: string) => {
      try {
        const result = await dispatch(forgotPassword({ email })).unwrap();
        toast.success(result.message || "Password reset email sent!");

        // Set verification pending state for password reset
        dispatch(setVerificationPending({ email }));

        return result;
      } catch (error: any) {
        console.error("Forgot password failed:", error);
        toast.error(error || "Failed to send password reset email");
        throw error;
      }
    },
    [dispatch]
  );

  const resetPasswordWithOTP = useCallback(
    async (email: string, otp: string, newPassword: string) => {
      try {
        const result = await dispatch(
          resetPassword({ email, otp, newPassword })
        ).unwrap();
        toast.success(result.message || "Password reset successful!");

        // Clear verification state
        dispatch(clearVerification());

        // Navigate to login
        navigate("/login");

        return result;
      } catch (error: any) {
        console.error("Password reset failed:", error);
        toast.error(error || "Password reset failed");
        throw error;
      }
    },
    [dispatch, navigate]
  );

  const changeUserPassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        const result = await dispatch(
          changePassword({ currentPassword, newPassword })
        ).unwrap();
        toast.success(result.message || "Password changed successfully!");
        return result;
      } catch (error: any) {
        console.error("Password change failed:", error);
        toast.error(error || "Password change failed");
        throw error;
      }
    },
    [dispatch]
  );

  const checkEmailAvailable = useCallback(
    async (email: string) => {
      try {
        const result = await dispatch(
          checkEmailAvailability({ email })
        ).unwrap();
        return result;
      } catch (error: any) {
        console.error("Email availability check failed:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const setEmailVerificationPending = useCallback(
    (email: string) => {
      dispatch(setVerificationPending({ email }));
    },
    [dispatch]
  );

  const clearEmailVerification = useCallback(() => {
    dispatch(clearVerification());
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
          ).unwrap();

          clearTimeout(timeoutId);

          // Clear any verification state
          dispatch(clearVerification());

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

      // Clear verification state
      dispatch(clearVerification());

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

        // Check if email is verified
        if (!user.emailVerified) {
          toast.warning("Please verify your email before logging in.");
          // You might want to send verification email or redirect to verification page
          await sendEmailVerification(user);
          throw new Error("Email not verified");
        }

        // Get Firebase ID token
        const idToken = await user.getIdToken();

        // Use your Google endpoint for Firebase email/password auth too
        const response = await dispatch(loginWithGoogle({ idToken })).unwrap();

        // Clear verification state
        dispatch(clearVerification());

        toast.success("Login successful!");
        return response.user;
      } catch (error: any) {
        console.error("Firebase email/password login failed:", error);

        let errorMessage = "Login failed";
        if (error.code) {
          errorMessage = getFirebaseErrorMessage(error.code);
        } else if (error.message === "Email not verified") {
          errorMessage = "Please verify your email first.";
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

        // Set verification pending state
        dispatch(setVerificationPending({ email }));

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
  // VERIFICATION HELPER FUNCTIONS
  // ========================

  const canResendVerification = useCallback((): boolean => {
    if (!verificationLastSent) return true;

    const lastSent = new Date(verificationLastSent);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastSent.getTime()) / (1000 * 60);

    // Allow resend after 1 minute
    return minutesDiff >= 1;
  }, [verificationLastSent]);

  const getResendCooldown = useCallback((): number => {
    if (!verificationLastSent) return 0;

    const lastSent = new Date(verificationLastSent);
    const now = new Date();
    const secondsDiff = Math.max(
      0,
      60 - Math.floor((now.getTime() - lastSent.getTime()) / 1000)
    );

    return secondsDiff;
  }, [verificationLastSent]);

  const isUserVerified = useCallback((): boolean => {
    // First check profile data (most reliable)
    if (profile?.emailVerified !== undefined) {
      return profile.emailVerified === true;
    }

    // Fallback to auth user data
    if (user?.emailVerified !== undefined) {
      return user.emailVerified === true;
    }

    // Default to false if we can't determine
    return false;
  }, [user, profile]);

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
    // Check profile first (most accurate)
    if (profile?.user?.firstName && profile?.user?.lastName) {
      return `${profile.user.firstName} ${profile.user.lastName}`.trim();
    }

    // Fallback to auth user
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`.trim();
    }

    return "";
  }, [user, profile]);

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

    // Verification State
    verificationState,
    verificationPending,
    verificationEmail,
    verificationLastSent,
    verificationAttempts,

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

    // Email Verification & Password Functions
    verifyEmail: verifyEmailWithOTP,
    resendVerificationEmail: resendVerificationOTP,
    forgotPassword: requestPasswordReset,
    resetPassword: resetPasswordWithOTP,
    changePassword: changeUserPassword,
    checkEmailAvailability: checkEmailAvailable,
    setEmailVerificationPending,
    clearEmailVerification,

    // Verification Helper Functions
    canResendVerification,
    getResendCooldown,
    isUserVerified,

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
