import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchUserProfile,
  updateUserProfile,
  deleteUserAccount,
  submitVendorKYC,
  fetchUsers,
  updateUserRole,
  selectUserProfile,
  selectUsersList,
  selectUsersLoading,
  selectUsersError,
  selectKYCLoading,
  selectKYCError,
  selectKYCSubmitted,
  selectUsersPagination, 
  setProfile,
  clearProfile,
  clearError as clearUsersError,
  resetKYCState,
  clearUsersList,
  type UserProfile,
  type KYCData,
} from '@/redux/slices/usersSlice';

interface PaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
  data: T[];
  [key: string]: any;
}

export function useReduxUsers() {
  const dispatch = useAppDispatch();

  // Selectors - add type assertion to ensure proper type
  const profile = useAppSelector(selectUserProfile);
  const usersList = useAppSelector(selectUsersList) as UserProfile[] | PaginatedResponse<UserProfile>;
  const loading = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);
  const kycLoading = useAppSelector(selectKYCLoading);
  const kycError = useAppSelector(selectKYCError);
  const kycSubmitted = useAppSelector(selectKYCSubmitted);
  const pagination = useAppSelector(selectUsersPagination); 

  // Profile actions
  const getUserProfile = useCallback(async () => {
    try {
      return await dispatch(fetchUserProfile()).unwrap();
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  }, [dispatch]);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
      return await dispatch(updateUserProfile(profileData)).unwrap();
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, [dispatch]);

  const deleteAccount = useCallback(async () => {
    try {
      await dispatch(deleteUserAccount()).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }, [dispatch]);

  const submitKYC = useCallback(async (kycData: KYCData) => {
    try {
      return await dispatch(submitVendorKYC(kycData)).unwrap();
    } catch (error) {
      console.error('Failed to submit KYC:', error);
      throw error;
    }
  }, [dispatch]);

  const getUsers = useCallback(async (filters?: { 
    role?: string; 
    page?: number; 
    limit?: number; 
    sort?: string;
    search?: string;
  }) => {
    try {
      return await dispatch(fetchUsers(filters || {})).unwrap();
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }, [dispatch]);

  const updateRole = useCallback(async (id: string, role: string) => {
    try {
      return await dispatch(updateUserRole({ id, role })).unwrap();
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error;
    }
  }, [dispatch]);

  // Helper function to extract users array from response
  const getUsersArray = useCallback((): UserProfile[] => {
    if (!usersList) return [];
    
    if (Array.isArray(usersList)) {
      return usersList;
    }
    
    // Handle paginated response
    if (usersList && typeof usersList === 'object' && 'data' in usersList && Array.isArray(usersList.data)) {
      return usersList.data;
    }
    
    return [];
  }, [usersList]);

  const isVendor = useCallback((): boolean => {
    return profile?.vendorStatus === 'approved';
  }, [profile]);

  const isVendorPending = useCallback((): boolean => {
    return profile?.vendorStatus === 'pending';
  }, [profile]);

  const getFullName = useCallback((): string => {
    if (!profile) return '';
    return `${profile.firstName} ${profile.lastName}`.trim();
  }, [profile]);

  const getInitials = useCallback((): string => {
    if (!profile) return '';
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  }, [profile]);

  const getVendorUsers = useCallback((): UserProfile[] => {
    const users = getUsersArray();
    return users.filter(user => 
      user.userType === 'vendor' || 
      user.vendorStatus === 'approved' || 
      user.vendorStatus === 'pending'
    );
  }, [getUsersArray]);

  const getAdminUsers = useCallback((): UserProfile[] => {
    const users = getUsersArray();
    return users.filter(user => 
      user.userType === 'admin' || 
      user.roles?.includes('admin')
    );
  }, [getUsersArray]);

  const getClientUsers = useCallback((): UserProfile[] => {
    const users = getUsersArray();
    return users.filter(user => 
      user.userType === 'client' || 
      (!user.userType && !user.vendorStatus)
    );
  }, [getUsersArray]);

  const getUsersByStatus = useCallback((status: UserProfile['vendorStatus'] | UserProfile['accountStatus']): UserProfile[] => {
    const users = getUsersArray();
    return users.filter(user => 
      user.vendorStatus === status || user.accountStatus === status
    );
  }, [getUsersArray]);

  // Utility actions
  const setUserProfile = useCallback((user: UserProfile) => {
    dispatch(setProfile(user));
  }, [dispatch]);

  const clearUserProfile = useCallback(() => {
    dispatch(clearProfile());
  }, [dispatch]);

  const clearUsers = useCallback(() => {
    dispatch(clearUsersList());
  }, [dispatch]);

  const clearUsersErrors = useCallback(() => {
    dispatch(clearUsersError());
  }, [dispatch]);

  const resetKYC = useCallback(() => {
    dispatch(resetKYCState());
  }, [dispatch]);

  return {
    // State
    profile,
    usersList: getUsersArray(), // Return array instead of raw response
    loading,
    error,
    kycLoading,
    kycError,
    kycSubmitted,
    pagination,
    
    // Profile actions
    getUserProfile,
    updateProfile,
    deleteAccount,
    
    // KYC actions
    submitKYC,
    
    // Admin actions
    getUsers,
    updateRole,
    
    // Helper functions
    isVendor,
    isVendorPending,
    getFullName,
    getInitials,
    getVendorUsers,
    getAdminUsers,
    getClientUsers,
    getUsersByStatus,
    
    // Utility actions
    setUserProfile,
    clearUserProfile,
    clearUsers,
    clearUsersErrors,
    resetKYC,
  };
}