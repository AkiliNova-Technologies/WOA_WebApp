// redux/hooks/useReduxVendors.ts
import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  submitVendorKYC,
  closeVendorShop,
  deleteVendorProfile,
  suspendVendor,
  activateVendor,
  approveVendorKYC,
  fetchPendingVendors,
  fetchVendor,
  reactivateVendor,
  fetchPublicVendor,
  toggleFollowVendor,
  fetchFollowedVendors,
  fetchAllVendors,
  selectVendors,
  selectPublicVendors,
  selectPendingVendors,
  selectSelectedVendor,
  selectVendorStats,
  selectVendorsLoading,
  selectVendorsError,
  selectVendorActionLoading,
  selectVendorActionError,
  setSelectedVendor,
  clearSelectedVendor,
  clearError as clearVendorsError,
  updateVendorInList,
  type VendorProfile,
  type PublicVendor,
} from '@/redux/slices/vendorsSlice';
import { useReduxUsers } from './useReduxUsers';
import type { UserProfile } from '@/redux/slices/usersSlice';
import { fetchVendorsForUsers } from '@/utils/vendor-api';

// Combined interface with both user and vendor data
export interface CombinedVendor {
  // User data
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  accountStatus?: string;
  createdAt: string;
  updatedAt: string;
  userRole?: string;
  
  // Vendor data
  vendorId?: string;
  businessName: string;
  businessDescription?: string;
  businessLogo?: string;
  businessBanner?: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  rating: number;
  reviewCount: number;
  followerCount: number;
  productCount: number;
  vendorStatus: 'pending' | 'active' | 'suspended' | 'deactivated' | 'deleted';
  isVerified: boolean;
  joinedAt: string;
  lastActiveAt: string;
  
  // Calculated/derived fields for UI
  storeName: string;
  managerEmail: string;
  phone: string;
  country: string;
  city: string;
  storeLocation: string;
  joinDate: string;
  signedUpOn: string;
  lastActive: string;
  status: 'pending' | 'active' | 'suspended' | 'deactivated' | 'deleted';
  totalProducts: number;
  totalSales: number;
  tier: 'basic' | 'premium' | 'enterprise';
  avatarColor: string;
  isVendor: boolean;
  hasVendorProfile: boolean;

  [key: string]: any;
}

