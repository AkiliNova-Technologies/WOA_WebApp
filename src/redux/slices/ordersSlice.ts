import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  variant?: {
    id: string;
    name: string;
    value: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface BillingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  taxId?: string;
}

export interface PaymentInfo {
  method: 'card' | 'bank_transfer' | 'mobile_money' | 'cash_on_delivery' | 'wallet';
  transactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  paymentDate?: string;
  cardLast4?: string;
  bankName?: string;
  accountNumber?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: Order['status'];
  note?: string;
  updatedBy?: {
    id: string;
    name: string;
    type: 'admin' | 'system' | 'customer';
  };
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: BillingAddress;
  paymentInfo: PaymentInfo;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  status?: Order['status'];
  startDate?: string;
  endDate?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  averageOrderValue: number;
  itemsSold: number;
}

export interface AdminOrderStats {
  totalItemsOrdered: number;
  itemsChangePct: number;
  thisMonth: {
    items: number;
  };
  previousMonth: {
    items: number;
  };
  pendingOrders: number;
  pendingItems: number;
  pendingRevenue: number;
}

export interface AdminOrderLineItem {
  subOrderId: string;
  productId: string;
  name: string;
  image: string;
  orderDate: string;
  quantity: number;
  orderTotal: number;
  lineTotal: number;
  shipBy: string | null;
  status: 'paid' | 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  category: {
    id: string;
    name: string;
  };
  subcategory: {
    id: string;
    name: string;
  };
}

export interface AdminOrdersResponse {
  stats: AdminOrderStats;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  data: AdminOrderLineItem[];
}

export interface AdminOrdersParams {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  page?: number;
}

// Vendor Order Types - Updated to match actual API response
export interface VendorOrderItem {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImage?: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: 'pending' | 'ongoing' | 'completed' | 'returned' | 'unfulfilled' | 'failed';
  orderedOn: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  trackingNumber?: string;
}

export interface VendorPerProductStats {
  productId: string;
  productName: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface VendorOrderStats {
  totalOrders: number;
  ongoingOrders: number;
  completedOrders: number;
  returns: number;
  totalRevenue: number;
  pendingRevenue: number;
  completedRevenue: number;
  totalOrdersChange?: { trend: 'up' | 'down'; value: string };
  ongoingOrdersChange?: { trend: 'up' | 'down'; value: string };
  completedOrdersChange?: { trend: 'up' | 'down'; value: string };
  returnsChange?: { trend: 'up' | 'down'; value: string };
}

export interface VendorOrdersParams {
  search?: string;
  status?: VendorOrderItem['status'];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Actual API response structure
export interface VendorOrdersApiResponse {
  vendorId: string;
  totalOrders: number;
  totalRevenue: number;
  perProduct: VendorPerProductStats[];
  orders: VendorOrderItem[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface LowStockProduct {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  lowStockThreshold: number;
  alertSent: boolean;
  lastAlertSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  lowStockProducts: LowStockProduct[];
  filters: OrderFilters;
  stats: OrderStats | null;
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  adminData: {
    stats: AdminOrderStats | null;
    lineItems: AdminOrderLineItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    } | null;
    loading: boolean;
    error: string | null;
  };
  vendorData: {
    vendorId: string | null;
    stats: VendorOrderStats | null;
    perProduct: VendorPerProductStats[];
    orders: VendorOrderItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    } | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  lowStockProducts: [],
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  stats: null,
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  adminData: {
    stats: null,
    lineItems: [],
    pagination: null,
    loading: false,
    error: null,
  },
  vendorData: {
    vendorId: null,
    stats: null,
    perProduct: [],
    orders: [],
    pagination: null,
    loading: false,
    error: null,
  },
};

// Helper function to calculate vendor stats from orders
const calculateVendorStats = (orders: VendorOrderItem[], totalRevenue: number, totalOrders: number): VendorOrderStats => {
  const ongoingOrders = orders.filter(o => o.status === 'ongoing' || o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const returns = orders.filter(o => o.status === 'returned').length;
  
  const pendingRevenue = orders
    .filter(o => o.status === 'pending' || o.status === 'ongoing')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  
  const completedRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return {
    totalOrders: totalOrders || orders.length,
    ongoingOrders,
    completedOrders,
    returns,
    totalRevenue,
    pendingRevenue,
    completedRevenue,
  };
};

// Create new order with payment processing
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      variantId?: string;
    }>;
    shippingAddress: ShippingAddress;
    billingAddress?: BillingAddress;
    paymentMethod: PaymentInfo['method'];
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/orders', orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create order'
      );
    }
  }
);

// Get user orders with pagination
export const fetchOrders = createAsyncThunk(
  'orders/fetch',
  async (filters: OrderFilters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/orders', { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }
);

// Get order details
export const fetchOrder = createAsyncThunk(
  'orders/fetchOne',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch order'
      );
    }
  }
);

