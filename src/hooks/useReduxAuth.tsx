import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  login, 
  logoutAsync, 
  updateUser, 
  setUser, 
  setToken,
  clearError, 
  logout
} from '@/redux/slices/authSlice';
import type { User } from '@/redux/slices/authSlice';
import type { RootState } from '@/redux/store';
import { useNavigate } from 'react-router-dom';

export function useReduxAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const auth = useAppSelector((state: RootState) => state.auth);

  const {
    user = null,
    isAuthenticated = false,
    loading = false,
    error = null,
    
    token = null,
  } = auth;

  const signin = (email: string, password: string) =>
    dispatch(login({ email, password }));

  const signout = async () => {   
    try {
      await dispatch(logoutAsync()).unwrap();
      navigate('/login'); // Adjust the path as needed
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(logout());
      navigate('/login');
    }
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    dispatch(updateUser(userData));
  };

  const setUserData = (userData: { user: User; token?: string; expoPushToken?: string }) => {
    dispatch(setUser(userData));
  };

  const setAuthToken = (token: string) => {
    dispatch(setToken(token));
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    token,
    signin,
    signout,
    updateCurrentUser,
    setUser: setUserData,
    setToken: setAuthToken,
    clearError: clearAuthError,
  };
}