export function useReduxVendors() {
  const dispatch = useAppDispatch();
  const { getUsers, usersList: usersListRaw, loading: usersLoading } = useReduxUsers();

  // Selectors
  const vendors = useAppSelector(selectVendors);
  const publicVendors = useAppSelector(selectPublicVendors);
  const pendingVendors = useAppSelector(selectPendingVendors);
  const selectedVendor = useAppSelector(selectSelectedVendor);
  const stats = useAppSelector(selectVendorStats);
  const loading = useAppSelector(selectVendorsLoading);
  const error = useAppSelector(selectVendorsError);
  const actionLoading = useAppSelector(selectVendorActionLoading);
  const actionError = useAppSelector(selectVendorActionError);

  // Helper function to extract users array
  const getUsersArray = useCallback((): UserProfile[] => {
    if (!usersListRaw) return [];
    
    // If it's already an array
    if (Array.isArray(usersListRaw)) {
      return usersListRaw;
    }
    
    // If it's an object with a data property
    if (usersListRaw && typeof usersListRaw === 'object') {
      const usersObj = usersListRaw as any;
      if ('data' in usersObj && Array.isArray(usersObj.data)) {
        return usersObj.data;
      }
      if ('items' in usersObj && Array.isArray(usersObj.items)) {
        return usersObj.items;
      }
      if ('results' in usersObj && Array.isArray(usersObj.results)) {
        return usersObj.results;
      }
      if ('users' in usersObj && Array.isArray(usersObj.users)) {
        return usersObj.users;
      }
    }
    
    return [];
  }, [usersListRaw]);

  // Get vendor users (users with vendor role/status)
  const getVendorUsers = useCallback(async (filters?: { 
    page?: number; 
    limit?: number; 
    sort?: string;
    search?: string;
  }) => {
    try {
      return await getUsers({
        role: 'vendor',
        ...filters,
      });
    } catch (error) {
      console.error('Failed to fetch vendor users:', error);
      throw error;
    }
  }, [getUsers]);

  // Helper functions that don't depend on state
  const extractCity = useCallback((address: string): string => {
    if (!address) return 'Unknown';
    const parts = address.split(',');
    return parts[0]?.trim() || 'Unknown';
  }, []);

  const extractCountry = useCallback((address: string): string => {
    if (!address) return 'Unknown';
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || 'Unknown';
  }, []);

  const generateAvatarColor = useCallback((seed: string): string => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2',
      '#EF476F', '#073B4C', '#7209B7', '#3A86FF', '#FB5607'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }, []);

  const getVendorStatusFromUser = useCallback((user: UserProfile): 'pending' | 'active' | 'suspended' | 'deactivated' | 'deleted' => {
    if (user.vendorStatus === 'pending') return 'pending';
    if (user.vendorStatus === 'approved') return 'active';
    if (user.accountStatus === 'suspended') return 'suspended';
    if (user.accountStatus === 'inactive') return 'deactivated';
    if (user.accountStatus === 'deleted') return 'deleted';
    return 'pending';
  }, []);

  // Memoize the fetchCombinedVendors function to prevent recreation
  const fetchCombinedVendors = useCallback(async (filters?: { 
    page?: number; 
    limit?: number; 
    sort?: string;
    search?: string;
  }) => {
    try {
      // First, fetch vendor users
      await getVendorUsers(filters);
      const vendorUsers = getUsersArray();
      
      // Extract vendor users from response
      const actualVendorUsers = vendorUsers.filter(user => 
        user.userType === 'vendor' || 
        user.roles?.includes('vendor') ||
        user.vendorStatus === 'pending' ||
        user.vendorStatus === 'approved'
      );

      if (actualVendorUsers.length === 0) {
        return [];
      }

      // Get user IDs for vendor fetching
      const userIds = actualVendorUsers.map(user => user.id);
      
      // Fetch vendor profiles in parallel using direct API call (not Redux)
      const vendorProfiles = await fetchVendorsForUsers(userIds);
      
      // Combine user and vendor data
      const combinedVendors: CombinedVendor[] = [];
      
      for (const user of actualVendorUsers) {
        const vendorProfile = vendorProfiles[user.id];
        
        if (vendorProfile) {
          // Map to combined vendor with vendor data
          const combinedVendor: CombinedVendor = {
            // User data
            id: user.id,
            userId: user.id,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            accountStatus: user.accountStatus,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            userRole: user.userType || user.roles?.[0],
            
            // Vendor data
            vendorId: vendorProfile.id,
            businessName: vendorProfile.businessName,
            businessDescription: vendorProfile.businessDescription,
            businessLogo: vendorProfile.businessLogo,
            businessBanner: vendorProfile.businessBanner,
            businessEmail: vendorProfile.businessEmail,
            businessPhone: vendorProfile.businessPhone,
            businessAddress: vendorProfile.businessAddress,
            rating: vendorProfile.rating,
            reviewCount: vendorProfile.reviewCount,
            followerCount: vendorProfile.followerCount,
            productCount: vendorProfile.productCount,
            vendorStatus: vendorProfile.vendorStatus,
            isVerified: vendorProfile.isVerified,
            joinedAt: vendorProfile.joinedAt,
            lastActiveAt: vendorProfile.lastActiveAt,
            
            // Calculated/derived fields
            storeName: vendorProfile.businessName,
            managerEmail: vendorProfile.businessEmail,
            phone: vendorProfile.businessPhone,
            country: extractCountry(vendorProfile.businessAddress),
            city: extractCity(vendorProfile.businessAddress),
            storeLocation: vendorProfile.businessAddress,
            joinDate: vendorProfile.joinedAt,
            signedUpOn: user.createdAt,
            lastActive: vendorProfile.lastActiveAt,
            status: vendorProfile.vendorStatus,
            totalProducts: vendorProfile.productCount,
            totalSales: Math.floor(Math.random() * 10000),
            tier: vendorProfile.isVerified ? 'premium' : 'basic',
            avatarColor: generateAvatarColor(user.email || user.id),
            isVendor: true,
            hasVendorProfile: true,
          };
          
          combinedVendors.push(combinedVendor);
        } else {
          // Create a combined vendor with only user data
          const basicVendor: CombinedVendor = {
            // User data
            id: user.id,
            userId: user.id,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            accountStatus: user.accountStatus,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            userRole: user.userType || user.roles?.[0],
            
            // Vendor data (defaults)
            vendorId: user.id,
            businessName: user.firstName ? `${user.firstName}'s Store` : 'Unknown Store',
            businessDescription: '',
            businessEmail: user.email,
            businessPhone: user.phoneNumber || '',
            businessAddress: '',
            rating: 0,
            reviewCount: 0,
            followerCount: 0,
            productCount: 0,
            vendorStatus: getVendorStatusFromUser(user),
            isVerified: false,
            joinedAt: user.createdAt,
            lastActiveAt: user.updatedAt,
            
            // Calculated/derived fields
            storeName: user.firstName ? `${user.firstName}'s Store` : 'Unknown Store',
            managerEmail: user.email,
            phone: user.phoneNumber || '',
            country: 'Unknown',
            city: 'Unknown',
            storeLocation: 'Unknown',
            joinDate: user.createdAt,
            signedUpOn: user.createdAt,
            lastActive: user.updatedAt,
            status: getVendorStatusFromUser(user),
            totalProducts: 0,
            totalSales: 0,
            tier: 'basic',
            avatarColor: generateAvatarColor(user.email || user.id),
            isVendor: true,
            hasVendorProfile: false,
          };
          
          combinedVendors.push(basicVendor);
        }
      }
      
      return combinedVendors;
    } catch (error) {
      console.error('Failed to fetch combined vendors:', error);
      throw error;
    }
  }, [getVendorUsers, getUsersArray, extractCountry, extractCity, generateAvatarColor, getVendorStatusFromUser]);

  // Calculate combined stats
  const calculateCombinedStats = useCallback((combinedVendors: CombinedVendor[]) => {
    const totalVendors = combinedVendors.length;
    const pendingApprovals = combinedVendors.filter(v => v.status === 'pending').length;
    const activeVendors = combinedVendors.filter(v => v.status === 'active').length;
    const suspendedVendors = combinedVendors.filter(v => v.status === 'suspended').length;
    const deactivatedVendors = combinedVendors.filter(v => v.status === 'deactivated').length;
    const deletedVendors = combinedVendors.filter(v => v.status === 'deleted').length;
    
    const totalProducts = combinedVendors.reduce((sum, v) => sum + v.totalProducts, 0);
    const totalRevenue = combinedVendors.reduce((sum, v) => sum + v.totalSales, 0);
    const averageRating = combinedVendors.length > 0 
      ? combinedVendors.reduce((sum, v) => sum + v.rating, 0) / combinedVendors.length
      : 0;

    return {
      totalVendors,
      pendingApprovals,
      activeVendors,
      suspendedVendors,
      deactivatedVendors,
      deletedVendors,
      totalProducts,
      totalRevenue,
      averageRating: parseFloat(averageRating.toFixed(2)),
    };
  }, []);

  // Filter combined vendors
  const filterCombinedVendors = useCallback((
    vendors: CombinedVendor[],
    searchQuery: string,
    statusFilter: string[],
    activeTab: string
  ): CombinedVendor[] => {
    return vendors.filter((vendor) => {
      // Tab filtering
      let matchesTab = true;
      if (activeTab !== "all") {
        matchesTab = activeTab === vendor.status;
      }

      // Search filtering
      const matchesSearch =
        searchQuery === "" ||
        vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${vendor.firstName} ${vendor.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.businessEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vendor.country && vendor.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (vendor.city && vendor.city.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(vendor.status);

      return matchesTab && matchesSearch && matchesStatus;
    });
  }, []);

  // Original vendor actions (keep all existing)
  const submitKYC = useCallback(async (kycData: FormData | any) => {
    try {
      return await dispatch(submitVendorKYC(kycData)).unwrap();
    } catch (error) {
      console.error('Failed to submit KYC:', error);
      throw error;
    }
  }, [dispatch]);

  const closeShop = useCallback(async () => {
    try {
      return await dispatch(closeVendorShop()).unwrap();
    } catch (error) {
      console.error('Failed to close shop:', error);
      throw error;
    }
  }, [dispatch]);

  const deleteProfile = useCallback(async () => {
    try {
      return await dispatch(deleteVendorProfile()).unwrap();
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw error;
    }
  }, [dispatch]);

  const suspend = useCallback(async (vendorId: string) => {
    try {
      return await dispatch(suspendVendor(vendorId)).unwrap();
    } catch (error) {
      console.error('Failed to suspend vendor:', error);
      throw error;
    }
  }, [dispatch]);

  const activate = useCallback(async (vendorId: string) => {
    try {
      return await dispatch(activateVendor(vendorId)).unwrap();
    } catch (error) {
      console.error('Failed to activate vendor:', error);
      throw error;
    }
  }, [dispatch]);

  const approveKYC = useCallback(async (vendorId: string) => {
    try {
      return await dispatch(approveVendorKYC(vendorId)).unwrap();
    } catch (error) {
      console.error('Failed to approve KYC:', error);
      throw error;
    }
  }, [dispatch]);

  const getPendingVendors = useCallback(async () => {
    try {
      return await dispatch(fetchPendingVendors()).unwrap();
    } catch (error) {
      console.error('Failed to fetch pending vendors:', error);
      throw error;
    }
  }, [dispatch]);

  const getVendor = useCallback(async (id: string, isPublic: boolean = false) => {
    try {
      if (isPublic) {
        return await dispatch(fetchPublicVendor(id)).unwrap();
      }
      return await dispatch(fetchVendor(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
      throw error;
    }
  }, [dispatch]);

  const reactivate = useCallback(async (vendorId: string) => {
    try {
      return await dispatch(reactivateVendor(vendorId)).unwrap();
    } catch (error) {
      console.error('Failed to reactivate vendor:', error);
      throw error;
    }
  }, [dispatch]);

  const toggleFollow = useCallback(async (vendorId: string) => {
    try {
      return await dispatch(toggleFollowVendor(vendorId)).unwrap();
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      throw error;
    }
  }, [dispatch]);

  const getFollowedVendors = useCallback(async () => {
    try {
      return await dispatch(fetchFollowedVendors()).unwrap();
    } catch (error) {
      console.error('Failed to fetch followed vendors:', error);
      throw error;
    }
  }, [dispatch]);

  const getAllVendors = useCallback(async () => {
    try {
      return await dispatch(fetchAllVendors()).unwrap();
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      throw error;
    }
  }, [dispatch]);

  // Original helper functions (keep all existing)
  const getVendorById = useCallback((id: string): VendorProfile | undefined => {
    return vendors.find(vendor => vendor.id === id);
  }, [vendors]);

  const getPublicVendorById = useCallback((id: string): PublicVendor | undefined => {
    return publicVendors.find(vendor => vendor.id === id);
  }, [publicVendors]);

  const getVendorsByStatus = useCallback((status: VendorProfile['vendorStatus']): VendorProfile[] => {
    return vendors.filter(vendor => vendor.vendorStatus === status);
  }, [vendors]);

  const getActiveVendors = useCallback((): VendorProfile[] => {
    return vendors.filter(vendor => vendor.vendorStatus === 'active');
  }, [vendors]);

  const getSuspendedVendors = useCallback((): VendorProfile[] => {
    return vendors.filter(vendor => vendor.vendorStatus === 'suspended');
  }, [vendors]);

  const getDeletedVendors = useCallback((): VendorProfile[] => {
    return vendors.filter(vendor => vendor.vendorStatus === 'deleted');
  }, [vendors]);

  const getDeactivatedVendors = useCallback((): VendorProfile[] => {
    return vendors.filter(vendor => vendor.vendorStatus === 'deactivated');
  }, [vendors]);

  const calculateStats = useCallback((): {
    totalVendors: number;
    activeVendors: number;
    pendingVendors: number;
    suspendedVendors: number;
    deactivatedVendors: number;
    deletedVendors: number;
    averageRating: number;
    totalProducts: number;
    totalFollowers: number;
  } => {
    const totalVendors = vendors.length;
    const activeVendors = getActiveVendors().length;
    const pendingVendorsCount = pendingVendors.length;
    const suspendedVendors = getSuspendedVendors().length;
    const deactivatedVendors = getDeactivatedVendors().length;
    const deletedVendors = getDeletedVendors().length;
    
    const averageRating = vendors.length > 0 
      ? vendors.reduce((sum, vendor) => sum + vendor.rating, 0) / vendors.length
      : 0;
    
    const totalProducts = vendors.reduce((sum, vendor) => sum + vendor.productCount, 0);
    const totalFollowers = vendors.reduce((sum, vendor) => sum + vendor.followerCount, 0);

    return {
      totalVendors,
      activeVendors,
      pendingVendors: pendingVendorsCount,
      suspendedVendors,
      deactivatedVendors,
      deletedVendors,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalProducts,
      totalFollowers,
    };
  }, [vendors, pendingVendors, getActiveVendors, getSuspendedVendors, getDeactivatedVendors, getDeletedVendors]);

  const isFollowingVendor = useCallback((vendorId: string): boolean => {
    const vendor = publicVendors.find(v => v.id === vendorId);
    return vendor?.isFollowing || false;
  }, [publicVendors]);

  const updateVendorStatus = useCallback(async (vendorId: string, status: VendorProfile['vendorStatus']) => {
    try {
      switch (status) {
        case 'suspended':
          return await suspend(vendorId);
        case 'active':
          return await activate(vendorId);
        case 'deleted':
          return await deleteProfile();
        case 'deactivated':
          return await closeShop();
        default:
          throw new Error(`Unsupported status: ${status}`);
      }
    } catch (error) {
      console.error(`Failed to update vendor status to ${status}:`, error);
      throw error;
    }
  }, [suspend, activate, deleteProfile, closeShop]);

  // Utility actions
  const selectVendor = useCallback((vendor: VendorProfile) => {
    dispatch(setSelectedVendor(vendor));
  }, [dispatch]);

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedVendor());
  }, [dispatch]);

  const clearVendorsErrors = useCallback(() => {
    dispatch(clearVendorsError());
  }, [dispatch]);

  const updateVendor = useCallback((vendorData: VendorProfile) => {
    dispatch(updateVendorInList(vendorData));
  }, [dispatch]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // State
    vendors,
    publicVendors,
    pendingVendors,
    selectedVendor,
    stats,
    loading,
    error,
    actionLoading,
    actionError,
    usersLoading,
    
    // New combined vendor actions
    fetchCombinedVendors,
    filterCombinedVendors,
    calculateCombinedStats,
    
    // Vendor actions
    submitKYC,
    closeShop,
    deleteProfile,
    suspend,
    activate,
    approveKYC,
    getPendingVendors,
    getVendor,
    reactivate,
    toggleFollow,
    getFollowedVendors,
    getAllVendors,
    
    // Helper functions
    getVendorById,
    getPublicVendorById,
    getVendorsByStatus,
    getActiveVendors,
    getSuspendedVendors,
    getDeletedVendors,
    getDeactivatedVendors,
    calculateStats,
    isFollowingVendor,
    updateVendorStatus,
    
    // Utility actions
    selectVendor,
    clearSelected,
    clearVendorsErrors,
    updateVendor,
  }), [
    // State dependencies
    vendors,
    publicVendors,
    pendingVendors,
    selectedVendor,
    stats,
    loading,
    error,
    actionLoading,
    actionError,
    usersLoading,
    
    // Combined vendor functions
    fetchCombinedVendors,
    filterCombinedVendors,
    calculateCombinedStats,
    
    // Vendor actions
    submitKYC,
    closeShop,
    deleteProfile,
    suspend,
    activate,
    approveKYC,
    getPendingVendors,
    getVendor,
    reactivate,
    toggleFollow,
    getFollowedVendors,
    getAllVendors,
    
    // Helper functions
    getVendorById,
    getPublicVendorById,
    getVendorsByStatus,
    getActiveVendors,
    getSuspendedVendors,
    getDeletedVendors,
    getDeactivatedVendors,
    calculateStats,
    isFollowingVendor,
    updateVendorStatus,
    
    // Utility actions
    selectVendor,
    clearSelected,
    clearVendorsErrors,
    updateVendor,
  ]);
}