// Fetch admin orders
export const fetchAdminOrders = createAsyncThunk(
  'orders/fetchAdmin',
  async (params: AdminOrdersParams | undefined = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params?.subcategoryId) queryParams.append('subcategoryId', params.subcategoryId);
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const url = `/api/v1/admin/orders${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data as AdminOrdersResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch admin orders'
      );
    }
  }
);

// Fetch vendor orders - Updated to handle actual API response
export const fetchVendorOrders = createAsyncThunk(
  'orders/fetchVendor',
  async (params: { vendorId: string } & VendorOrdersParams, { rejectWithValue }) => {
    try {
      const { vendorId, ...queryParamsObj } = params;
      const queryParams = new URLSearchParams();
      
      if (queryParamsObj.search) queryParams.append('search', queryParamsObj.search);
      if (queryParamsObj.status) queryParams.append('status', queryParamsObj.status);
      if (queryParamsObj.startDate) queryParams.append('startDate', queryParamsObj.startDate);
      if (queryParamsObj.endDate) queryParams.append('endDate', queryParamsObj.endDate);
      if (queryParamsObj.page) queryParams.append('page', queryParamsObj.page.toString());
      if (queryParamsObj.limit) queryParams.append('limit', queryParamsObj.limit.toString());

      const queryString = queryParams.toString();
      const url = `/api/v1/vendor/orders/${vendorId}${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching vendor orders from:', url);
      const response = await api.get(url);
      console.log('Vendor orders API response:', response.data);
      
      return response.data as VendorOrdersApiResponse;
    } catch (error: any) {
      console.error('Fetch vendor orders error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch vendor orders'
      );
    }
  }
);

// Update order status (admin)
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async (data: { orderId: string; status: Order['status']; note?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/orders/${data.orderId}/status`, { 
        status: data.status, 
        note: data.note 
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update order status'
      );
    }
  }
);

// Update shipping info (admin)
export const updateShippingInfo = createAsyncThunk(
  'orders/updateShipping',
  async (data: {
    orderId: string;
    trackingNumber?: string;
    courier?: string;
    estimatedDelivery?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/orders/${data.orderId}/shipping`, {
        trackingNumber: data.trackingNumber,
        courier: data.courier,
        estimatedDelivery: data.estimatedDelivery,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update shipping info'
      );
    }
  }
);

// Cancel order (user or admin)
export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (data: { orderId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/orders/${data.orderId}/cancel`, { reason: data.reason });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel order'
      );
    }
  }
);

// Request refund (user)
export const requestRefund = createAsyncThunk(
  'orders/requestRefund',
  async (data: {
    orderId: string;
    reason: string;
    items?: Array<{ itemId: string; quantity: number; reason: string }>;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/orders/${data.orderId}/refund`, { 
        reason: data.reason, 
        items: data.items 
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to request refund'
      );
    }
  }
);

// Process refund (admin)
export const processRefund = createAsyncThunk(
  'orders/processRefund',
  async (data: {
    orderId: string;
    refundAmount: number;
    note?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/orders/${data.orderId}/process-refund`, { 
        refundAmount: data.refundAmount, 
        note: data.note 
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to process refund'
      );
    }
  }
);

// Update product low-stock alert threshold
export const updateLowStockThreshold = createAsyncThunk(
  'orders/updateLowStockThreshold',
  async (data: {
    productId: string;
    lowStockThreshold: number;
  }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/orders/products/${data.productId}/low-stock-threshold`, {
        lowStockThreshold: data.lowStockThreshold,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update low stock threshold'
      );
    }
  }
);

// Get low stock products
export const fetchLowStockProducts = createAsyncThunk(
  'orders/fetchLowStock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/orders/low-stock-alerts');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch low stock products'
      );
    }
  }
);

