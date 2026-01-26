import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  createOrder,
  fetchOrders,
  fetchOrder,
  fetchAdminOrders,
  fetchVendorOrders,
  updateOrderStatus,
  updateShippingInfo,
  cancelOrder,
  requestRefund,
  processRefund,
  updateLowStockThreshold,
  fetchLowStockProducts,
  fetchOrderStats,
  setSelectedOrder,
  clearSelectedOrder,
  setFilters,
  clearFilters,
  clearError,
  clearAdminError,
  clearAdminData,
  clearVendorError,
  clearVendorData,
  updateOrderInList,
  selectOrders,
  selectSelectedOrder,
  selectLowStockProducts,
  selectOrderFilters,
  selectOrderStats,
  selectOrdersLoading,
  selectOrdersError,
  selectCreateOrderLoading,
  selectCreateOrderError,
  selectUpdateOrderLoading,
  selectUpdateOrderError,
  selectAdminOrderStats,
  selectAdminOrderLineItems,
  selectAdminOrderPagination,
  selectAdminOrdersLoading,
  selectAdminOrdersError,
  selectVendorOrderStats,
  selectVendorOrders,
  selectVendorPerProduct,
  selectVendorOrderPagination,
  selectVendorOrdersLoading,
  selectVendorOrdersError,
  type Order,
  type OrderFilters,
  type OrderStats,
  type LowStockProduct,
  type ShippingAddress,
  type BillingAddress,
  type PaymentInfo,
  type AdminOrdersParams,
  type AdminOrderStats,
  type AdminOrderLineItem,
  type VendorOrdersParams,
  type VendorOrderStats,
  type VendorOrderItem,
  type VendorPerProductStats,
} from '@/redux/slices/ordersSlice';

