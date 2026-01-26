import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  fetchAdminWishlist,
  fetchVendorWishlist,
  selectWishlistItems,
  selectWishlistLoading,
  selectWishlistError,
  selectAddingToWishlist,
  selectRemovingFromWishlist,
  selectAdminWishlistStats,
  selectAdminWishlistProducts,
  selectAdminWishlistPagination,
  selectAdminWishlistLoading,
  selectAdminWishlistError,
  selectVendorWishlistStats,
  selectVendorWishlistProducts,
  selectVendorWishlistPagination,
  selectVendorWishlistLoading,
  selectVendorWishlistError,
  clearWishlist,
  clearError as clearWishlistError,
  clearAdminError,
  clearAdminData,
  clearVendorError,
  clearVendorData,
  type WishlistItem,
  type AdminWishlistParams,
  type AdminWishlistStats,
  type AdminWishlistProduct,
  type VendorWishlistParams,
  type VendorWishlistStats,
  type VendorWishlistProduct,
} from '@/redux/slices/wishlistSlice';

export function useReduxWishlist() {
  const dispatch = useAppDispatch();

  // User wishlist selectors
  const items = useAppSelector(selectWishlistItems);
  const loading = useAppSelector(selectWishlistLoading);
  const error = useAppSelector(selectWishlistError);
  const adding = useAppSelector(selectAddingToWishlist);
  const removing = useAppSelector(selectRemovingFromWishlist);

  // Admin wishlist selectors
  const adminStats = useAppSelector(selectAdminWishlistStats);
  const adminProducts = useAppSelector(selectAdminWishlistProducts);
  const adminPagination = useAppSelector(selectAdminWishlistPagination);
  const adminLoading = useAppSelector(selectAdminWishlistLoading);
  const adminError = useAppSelector(selectAdminWishlistError);

  // Vendor wishlist selectors
  const vendorStats = useAppSelector(selectVendorWishlistStats);
  const vendorProducts = useAppSelector(selectVendorWishlistProducts);
  const vendorPagination = useAppSelector(selectVendorWishlistPagination);
  const vendorLoading = useAppSelector(selectVendorWishlistLoading);
  const vendorError = useAppSelector(selectVendorWishlistError);

  // User wishlist actions
  const getWishlist = useCallback(async () => {
    try {
      return await dispatch(fetchWishlist()).unwrap();
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      throw error;
    }
  }, [dispatch]);

  const addItem = useCallback(async (productId: string) => {
    try {
      return await dispatch(addToWishlist(productId)).unwrap();
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    }
  }, [dispatch]);

  const removeItem = useCallback(async (id: string) => {
    try {
      await dispatch(removeFromWishlist(id)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  }, [dispatch]);

  const moveItemToCart = useCallback(async (id: string) => {
    try {
      return await dispatch(moveToCart(id)).unwrap();
    } catch (error) {
      console.error('Failed to move item to cart:', error);
      throw error;
    }
  }, [dispatch]);

  // Admin wishlist actions
  const getAdminWishlist = useCallback(async (params?: AdminWishlistParams) => {
    try {
      return await dispatch(fetchAdminWishlist(params || {})).unwrap();
    } catch (error) {
      console.error('Failed to fetch admin wishlist:', error);
      throw error;
    }
  }, [dispatch]);

  // Vendor wishlist actions
  const getVendorWishlist = useCallback(async (vendorId: string, params?: VendorWishlistParams) => {
    try {
      return await dispatch(fetchVendorWishlist({ vendorId, ...params })).unwrap();
    } catch (error) {
      console.error('Failed to fetch vendor wishlist:', error);
      throw error;
    }
  }, [dispatch]);

  // Helper functions
  const isInWishlist = useCallback((productId: string): boolean => {
    return items.some(item => item.productId === productId);
  }, [items]);

  const getWishlistItem = useCallback((productId: string): WishlistItem | undefined => {
    return items.find(item => item.productId === productId);
  }, [items]);

  const getWishlistCount = useCallback((): number => {
    return items.length;
  }, [items]);

  const toggleWishlistItem = useCallback(async (productId: string): Promise<boolean> => {
    const existingItem = getWishlistItem(productId);
    if (existingItem) {
      await removeItem(existingItem.id);
      return false; // Item removed
    } else {
      await addItem(productId);
      return true; // Item added
    }
  }, [addItem, removeItem, getWishlistItem]);

  // Vendor helper functions
  const getVendorProductsByStatus = useCallback((status: VendorWishlistProduct["status"]): VendorWishlistProduct[] => {
    return vendorProducts.filter(product => product.status === status);
  }, [vendorProducts]);

  const getVendorInStockProducts = useCallback((): VendorWishlistProduct[] => {
    return vendorProducts.filter(product => product.status === "in-stock");
  }, [vendorProducts]);

  const getVendorLimitedStockProducts = useCallback((): VendorWishlistProduct[] => {
    return vendorProducts.filter(product => product.status === "limited-stock");
  }, [vendorProducts]);

  const getVendorOutOfStockProducts = useCallback((): VendorWishlistProduct[] => {
    return vendorProducts.filter(product => product.status === "out-of-stock");
  }, [vendorProducts]);

  const getVendorSuspendedProducts = useCallback((): VendorWishlistProduct[] => {
    return vendorProducts.filter(product => product.status === "suspended");
  }, [vendorProducts]);

  const getVendorTotalWishlists = useCallback((): number => {
    return vendorProducts.reduce((total, product) => total + product.wishlists, 0);
  }, [vendorProducts]);

  // Utility actions
  const clearAllItems = useCallback(() => {
    dispatch(clearWishlist());
  }, [dispatch]);

  const clearWishlistErrors = useCallback(() => {
    dispatch(clearWishlistError());
  }, [dispatch]);

  const clearAdminWishlistError = useCallback(() => {
    dispatch(clearAdminError());
  }, [dispatch]);

  const clearAdminWishlistData = useCallback(() => {
    dispatch(clearAdminData());
  }, [dispatch]);

  const clearVendorWishlistError = useCallback(() => {
    dispatch(clearVendorError());
  }, [dispatch]);

  const clearVendorWishlistData = useCallback(() => {
    dispatch(clearVendorData());
  }, [dispatch]);

  return {
    // User wishlist state
    items,
    loading,
    error,
    adding,
    removing,

    // User wishlist actions
    getWishlist,
    addItem,
    removeItem,
    moveItemToCart,

    // Helper functions
    isInWishlist,
    getWishlistItem,
    getWishlistCount,
    toggleWishlistItem,

    // User utility actions
    clearAllItems,
    clearWishlistErrors,

    // Admin wishlist state
    adminStats,
    adminProducts,
    adminPagination,
    adminLoading,
    adminError,

    // Admin wishlist actions
    getAdminWishlist,
    clearAdminWishlistError,
    clearAdminWishlistData,

    // Vendor wishlist state
    vendorStats,
    vendorProducts,
    vendorPagination,
    vendorLoading,
    vendorError,

    // Vendor wishlist actions
    getVendorWishlist,
    clearVendorWishlistError,
    clearVendorWishlistData,

    // Vendor helper functions
    getVendorProductsByStatus,
    getVendorInStockProducts,
    getVendorLimitedStockProducts,
    getVendorOutOfStockProducts,
    getVendorSuspendedProducts,
    getVendorTotalWishlists,
  };
}

// Export types for convenience
export type {
  WishlistItem,
  AdminWishlistParams,
  AdminWishlistStats,
  AdminWishlistProduct,
  VendorWishlistParams,
  VendorWishlistStats,
  VendorWishlistProduct,
};