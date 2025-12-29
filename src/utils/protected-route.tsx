import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectInitialLoading,
  selectVerificationPending,
} from '@/redux/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserTypes?: string[];
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({
  children,
  requiredUserTypes,
  requireEmailVerification = true,
}: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const initialLoading = useAppSelector(selectInitialLoading);
  const verificationPending = useAppSelector(selectVerificationPending);
  const location = useLocation();

  // Show loading during initial check
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated || !user) {
    const defaultSignInPath = '/auth/login';
    return (
      <Navigate 
        to={defaultSignInPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Email verification required but not verified
  if (requireEmailVerification && !user.emailVerified && verificationPending) {
    return (
      <Navigate 
        to="/auth/verify-email" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check user type if specified
  if (requiredUserTypes && !requiredUserTypes.includes(user.userType)) {
    // Redirect to user's appropriate dashboard
    const userTypeRedirects: Record<string, string> = {
      'ADMIN': '/admin/dashboard',
      'SUPER_ADMIN': '/admin/dashboard',
      'APP_USER': '/dashboard',
      'CLIENT': '/dashboard',
      'VENDOR': '/vendor/dashboard',
      'MANAGER': '/manager/dashboard',
    };

    const redirectPath = userTypeRedirects[user.userType] || '/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}