export function useReduxOrders() {
  const dispatch = useAppDispatch();

  // User order selectors
  const orders = useAppSelector(selectOrders);
  const selectedOrder = useAppSelector(selectSelectedOrder);
  const lowStockProducts = useAppSelector(selectLowStockProducts);
  const filters = useAppSelector(selectOrderFilters);
  const stats = useAppSelector(selectOrderStats);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);
  const createLoading = useAppSelector(selectCreateOrderLoading);
  const createError = useAppSelector(selectCreateOrderError);
  const updateLoading = useAppSelector(selectUpdateOrderLoading);
  const updateError = useAppSelector(selectUpdateOrderError);

  // Admin order selectors
  const adminStats = useAppSelector(selectAdminOrderStats);
  const adminLineItems = useAppSelector(selectAdminOrderLineItems);
  const adminPagination = useAppSelector(selectAdminOrderPagination);
  const adminLoading = useAppSelector(selectAdminOrdersLoading);
  const adminError = useAppSelector(selectAdminOrdersError);

  // Vendor order selectors
  const vendorStats = useAppSelector(selectVendorOrderStats);
  const vendorOrders = useAppSelector(selectVendorOrders);
  const vendorPerProduct = useAppSelector(selectVendorPerProduct);
  const vendorPagination = useAppSelector(selectVendorOrderPagination);
  const vendorLoading = useAppSelector(selectVendorOrdersLoading);
  const vendorError = useAppSelector(selectVendorOrdersError);

  // Create new order
  const createNewOrder = useCallback(async (orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      variantId?: string;
    }>;
    shippingAddress: ShippingAddress;
    billingAddress?: BillingAddress;
    paymentMethod: PaymentInfo['method'];
    notes?: string;
  }) => {
    try {
      return await dispatch(createOrder(orderData)).unwrap();
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }, [dispatch]);

  // Get orders with filters
  const getOrders = useCallback(async (filters?: OrderFilters) => {
    try {
      return await dispatch(fetchOrders(filters || {})).unwrap();
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }, [dispatch]);

  // Get single order
  const getOrder = useCallback(async (orderId: string) => {
    try {
      return await dispatch(fetchOrder(orderId)).unwrap();
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw error;
    }
  }, [dispatch]);

  // Get admin orders
  const getAdminOrders = useCallback(async (params?: AdminOrdersParams) => {
    try {
      return await dispatch(fetchAdminOrders(params || {})).unwrap();
    } catch (error) {
      console.error('Failed to fetch admin orders:', error);
      throw error;
    }
  }, [dispatch]);

  // Get vendor orders
  const getVendorOrders = useCallback(async (vendorId: string, params?: VendorOrdersParams) => {
    try {
      return await dispatch(fetchVendorOrders({ vendorId, ...params })).unwrap();
    } catch (error) {
      console.error('Failed to fetch vendor orders:', error);
      throw error;
    }
  }, [dispatch]);

  // Update order status (admin)
  const updateStatus = useCallback(async (orderId: string, status: Order['status'], note?: string) => {
    try {
      return await dispatch(updateOrderStatus({ orderId, status, note })).unwrap();
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }, [dispatch]);

  // Update shipping info (admin)
  const updateShipping = useCallback(async (
    orderId: string,
    data: {
      trackingNumber?: string;
      courier?: string;
      estimatedDelivery?: string;
    }
  ) => {
    try {
      return await dispatch(updateShippingInfo({ orderId, ...data })).unwrap();
    } catch (error) {
      console.error('Failed to update shipping info:', error);
      throw error;
    }
  }, [dispatch]);

  // Cancel order
  const cancelExistingOrder = useCallback(async (orderId: string, reason?: string) => {
    try {
      return await dispatch(cancelOrder({ orderId, reason })).unwrap();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  }, [dispatch]);

  // Request refund (user)
  const requestOrderRefund = useCallback(async (
    orderId: string,
    reason: string,
    items?: Array<{ itemId: string; quantity: number; reason: string }>
  ) => {
    try {
      return await dispatch(requestRefund({ orderId, reason, items })).unwrap();
    } catch (error) {
      console.error('Failed to request refund:', error);
      throw error;
    }
  }, [dispatch]);

  // Process refund (admin)
  const processOrderRefund = useCallback(async (orderId: string, refundAmount: number, note?: string) => {
    try {
      return await dispatch(processRefund({ orderId, refundAmount, note })).unwrap();
    } catch (error) {
      console.error('Failed to process refund:', error);
      throw error;
    }
  }, [dispatch]);

  // Update low stock threshold
  const updateProductLowStockThreshold = useCallback(async (productId: string, lowStockThreshold: number) => {
    try {
      return await dispatch(updateLowStockThreshold({ productId, lowStockThreshold })).unwrap();
    } catch (error) {
      console.error('Failed to update low stock threshold:', error);
      throw error;
    }
  }, [dispatch]);

  // Get low stock products
  const getLowStockProducts = useCallback(async () => {
    try {
      return await dispatch(fetchLowStockProducts()).unwrap();
    } catch (error) {
      console.error('Failed to fetch low stock products:', error);
      throw error;
    }
  }, [dispatch]);

  // Get order statistics
  const getOrderStats = useCallback(async (dateRange?: { startDate?: string; endDate?: string }) => {
    try {
      return await dispatch(fetchOrderStats(dateRange || {})).unwrap();
    } catch (error) {
      console.error('Failed to fetch order stats:', error);
      throw error;
    }
  }, [dispatch]);

  // Helper functions
  const getOrderById = useCallback((id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  }, [orders]);

  const getOrdersByStatus = useCallback((status: Order['status']): Order[] => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getCustomerOrders = useCallback((customerId: string): Order[] => {
    return orders.filter(order => order.customer.id === customerId);
  }, [orders]);

  const getPendingOrders = useCallback((): Order[] => {
    return orders.filter(order => order.status === 'pending');
  }, [orders]);

  const getProcessingOrders = useCallback((): Order[] => {
    return orders.filter(order => order.status === 'processing');
  }, [orders]);

  const getShippedOrders = useCallback((): Order[] => {
    return orders.filter(order => order.status === 'shipped');
  }, [orders]);

  const getDeliveredOrders = useCallback((): Order[] => {
    return orders.filter(order => order.status === 'delivered');
  }, [orders]);

  const getCancelledOrders = useCallback((): Order[] => {
    return orders.filter(order => order.status === 'cancelled');
  }, [orders]);

  const getRefundedOrders = useCallback((): Order[] => {
    return orders.filter(order => order.status === 'refunded');
  }, [orders]);

  const getTotalRevenue = useCallback((): number => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  const getAverageOrderValue = useCallback((): number => {
    return orders.length > 0 ? getTotalRevenue() / orders.length : 0;
  }, [orders, getTotalRevenue]);

  const getItemsSold = useCallback((): number => {
    return orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  }, [orders]);

  const calculateStats = useCallback((): OrderStats => {
    const totalOrders = orders.length;
    const totalRevenue = getTotalRevenue();
    const pendingOrders = getPendingOrders().length;
    const processingOrders = getProcessingOrders().length;
    const shippedOrders = getShippedOrders().length;
    const deliveredOrders = getDeliveredOrders().length;
    const cancelledOrders = getCancelledOrders().length;
    const refundedOrders = getRefundedOrders().length;
    const averageOrderValue = getAverageOrderValue();
    const itemsSold = getItemsSold();

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      refundedOrders,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      itemsSold,
    };
  }, [
    orders,
    getTotalRevenue,
    getPendingOrders,
    getProcessingOrders,
    getShippedOrders,
    getDeliveredOrders,
    getCancelledOrders,
    getRefundedOrders,
    getAverageOrderValue,
    getItemsSold,
  ]);

  const isLowStock = useCallback((product: LowStockProduct): boolean => {
    return product.currentStock <= product.lowStockThreshold;
  }, []);

  const getCriticalLowStockProducts = useCallback((): LowStockProduct[] => {
    return lowStockProducts.filter(product => 
      product.currentStock <= Math.floor(product.lowStockThreshold * 0.5)
    );
  }, [lowStockProducts]);

  const getOutOfStockProducts = useCallback((): LowStockProduct[] => {
    return lowStockProducts.filter(product => product.currentStock === 0);
  }, [lowStockProducts]);

  // Vendor helper functions
  const getVendorOrdersByStatus = useCallback((status: VendorOrderItem['status']): VendorOrderItem[] => {
    return vendorOrders.filter(order => order.status === status);
  }, [vendorOrders]);

  const getVendorPendingOrders = useCallback((): VendorOrderItem[] => {
    return vendorOrders.filter(order => order.status === 'pending');
  }, [vendorOrders]);

  const getVendorOngoingOrders = useCallback((): VendorOrderItem[] => {
    return vendorOrders.filter(order => order.status === 'ongoing');
  }, [vendorOrders]);

  const getVendorCompletedOrders = useCallback((): VendorOrderItem[] => {
    return vendorOrders.filter(order => order.status === 'completed');
  }, [vendorOrders]);

  const getVendorReturnedOrders = useCallback((): VendorOrderItem[] => {
    return vendorOrders.filter(order => order.status === 'returned');
  }, [vendorOrders]);

  const getVendorUnfulfilledOrders = useCallback((): VendorOrderItem[] => {
    return vendorOrders.filter(order => order.status === 'unfulfilled' || order.status === 'failed');
  }, [vendorOrders]);

  // Utility actions
  const selectOrder = useCallback((order: Order) => {
    dispatch(setSelectedOrder(order));
  }, [dispatch]);

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedOrder());
  }, [dispatch]);

  const updateFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const clearOrdersErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearAdminOrdersError = useCallback(() => {
    dispatch(clearAdminError());
  }, [dispatch]);

  const clearAdminOrdersData = useCallback(() => {
    dispatch(clearAdminData());
  }, [dispatch]);

  const clearVendorOrdersError = useCallback(() => {
    dispatch(clearVendorError());
  }, [dispatch]);

  const clearVendorOrdersData = useCallback(() => {
    dispatch(clearVendorData());
  }, [dispatch]);

  const updateExistingOrder = useCallback((orderData: Order) => {
    dispatch(updateOrderInList(orderData));
  }, [dispatch]);

  return {
    // User orders state
    orders,
    selectedOrder,
    lowStockProducts,
    filters,
    stats,
    loading,
    error,
    createLoading,
    createError,
    updateLoading,
    updateError,
    
    // User order actions
    createNewOrder,
    getOrders,
    getOrder,
    updateStatus,
    updateShipping,
    cancelExistingOrder,
    requestOrderRefund,
    processOrderRefund,
    
    // Low stock actions
    updateProductLowStockThreshold,
    getLowStockProducts,
    
    // Stats actions
    getOrderStats,
    
    // Helper functions
    getOrderById,
    getOrdersByStatus,
    getCustomerOrders,
    getPendingOrders,
    getProcessingOrders,
    getShippedOrders,
    getDeliveredOrders,
    getCancelledOrders,
    getRefundedOrders,
    getTotalRevenue,
    getAverageOrderValue,
    getItemsSold,
    calculateStats,
    isLowStock,
    getCriticalLowStockProducts,
    getOutOfStockProducts,
    
    // Utility actions
    selectOrder,
    clearSelected,
    updateFilters,
    clearAllFilters,
    clearOrdersErrors,
    updateExistingOrder,

    // Admin orders state
    adminStats,
    adminLineItems,
    adminPagination,
    adminLoading,
    adminError,

    // Admin orders actions
    getAdminOrders,
    clearAdminOrdersError,
    clearAdminOrdersData,

    // Vendor orders state
    vendorStats,
    vendorOrders,
    vendorPerProduct,
    vendorPagination,
    vendorLoading,
    vendorError,

    // Vendor orders actions
    getVendorOrders,
    clearVendorOrdersError,
    clearVendorOrdersData,

    // Vendor helper functions
    getVendorOrdersByStatus,
    getVendorPendingOrders,
    getVendorOngoingOrders,
    getVendorCompletedOrders,
    getVendorReturnedOrders,
    getVendorUnfulfilledOrders,
  };
}

// Export types for convenience
export type {
  Order,
  OrderFilters,
  OrderStats,
  LowStockProduct,
  ShippingAddress,
  BillingAddress,
  PaymentInfo,
  AdminOrdersParams,
  AdminOrderStats,
  AdminOrderLineItem,
  VendorOrdersParams,
  VendorOrderStats,
  VendorOrderItem,
  VendorPerProductStats,
};