// Get order statistics
export const fetchOrderStats = createAsyncThunk(
  'orders/fetchStats',
  async (filters: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/orders/stats', { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch order statistics'
      );
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<Order>) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    setFilters: (state, action: PayloadAction<Partial<OrderFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
    },
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
    },
    clearAdminError: (state) => {
      state.adminData.error = null;
    },
    clearAdminData: (state) => {
      state.adminData = {
        stats: null,
        lineItems: [],
        pagination: null,
        loading: false,
        error: null,
      };
    },
    clearVendorError: (state) => {
      state.vendorData.error = null;
    },
    clearVendorData: (state) => {
      state.vendorData = {
        vendorId: null,
        stats: null,
        perProduct: [],
        orders: [],
        pagination: null,
        loading: false,
        error: null,
      };
    },
    updateOrderInList: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.selectedOrder?.id === action.payload.id) {
        state.selectedOrder = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createLoading = false;
        state.orders.unshift(action.payload);
        state.selectedOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })
      
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || action.payload;
        if (action.payload.pagination) {
          state.filters.page = action.payload.pagination.page;
          state.filters.limit = action.payload.pagination.limit;
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single order
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch admin orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.adminData.loading = true;
        state.adminData.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.adminData.loading = false;
        state.adminData.stats = action.payload.stats;
        state.adminData.lineItems = action.payload.data;
        state.adminData.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.adminData.loading = false;
        state.adminData.error = action.payload as string;
      })

      // Fetch vendor orders - Updated to handle actual API response
      .addCase(fetchVendorOrders.pending, (state) => {
        state.vendorData.loading = true;
        state.vendorData.error = null;
      })
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.vendorData.loading = false;
        
        const response = action.payload;
        
        // Store the vendorId
        state.vendorData.vendorId = response.vendorId;
        
        // Store orders array
        state.vendorData.orders = response.orders || [];
        
        // Store perProduct stats
        state.vendorData.perProduct = response.perProduct || [];
        
        // Calculate stats from the response
        state.vendorData.stats = calculateVendorStats(
          response.orders || [],
          response.totalRevenue || 0,
          response.totalOrders || 0
        );
        
        // Handle pagination if provided
        state.vendorData.pagination = response.pagination || {
          page: 1,
          pageSize: response.orders?.length || 10,
          total: response.totalOrders || 0,
        };
      })
      .addCase(fetchVendorOrders.rejected, (state, action) => {
        state.vendorData.loading = false;
        state.vendorData.error = action.payload as string;
      })
      
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        if (state.selectedOrder?.id === updatedOrder.id) {
          state.selectedOrder = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      
      // Update shipping info
      .addCase(updateShippingInfo.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateShippingInfo.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        if (state.selectedOrder?.id === updatedOrder.id) {
          state.selectedOrder = updatedOrder;
        }
      })
      .addCase(updateShippingInfo.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        if (state.selectedOrder?.id === updatedOrder.id) {
          state.selectedOrder = updatedOrder;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      
      // Update low stock threshold
      .addCase(updateLowStockThreshold.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateLowStockThreshold.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedProduct = action.payload;
        const index = state.lowStockProducts.findIndex(p => p.productId === updatedProduct.productId);
        if (index !== -1) {
          state.lowStockProducts[index] = updatedProduct;
        }
      })
      .addCase(updateLowStockThreshold.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      
      // Fetch low stock products
      .addCase(fetchLowStockProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockProducts = action.payload;
      })
      .addCase(fetchLowStockProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch order stats
      .addCase(fetchOrderStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
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
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state: { orders: OrdersState }) => state.orders.orders;
export const selectSelectedOrder = (state: { orders: OrdersState }) => state.orders.selectedOrder;
export const selectLowStockProducts = (state: { orders: OrdersState }) => state.orders.lowStockProducts;
export const selectOrderFilters = (state: { orders: OrdersState }) => state.orders.filters;
export const selectOrderStats = (state: { orders: OrdersState }) => state.orders.stats;
export const selectOrdersLoading = (state: { orders: OrdersState }) => state.orders.loading;
export const selectOrdersError = (state: { orders: OrdersState }) => state.orders.error;
export const selectCreateOrderLoading = (state: { orders: OrdersState }) => state.orders.createLoading;
export const selectCreateOrderError = (state: { orders: OrdersState }) => state.orders.createError;
export const selectUpdateOrderLoading = (state: { orders: OrdersState }) => state.orders.updateLoading;
export const selectUpdateOrderError = (state: { orders: OrdersState }) => state.orders.updateError;

// Admin selectors
export const selectAdminOrderStats = (state: { orders: OrdersState }) => state.orders.adminData.stats;
export const selectAdminOrderLineItems = (state: { orders: OrdersState }) => state.orders.adminData.lineItems;
export const selectAdminOrderPagination = (state: { orders: OrdersState }) => state.orders.adminData.pagination;
export const selectAdminOrdersLoading = (state: { orders: OrdersState }) => state.orders.adminData.loading;
export const selectAdminOrdersError = (state: { orders: OrdersState }) => state.orders.adminData.error;

// Vendor selectors
export const selectVendorOrderStats = (state: { orders: OrdersState }) => state.orders.vendorData.stats;
export const selectVendorOrders = (state: { orders: OrdersState }) => state.orders.vendorData.orders;
export const selectVendorPerProduct = (state: { orders: OrdersState }) => state.orders.vendorData.perProduct;
export const selectVendorOrderPagination = (state: { orders: OrdersState }) => state.orders.vendorData.pagination;
export const selectVendorOrdersLoading = (state: { orders: OrdersState }) => state.orders.vendorData.loading;
export const selectVendorOrdersError = (state: { orders: OrdersState }) => state.orders.vendorData.error;

export default ordersSlice.reducer;