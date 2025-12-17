// hooks/useWishlist.ts
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  selectWishlistItems,
  selectWishlistLoading,
  selectWishlistError,
  selectAddingToWishlist,
  selectRemovingFromWishlist,
  clearWishlist,
  clearError as clearWishlistError,
  type WishlistItem,
} from '@/redux/slices/wishlistSlice';

export function useReduxWishlist() {
  const dispatch = useAppDispatch();

  // Selectors
  const items = useAppSelector(selectWishlistItems);
  const loading = useAppSelector(selectWishlistLoading);
  const error = useAppSelector(selectWishlistError);
  const adding = useAppSelector(selectAddingToWishlist);
  const removing = useAppSelector(selectRemovingFromWishlist);

  // Wishlist actions
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

  // Utility actions
  const clearAllItems = useCallback(() => {
    dispatch(clearWishlist());
  }, [dispatch]);

  const clearWishlistErrors = useCallback(() => {
    dispatch(clearWishlistError());
  }, [dispatch]);

  return {
    // State
    items,
    loading,
    error,
    adding,
    removing,
    
    // Wishlist actions
    getWishlist,
    addItem,
    removeItem,
    moveItemToCart,
    
    // Helper functions
    isInWishlist,
    getWishlistItem,
    getWishlistCount,
    toggleWishlistItem,
    
    // Utility actions
    clearAllItems,
    clearWishlistErrors,
  };
}