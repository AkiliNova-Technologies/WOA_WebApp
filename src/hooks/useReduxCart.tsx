import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  moveToWishlist,
  mergeCart,
  selectCart,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  selectCartLoading,
  selectCartError,
  selectCartUpdating,
  setCart,
  clearCart,
  clearError as clearCartError,
  updateCartItemQuantity,
  type CartItem,
} from '@/redux/slices/cartSlice';

export function useReduxCart() {
  const dispatch = useAppDispatch();

  // Selectors
  const cart = useAppSelector(selectCart);
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const itemCount = useAppSelector(selectCartItemCount);
  const loading = useAppSelector(selectCartLoading);
  const error = useAppSelector(selectCartError);
  const updating = useAppSelector(selectCartUpdating);

  // Cart actions
  const getCart = useCallback(async () => {
    try {
      return await dispatch(fetchCart()).unwrap();
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      throw error;
    }
  }, [dispatch]);

  const addItem = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      return await dispatch(addToCart({ productId, quantity })).unwrap();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  }, [dispatch]);

  const updateItem = useCallback(async (id: string, quantity: number) => {
    try {
      return await dispatch(updateCartItem({ id, quantity })).unwrap();
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  }, [dispatch]);

  const removeItem = useCallback(async (id: string) => {
    try {
      await dispatch(removeFromCart(id)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  }, [dispatch]);

  const moveItemToWishlist = useCallback(async (id: string) => {
    try {
      return await dispatch(moveToWishlist(id)).unwrap();
    } catch (error) {
      console.error('Failed to move item to wishlist:', error);
      throw error;
    }
  }, [dispatch]);

  const mergeCarts = useCallback(async () => {
    try {
      return await dispatch(mergeCart()).unwrap();
    } catch (error) {
      console.error('Failed to merge carts:', error);
      throw error;
    }
  }, [dispatch]);

  // Helper functions
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

  // Utility actions
  const setCurrentCart = useCallback((cartData: any) => {
    dispatch(setCart(cartData));
  }, [dispatch]);

  const clearCurrentCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const clearCartErrors = useCallback(() => {
    dispatch(clearCartError());
  }, [dispatch]);

  return {
    // State
    cart,
    items,
    total,
    itemCount,
    loading,
    error,
    updating,
    
    // Cart actions
    getCart,
    addItem,
    updateItem,
    removeItem,
    moveItemToWishlist,
    mergeCarts,
    
    // Helper functions
    getItem,
    getItemByProductId,
    isInCart,
    getItemQuantity,
    calculateSubtotal,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    
    // Utility actions
    setCurrentCart,
    clearCurrentCart,
    clearCartErrors,
  };
}