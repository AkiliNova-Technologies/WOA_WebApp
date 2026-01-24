import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  // User cart actions
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  changeCartItemVariant,
  moveToWishlist,
  mergeCart,
  
  // Admin cart actions
  fetchAllAdminCartItems,
  
  // User cart selectors
  selectCart,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  selectCartLoading,
  selectCartError,
  selectCartUpdating,
  
  // Admin cart selectors
  selectAdminCartItems,
  selectAdminCartStats,
  selectAdminCartLoading,
  selectAdminCartError,
  selectAdminCartItemCount,
  selectAdminCartTotalValue,
  
  // Actions
  setCart,
  clearCart,
  clearError as clearCartError,
  clearAdminError,
  updateCartItemQuantity,
  
  // Types
  type CartItem,
  type AdminCartItem,
} from '@/redux/slices/cartSlice';

export function useReduxCart() {
  const dispatch = useAppDispatch();

  // ==================== USER CART SELECTORS ====================
  const cart = useAppSelector(selectCart);
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const itemCount = useAppSelector(selectCartItemCount);
  const loading = useAppSelector(selectCartLoading);
  const error = useAppSelector(selectCartError);
  const updating = useAppSelector(selectCartUpdating);

  // ==================== ADMIN CART SELECTORS ====================
  const adminCartItems = useAppSelector(selectAdminCartItems);
  const adminCartStats = useAppSelector(selectAdminCartStats);
  const adminLoading = useAppSelector(selectAdminCartLoading);
  const adminError = useAppSelector(selectAdminCartError);
  const adminItemCount = useAppSelector(selectAdminCartItemCount);
  const adminTotalValue = useAppSelector(selectAdminCartTotalValue);

  // ==================== USER CART ACTIONS ====================

  // Get or create cart (guest or authenticated)
  const getCart = useCallback(async () => {
    try {
      return await dispatch(fetchCart()).unwrap();
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      throw error;
    }
  }, [dispatch]);

  // Add item to cart (guest or authenticated)
  const addItem = useCallback(async (
    productId: string, 
    quantity: number = 1,
    variantId?: string
  ) => {
    try {
      return await dispatch(addToCart({ productId, quantity, variantId })).unwrap();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  }, [dispatch]);

  // Update cart item quantity
  const updateItem = useCallback(async (id: string, quantity: number) => {
    try {
      return await dispatch(updateCartItem({ id, quantity })).unwrap();
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  }, [dispatch]);

  // Remove cart item
  const removeItem = useCallback(async (id: string) => {
    try {
      await dispatch(removeFromCart(id)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  }, [dispatch]);

  // Change cart item variant (e.g., change size or color)
  const changeItemVariant = useCallback(async (id: string, variantId: string) => {
    try {
      return await dispatch(changeCartItemVariant({ id, variantId })).unwrap();
    } catch (error) {
      console.error('Failed to change item variant:', error);
      throw error;
    }
  }, [dispatch]);

  // Move cart item to wishlist (auth required)
  const moveItemToWishlist = useCallback(async (id: string) => {
    try {
      return await dispatch(moveToWishlist(id)).unwrap();
    } catch (error) {
      console.error('Failed to move item to wishlist:', error);
      throw error;
    }
  }, [dispatch]);

  // Merge guest cart into user cart on login
  const mergeCarts = useCallback(async () => {
    try {
      return await dispatch(mergeCart()).unwrap();
    } catch (error) {
      console.error('Failed to merge carts:', error);
      throw error;
    }
  }, [dispatch]);

  // ==================== ADMIN CART ACTIONS ====================

  // List all cart items with product details (Admin)
  const getAllAdminCartItems = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      return await dispatch(fetchAllAdminCartItems(params)).unwrap();
    } catch (error) {
      console.error('Failed to fetch admin cart items:', error);
      throw error;
    }
  }, [dispatch]);

  // ==================== USER CART HELPER FUNCTIONS ====================

  const getItem = useCallback((id: string): CartItem | undefined => {
    return items.find(item => item.id === id);
  }, [items]);

  const getItemByProductId = useCallback((productId: string): CartItem | undefined => {
    return items.find(item => item.productId === productId);
  }, [items]);

  const isInCart = useCallback((productId: string): boolean => {
    return items.some(item => item.productId === productId);
  }, [items]);

  const getItemQuantity = useCallback((productId: string): number => {
    const item = getItemByProductId(productId);
    return item?.quantity || 0;
  }, [getItemByProductId]);

  const calculateSubtotal = useCallback((): number => {
    return items.reduce((sum, item) => {
      const price = item.salePrice || item.price;
      return sum + (price * item.quantity);
    }, 0);
  }, [items]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch(updateCartItemQuantity({ id, quantity }));
  }, [dispatch]);

  const incrementQuantity = useCallback(async (id: string) => {
    const item = getItem(id);
    if (item && item.quantity < item.product.stock) {
      return await updateItem(id, item.quantity + 1);
    }
    return null;
  }, [getItem, updateItem]);

  const decrementQuantity = useCallback(async (id: string) => {
    const item = getItem(id);
    if (item && item.quantity > 1) {
      return await updateItem(id, item.quantity - 1);
    }
    return null;
  }, [getItem, updateItem]);

  // ==================== ADMIN CART HELPER FUNCTIONS ====================

  const getAdminCartItem = useCallback((cartItemId: string): AdminCartItem | undefined => {
    return adminCartItems.find(item => item.cartItemId === cartItemId);
  }, [adminCartItems]);

  const calculateAdminSubtotal = useCallback((): number => {
    return adminCartItems.reduce((sum, item) => {
      // Use priceAtAdd, or fall back to variant price, or product basePrice
      const price = item.priceAtAdd ?? item.variant?.price ?? item.product?.basePrice ?? 0;
      return sum + (price * item.quantity);
    }, 0);
  }, [adminCartItems]);

  // ==================== UTILITY ACTIONS ====================

  const setCurrentCart = useCallback((cartData: any) => {
    dispatch(setCart(cartData));
  }, [dispatch]);

  const clearCurrentCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const clearCartErrors = useCallback(() => {
    dispatch(clearCartError());
  }, [dispatch]);

  const clearAdminCartErrors = useCallback(() => {
    dispatch(clearAdminError());
  }, [dispatch]);

  return {
    // ==================== USER CART STATE ====================
    cart,
    items,
    total,
    itemCount,
    loading,
    error,
    updating,
    
    // ==================== ADMIN CART STATE ====================
    adminCartItems,
    adminCartStats,
    adminLoading,
    adminError,
    adminItemCount,
    adminTotalValue,
    
    // ==================== USER CART ACTIONS ====================
    getCart,
    addItem,
    updateItem,
    removeItem,
    changeItemVariant,
    moveItemToWishlist,
    mergeCarts,
    
    // ==================== ADMIN CART ACTIONS ====================
    getAllAdminCartItems,
    
    // ==================== USER CART HELPER FUNCTIONS ====================
    getItem,
    getItemByProductId,
    isInCart,
    getItemQuantity,
    calculateSubtotal,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    
    // ==================== ADMIN CART HELPER FUNCTIONS ====================
    getAdminCartItem,
    calculateAdminSubtotal,
    
    // ==================== UTILITY ACTIONS ====================
    setCurrentCart,
    clearCurrentCart,
    clearCartErrors,
    clearAdminCartErrors,
  };
}

// Export types for convenience
export type { CartItem, AdminCartItem } from '@/redux/slices/cartSlice';