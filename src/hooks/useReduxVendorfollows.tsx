import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';
import { type RootState } from '@/redux/store';
import {
  fetchFollowingVendors,
  fetchFollowers,
  followVendor,
  unfollowVendor,
  fetchFollowerCount,
  checkIsFollowing,
  setFollowingVendors,
  setFollowers,
  clearFollowingVendors,
  clearFollowers,
  clearError,
  setIsFollowing,
  type Vendor,
} from '@/redux/slices/vendorFollowsSlice';

// Define the dispatch type that can handle thunks
export type AppThunkDispatch = ThunkDispatch<RootState, any, AnyAction>;

export const useVendorFollows = () => {
  const dispatch = useDispatch<AppThunkDispatch>();
  const {
    followingVendors,
    followers,
    loading,
    error,
    followingLoading,
    followerCounts,
    isFollowingMap,
  } = useSelector((state: RootState) => state.vendorFollows);

  return {
    // State
    followingVendors,
    followers,
    loading,
    error,
    followingLoading,
    followerCounts,
    isFollowingMap,

    // Actions - Following vendors
    getFollowingVendors: () => dispatch(fetchFollowingVendors()),
    
    // Actions - Followers (for vendor users)
    getFollowers: () => dispatch(fetchFollowers()),
    
    // Actions - Follow/Unfollow
    follow: (vendorId: string) => dispatch(followVendor(vendorId)),
    unfollow: (vendorId: string) => dispatch(unfollowVendor(vendorId)),
    
    // Actions - Follower count and status
    getFollowerCount: (vendorId: string) => dispatch(fetchFollowerCount(vendorId)),
    checkFollowingStatus: (vendorId: string) => dispatch(checkIsFollowing(vendorId)),
    
    // Manual state setters
    setFollowingVendors: (vendors: Vendor[]) => dispatch(setFollowingVendors(vendors)),
    setFollowers: (vendors: Vendor[]) => dispatch(setFollowers(vendors)),
    clearFollowingVendors: () => dispatch(clearFollowingVendors()),
    clearFollowers: () => dispatch(clearFollowers()),
    clearError: () => dispatch(clearError()),
    setFollowingStatus: (vendorId: string, isFollowing: boolean) => 
      dispatch(setIsFollowing({ vendorId, isFollowing })),

    // Helper methods
    isFollowing: (vendorId: string) => isFollowingMap[vendorId] || false,
    isFollowingLoading: (vendorId: string) => followingLoading[vendorId] || false,
    getFollowerCountForVendor: (vendorId: string) => followerCounts[vendorId] || 0,
    getVendorById: (vendorId: string) => 
      followingVendors.find(vendor => vendor.id === vendorId),
    
    // Check states
    hasFollowingVendors: followingVendors.length > 0,
    hasFollowers: followers.length > 0,
    followingCount: followingVendors.length,
    followersCount: followers.length,

    // Toggle follow/unfollow helper
    toggleFollow: async (vendorId: string) => {
      const isCurrentlyFollowing = isFollowingMap[vendorId] || false;
      if (isCurrentlyFollowing) {
        return dispatch(unfollowVendor(vendorId));
      } else {
        return dispatch(followVendor(vendorId));
      }
    },
  };
};