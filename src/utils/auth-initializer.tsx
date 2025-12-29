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
import { checkAuthSession, getAuthState } from './api';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);

  // Get user-specific redirect path based on user type
  const getUserRedirectPath = (userType: string): string => {
    const redirectMap: Record<string, string> = {
      'ADMIN': '/admin/dashboard',
      'SUPER_ADMIN': '/admin/dashboard',
      'APP_USER': '/dashboard',
      'CLIENT': '/dashboard',
      'VENDOR': '/vendor/dashboard',
      'MANAGER': '/manager/dashboard',
      // Add more user types as needed
    };

    return redirectMap[userType] || '/dashboard';
  };

  // Get user-specific sign-in path
  const getUserSignInPath = (userType?: string): string => {
    if (!userType) return '/auth/login';

    const signInMap: Record<string, string> = {
      'ADMIN': '/admin/login',
      'SUPER_ADMIN': '/admin/login',
      'APP_USER': '/auth/login',
      'CLIENT': '/auth/login',
      'VENDOR': '/vendor/login',
      'MANAGER': '/manager/login',
    };

    return signInMap[userType] || '/auth/login';
  };

  // Check if current path is a public route
  const isPublicRoute = (path: string): boolean => {
    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/admin/login',
      '/vendor/login',
      '/manager/login',
      '/public',
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

  // Setup automatic token refresh scheduler
  const setupTokenRefreshScheduler = () => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    // Refresh token every 10 minutes
    refreshTimerRef.current = setInterval(() => {
      if (isAuthenticated && user) {
        refreshTokenIfNeeded(false);
      }
    }, 10 * 60 * 1000); // 10 minutes

    console.log('✅ Token refresh scheduler started');
  };

  // Initial auth check and load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Load user from storage
        dispatch(loadUserFromStorage());

        // Check if we have auth data
        const authState = getAuthState();
        
        if (authState.hasToken && authState.refreshToken) {
          // Try to refresh token on initial load
          const refreshSuccess = await refreshTokenIfNeeded(true);
          
          if (refreshSuccess && authState.user) {
            // User is authenticated, check if they're on the right page
            const currentPath = location.pathname;
            const isPublic = isPublicRoute(currentPath);
            
            if (isPublic && authState.user.emailVerified) {
              // Redirect authenticated users away from public pages
              const redirectPath = getUserRedirectPath(authState.user.userType);
              console.log('🔄 Redirecting authenticated user to:', redirectPath);
              navigate(redirectPath, { replace: true });
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Setup token refresh scheduler when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && isInitialized) {
      setupTokenRefreshScheduler();
    }

    // Cleanup
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
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