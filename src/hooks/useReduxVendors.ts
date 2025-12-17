// redux/hooks/useReduxVendors.ts
import { useCallback } from 'react';
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

export function useReduxVendors() {
  const dispatch = useAppDispatch();

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

  // Vendor KYC submission/update
  const submitKYC = useCallback(async (kycData: FormData | any) => {
    try {
      return await dispatch(submitVendorKYC(kycData)).unwrap();
    } catch (error) {
      console.error('Failed to submit KYC:', error);
      throw error;
    }
  }, [dispatch]);

  // Close own shop
  const closeShop = useCallback(async () => {
    try {
      return await dispatch(closeVendorShop()).unwrap();
    } catch (error) {
      console.error('Failed to close shop:', error);
      throw error;
    }
  }, [dispatch]);

  // Delete own vendor profile
  const deleteProfile = useCallback(async () => {
    try {
      return await dispatch(deleteVendorProfile()).unwrap();
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw error;
    }
  }, [dispatch]);

  // Admin: Suspend a vendor
  const suspend = useCallback(async (vendorId: string) => {
    try {
      return await dispatch(suspendVendor(vendorId)).unwrap();
    } catch (error) {
      console.error('Failed to suspend vendor:', error);
      throw error;
    }
  }, [dispatch]);

  // Admin: Activate a vendor
  const activate = useCallback(async (vendorId: string) => {
    try {
      return await dispatch(activateVendor(vendorId)).unwrap();
    } catch (error) {
      console.error('Failed to activate vendor:', error);
      throw error;
    }
  }, [dispatch]);

  // Admin: Approve vendor KYC
  const approveKYC = useCallback(async (vendorId: string) => {
    try {
      return await dispatch(approveVendorKYC(vendorId)).unwrap();
    } catch (error) {
      console.error('Failed to approve KYC:', error);
      throw error;
    }
  }, [dispatch]);

  // Admin: Get pending vendors
  const getPendingVendors = useCallback(async () => {
    try {
      return await dispatch(fetchPendingVendors()).unwrap();
    } catch (error) {
      console.error('Failed to fetch pending vendors:', error);
      throw error;
    }
  }, [dispatch]);

  // Get single vendor
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

  // Admin: Reactivate vendor
  const reactivate = useCallback(async (vendorId: string) => {
    try {
      return await dispatch(reactivateVendor(vendorId)).unwrap();
    } catch (error) {
      console.error('Failed to reactivate vendor:', error);
      throw error;
    }
  }, [dispatch]);

  // Follow/unfollow vendor
  const toggleFollow = useCallback(async (vendorId: string) => {
    try {
      return await dispatch(toggleFollowVendor(vendorId)).unwrap();
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      throw error;
    }
  }, [dispatch]);

  // Get followed vendors
  const getFollowedVendors = useCallback(async () => {
    try {
      return await dispatch(fetchFollowedVendors()).unwrap();
    } catch (error) {
      console.error('Failed to fetch followed vendors:', error);
      throw error;
    }
  }, [dispatch]);

  // Get all vendors (admin)
  const getAllVendors = useCallback(async () => {
    try {
      return await dispatch(fetchAllVendors()).unwrap();
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      throw error;
    }
  }, [dispatch]);

  // Helper functions
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

  return {
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
  };
}