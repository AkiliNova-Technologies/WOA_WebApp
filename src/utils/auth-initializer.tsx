// src/utils/auth-initializer.tsx
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  loadUserFromStorage,
  refreshAccessToken,
  selectCurrentUser,
  selectIsAuthenticated,
  selectInitialLoading,
  logout,
} from "@/redux/slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import {
  checkAuthSession,
  getAuthState,
  startTokenRefreshScheduler,
  manualTokenRefresh,
  getAccessToken,
  setAccessToken,
} from "./api";
import { MorphingSpinner } from "@/components/ui/morphing-spinner";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const initialLoading = useAppSelector(selectInitialLoading);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const schedulerCleanupRef = useRef<(() => void) | null>(null);
  const initRef = useRef(false);

  // Get user-specific redirect path based on user type
  const getUserRedirectPath = (userType: string): string => {
    const redirectMap: Record<string, string> = {
      superadmin: "/admin/dashboard",
      admin: "/admin/dashboard",
      ADMIN: "/admin/dashboard",
      SUPER_ADMIN: "/admin/dashboard",
      APP_USER: "/dashboard",
      CLIENT: "/dashboard",
      VENDOR: "/vendor/dashboard",
      MANAGER: "/manager/dashboard",
    };

    return redirectMap[userType] || "/dashboard";
  };

  // Check if current path is a public route
  const isPublicRoute = (path: string): boolean => {
    const publicRoutes = [
      "/auth",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/verify-email",
      "/admin/auth",
      "/vendor/auth",
      "/",
    ];

    return publicRoutes.some((route) => path.startsWith(route));
  };

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      console.log("🔴 Logout event received");
      dispatch(logout());

      const currentPath = location.pathname;
      if (!isPublicRoute(currentPath)) {
        navigate("/auth/", { replace: true });
      }
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [dispatch, navigate, location]);

  // Initial auth check and load
  useEffect(() => {
    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth...");
        setIsRefreshing(true);

        // First, load user from storage (synchronous)
        dispatch(loadUserFromStorage());

        // Check if we have access token (in memory or localStorage)
        const authState = getAuthState();
        let hasAccessToken = !!getAccessToken();

        if (!hasAccessToken && authState.hasToken) {
          // Restore from localStorage if available
          console.log("📦 Restoring access token from localStorage to memory");
          setAccessToken(authState.accessToken);
          hasAccessToken = true;
        }

        if (hasAccessToken) {
          console.log("✅ Access token found");

          // Check if session is still valid
          const isValidSession = checkAuthSession();

          if (isValidSession) {
            console.log("✅ Session is valid");

            // Try to refresh the access token to ensure it's fresh
            // This also validates the HttpOnly refresh token cookie
            try {
              console.log("🔄 Refreshing access token on init...");
              await dispatch(refreshAccessToken()).unwrap();
              console.log("✅ Token refreshed successfully on init");

              // After successful refresh, check if user should be redirected
              const currentPath = location.pathname;
              const isPublic = isPublicRoute(currentPath);

              if (isPublic && authState.emailVerified && authState.role) {
                const redirectPath = getUserRedirectPath(authState.role);
                console.log(
                  "🔄 Redirecting authenticated user to:",
                  redirectPath
                );
                navigate(redirectPath, { replace: true });
              }
            } catch (refreshError) {
              console.error(
                "❌ Failed to refresh token on init:",
                refreshError
              );
              // If refresh fails, it means the HttpOnly cookie is invalid/expired
              // Clear auth and redirect to login
              dispatch(logout());

              const currentPath = location.pathname;
              if (!isPublicRoute(currentPath)) {
                navigate("/auth", { replace: true });
              }
            }
          } else {
            console.log("❌ Session is invalid or expired");
            dispatch(logout());

            const currentPath = location.pathname;
            if (!isPublicRoute(currentPath)) {
              navigate("/auth", { replace: true });
            }
          }
        } else {
          console.log("ℹ️ No access token found");

          // No access token, but maybe we have a valid HttpOnly cookie
          // Try to refresh to get a new access token
          try {
            console.log("🔄 Attempting silent refresh with HttpOnly cookie...");
            await dispatch(refreshAccessToken()).unwrap();
            console.log("✅ Silent refresh successful");

            // After successful refresh, check if user should be redirected
            const authState = getAuthState();
            const currentPath = location.pathname;
            const isPublic = isPublicRoute(currentPath);

            if (isPublic && authState.emailVerified && authState.role) {
              const redirectPath = getUserRedirectPath(authState.role);
              console.log(
                "🔄 Redirecting authenticated user to:",
                redirectPath
              );
              navigate(redirectPath, { replace: true });
            }
          } catch (error) {
            console.log("ℹ️ No valid session found, user needs to login");

            // No valid session, ensure user is on public route
            const currentPath = location.pathname;
            if (!isPublicRoute(currentPath)) {
              navigate("/auth/login", { replace: true });
            }
          }
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
      } finally {
        setIsRefreshing(false);
        setIsInitialized(true);
        console.log("✅ Auth initialization complete");
      }
    };

    initializeAuth();
  }, []); // Only run once on mount

  // Start token refresh scheduler when authenticated
  useEffect(() => {
    if (isAuthenticated && user && isInitialized) {
      console.log("🚀 Starting token refresh scheduler...");

      const cleanup = startTokenRefreshScheduler();
      schedulerCleanupRef.current = cleanup;

      console.log("✅ Token refresh scheduler started");
    } else {
      // Stop scheduler if not authenticated
      if (schedulerCleanupRef.current) {
        schedulerCleanupRef.current();
        schedulerCleanupRef.current = null;
      }
    }

    return () => {
      if (schedulerCleanupRef.current) {
        schedulerCleanupRef.current();
        schedulerCleanupRef.current = null;
      }
    };
  }, [isAuthenticated, user, isInitialized]);

  // Handle page visibility change
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ Page visible, checking auth...");

        // Check if session is still valid
        const isValid = checkAuthSession();

        if (!isValid) {
          console.log("❌ Session invalid, attempting refresh...");
          
          // Try to refresh using HttpOnly cookie
          try {
            await dispatch(refreshAccessToken()).unwrap();
            console.log("✅ Session refreshed on visibility change");
          } catch (error) {
            console.log("❌ Refresh failed, logging out");
            dispatch(logout());
            navigate("/auth", { replace: true });
          }
          return;
        }

        // Try to refresh token
        try {
          await manualTokenRefresh();
        } catch (error) {
          console.error("Failed to refresh on visibility change:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, user, dispatch, navigate]);

  // Handle user activity for proactive token refresh
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let activityTimeout: NodeJS.Timeout;
    let lastActivity = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      // Only trigger if enough time has passed since last activity
      if (timeSinceLastActivity < 60000) return; // 1 minute minimum

      lastActivity = now;

      // Clear existing timeout
      clearTimeout(activityTimeout);

      // Set new timeout - refresh after 2 minutes of activity
      activityTimeout = setTimeout(async () => {
        try {
          await manualTokenRefresh();
        } catch (error) {
          console.error("Failed to refresh on activity:", error);
        }
      }, 2 * 60 * 1000);
    };

    // Listen to user activity (throttled)
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      clearTimeout(activityTimeout);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [isAuthenticated, user]);

  // Show loading state during initialization or refresh
  if (!isInitialized || initialLoading || isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-8">
          <MorphingSpinner size="lg" />
          {/* <p className="text-gray-600">Loading</p> */}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}