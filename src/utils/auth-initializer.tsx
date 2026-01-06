// src/utils/auth-initializer.tsx
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  loadUserFromStorage, 
  refreshAccessToken,
  selectCurrentUser,
  selectIsAuthenticated,
  logout
} from '@/redux/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  checkAuthSession, 
  getAuthState,
  startTokenRefreshScheduler
} from './api';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);
  const schedulerCleanupRef = useRef<(() => void) | null>(null);

  // Get user-specific redirect path based on user type
  const getUserRedirectPath = (userType: string): string => {
    const redirectMap: Record<string, string> = {
      'superadmin': '/admin/dashboard',
      'admin': '/admin/dashboard',
      'ADMIN': '/admin/dashboard',
      'SUPER_ADMIN': '/admin/dashboard',
      'APP_USER': '/dashboard',
      'CLIENT': '/dashboard',
      'VENDOR': '/vendor/dashboard',
      'MANAGER': '/manager/dashboard',
    };

    return redirectMap[userType] || '/dashboard';
  };

  // Get user-specific sign-in path
  const getUserSignInPath = (userType?: string): string => {
    if (!userType) return '/auth/login';

    const signInMap: Record<string, string> = {
      'superadmin': '/admin/auth',
      'admin': '/admin/auth',
      'ADMIN': '/admin/auth',
      'SUPER_ADMIN': '/admin/auth',
      'APP_USER': '/auth',
      'CLIENT': '/auth',
      'VENDOR': '/vendor/auth',
    };

    return signInMap[userType] || '/auth';
  };

  // Check if current path is a public route
  const isPublicRoute = (path: string): boolean => {
    const publicRoutes = [
      '/auth',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/admin/auth',
      '/vendor/auth',
      '/',
    ];

    return publicRoutes.some(route => path.startsWith(route));
  };

  // Refresh token function with cooldown
  const refreshTokenIfNeeded = async (force = false) => {
    try {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshRef.current;
      const REFRESH_COOLDOWN = 30000; // 30 seconds

      if (!force && timeSinceLastRefresh < REFRESH_COOLDOWN) {
        console.log('⏳ Skipping refresh - cooldown period');
        return true;
      }

      const authState = getAuthState();
      
      if (!authState.hasToken || !authState.refreshToken) {
        console.log('❌ No refresh token available');
        return false;
      }

      if (!checkAuthSession() || force) {
        console.log('🔄 Refreshing access token...');
        
        await dispatch(refreshAccessToken()).unwrap();
        lastRefreshRef.current = Date.now();
        
        console.log('✅ Token refreshed successfully');
        return true;
      }

      return true;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      dispatch(logout());
      
      if (user?.userType) {
        const signInPath = getUserSignInPath(user.userType);
        navigate(signInPath, { 
          state: { from: location.pathname },
          replace: true 
        });
      } else {
        navigate('/auth/', { 
          state: { from: location.pathname },
          replace: true 
        });
      }
      
      return false;
    }
  };

  // Initial auth check and load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // Load user from storage
        dispatch(loadUserFromStorage());

        // Check if we have auth data
        const authState = getAuthState();
        
        if (authState.hasToken && authState.refreshToken) {
          // Try to refresh token on initial load
          const refreshSuccess = await refreshTokenIfNeeded(true);
          
          if (refreshSuccess) {
            // User is authenticated, check if they're on the right page
            const currentPath = location.pathname;
            const isPublic = isPublicRoute(currentPath);
            
            // Check if user has verified email and get their role
            const isEmailVerified = authState.emailVerified === true;
            const userRole = authState.role || 'APP_USER';
            
            if (isPublic && isEmailVerified) {
              // Redirect authenticated users away from public pages
              const redirectPath = getUserRedirectPath(userRole);
              console.log('🔄 Redirecting authenticated user to:', redirectPath);
              navigate(redirectPath, { replace: true });
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
        console.log('✅ Auth initialized');
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Start token refresh scheduler when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && isInitialized) {
      console.log('🚀 Starting token refresh scheduler...');
      
      // Start the API-level scheduler
      const cleanup = startTokenRefreshScheduler();
      schedulerCleanupRef.current = cleanup;
      
      // Also keep the component-level scheduler for redundancy
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }

      // Refresh token every 10 minutes
      refreshTimerRef.current = setInterval(() => {
        if (isAuthenticated && user) {
          refreshTokenIfNeeded(false);
        }
      }, 10 * 60 * 1000); // 10 minutes

      console.log('✅ Token refresh schedulers started');
    } else {
      // Stop schedulers if not authenticated
      if (schedulerCleanupRef.current) {
        schedulerCleanupRef.current();
        schedulerCleanupRef.current = null;
      }
      
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }

    // Cleanup
    return () => {
      if (schedulerCleanupRef.current) {
        schedulerCleanupRef.current();
        schedulerCleanupRef.current = null;
      }
      
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [isAuthenticated, user, isInitialized]);

  // Handle user activity for proactive token refresh
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let activityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      // Clear existing timeout
      clearTimeout(activityTimeout);

      // Set new timeout - refresh after 2 minutes of activity
      activityTimeout = setTimeout(() => {
        refreshTokenIfNeeded(false);
      }, 2 * 60 * 1000);
    };

    // Listen to user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      clearTimeout(activityTimeout);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isAuthenticated, user]);

  // Handle page visibility change
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, refresh token if needed
        console.log('👁️ Page visible, checking auth...');
        refreshTokenIfNeeded(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user]);

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}