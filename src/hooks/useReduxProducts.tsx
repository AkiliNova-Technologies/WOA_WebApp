import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  // Public Products
  fetchPublicProducts,
  fetchAllProducts,
  fetchPublicProduct,
  fetchRelatedProducts,
  
  // Search & Filtering
  searchProducts,
  fetchSearchFilters,
  fetchSearchSuggestions,
  
  // Recently Viewed
  trackProductView,
  fetchRecentlyViewedProducts,
  removeFromRecentlyViewed,
  
  // Vendor Products
  createProduct,
  fetchProduct,
  updateProduct,
  deleteProduct,
  submitForReview,
  uploadProductMedia,
  
  // New Additions
  softDeleteProduct,
  fetchProductReviews,
  fetchVendorReviews,
  
  // Selectors
  selectProducts,
  selectPublicProducts,
  selectAllProducts,
  selectSearchResults,
  selectRelatedProducts,
  selectRecentlyViewedProducts,
  selectProduct,
  selectProductReviews,
  selectVendorReviews,
  selectSearchSuggestions,
  selectAvailableFilters,
  selectProductsLoading,
  selectAllProductsLoading,
  selectSearchLoading,
  selectRecentlyViewedLoading,
  selectReviewsLoading,
  selectProductsError,
  selectCreateProductLoading,
  selectCreateProductError,
  selectProductsPagination,
  
  // Actions
  setProduct,
  clearProduct,
  clearError,
  clearProducts,
  clearPublicProducts,
  clearSearchResults,
  clearRelatedProducts,
  clearRecentlyViewedProducts,
  
  // Types
  type CreateProductData,
  type UpdateProductData,
  type ProductSearchParams,
  type ProductListParams,
  type RecentlyViewedParams,
  type Product,
} from '@/redux/slices/productsSlice';

export function useReduxProducts() {
  const dispatch = useAppDispatch();

  // ====================== SELECTORS ======================
  const products = useAppSelector(selectProducts);
  const publicProducts = useAppSelector(selectPublicProducts);
  const allProducts = useAppSelector(selectAllProducts); // New
  const searchResults = useAppSelector(selectSearchResults);
  const relatedProducts = useAppSelector(selectRelatedProducts);
  const recentlyViewedProducts = useAppSelector(selectRecentlyViewedProducts);
  const product = useAppSelector(selectProduct);
  const productReviews = useAppSelector(selectProductReviews); // New
  const vendorReviews = useAppSelector(selectVendorReviews); // New
  const searchSuggestions = useAppSelector(selectSearchSuggestions);
  const availableFilters = useAppSelector(selectAvailableFilters);
  const loading = useAppSelector(selectProductsLoading);
  const allProductsLoading = useAppSelector(selectAllProductsLoading); // New
  const searchLoading = useAppSelector(selectSearchLoading);
  const recentlyViewedLoading = useAppSelector(selectRecentlyViewedLoading);
  const reviewsLoading = useAppSelector(selectReviewsLoading); // New
  const error = useAppSelector(selectProductsError);
  const createLoading = useAppSelector(selectCreateProductLoading);
  const createError = useAppSelector(selectCreateProductError);
  const pagination = useAppSelector(selectProductsPagination);

  // ====================== PUBLIC PRODUCT LISTING ======================

  /**
   * Get public product listing with filtering and pagination
   * Displays variant prices, includes wishlist status (when authenticated)
   */
  const getPublicProducts = useCallback(async (params?: ProductListParams) => {
    try {
      return await dispatch(fetchPublicProducts(params || {})).unwrap();
    } catch (error) {
      console.error('Failed to fetch public products:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Get all products (any status) with filtering and pagination
   * For vendor/admin use only - requires authentication
   */
  const getAllProducts = useCallback(async (params?: ProductListParams & { 
    productTypeId?: string;
    sellerId?: string;
  }) => {
    try {
      return await dispatch(fetchAllProducts(params || {})).unwrap();
    } catch (error) {
      console.error('Failed to fetch all products:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Get single public product with reviews and ratings
   * Includes isInWishlist when user is authenticated
   */
  const getPublicProduct = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchPublicProduct(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch public product:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Get related products from same subcategory
   * Returns up to 10 products with ratings and wishlist status
   */
  const getRelatedProducts = useCallback(async (productId: string) => {
    try {
      return await dispatch(fetchRelatedProducts(productId)).unwrap();
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      throw error;
    }
  }, [dispatch]);

  // ====================== REVIEWS ======================

  /**
   * Get reviews for a specific product
   */
  const getProductReviews = useCallback(async (productId: string) => {
    try {
      return await dispatch(fetchProductReviews(productId)).unwrap();
    } catch (error) {
      console.error('Failed to fetch product reviews:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Get all reviews for a vendor's products
   */
  const getVendorReviews = useCallback(async (vendorId: string) => {
    try {
      return await dispatch(fetchVendorReviews(vendorId)).unwrap();
    } catch (error) {
      console.error('Failed to fetch vendor reviews:', error);
      throw error;
    }
  }, [dispatch]);

  // ====================== PRODUCT SEARCH & FILTERING ======================

  /**
   * Search products with keyword, filters, and sorting
   * Supports attribute filters, category filters, price sorting
   * Example: { q: 'backpack', filters: { color: 'blue' }, sort: 'price_asc' }
   */
  const searchProductsCatalog = useCallback(async (params: ProductSearchParams) => {
    try {
      return await dispatch(searchProducts(params)).unwrap();
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Get available filter options for search results
   * Returns attribute values available in matching products
   * Example: { filters: { color: ['blue', 'red'], size: ['M', 'L'] } }
   */
  const getSearchFilters = useCallback(async (params?: { q?: string; categoryId?: string }) => {
    try {
      return await dispatch(fetchSearchFilters(params || {})).unwrap();
    } catch (error) {
      console.error('Failed to fetch search filters:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Get search suggestions for autocomplete
   * Returns product types and products matching query
   * Minimum 3 characters required for results
   */
  const getSearchSuggestions = useCallback(async (q: string, limit?: number) => {
    try {
      return await dispatch(fetchSearchSuggestions({ q, limit })).unwrap();
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error);
      throw error;
    }
  }, [dispatch]);

  // ====================== RECENTLY VIEWED PRODUCTS ======================

  /**
   * Track that a user viewed a product
   * Silent endpoint - doesn't block UI on failure
   * Increments viewCount on repeat views
   */
  const trackView = useCallback(async (productId: string) => {
    try {
      return await dispatch(trackProductView(productId)).unwrap();
    } catch (error) {
      // Silently fail - tracking shouldn't block user experience
      console.error('Failed to track product view:', error);
    }
  }, [dispatch]);

  /**
   * Get recently viewed products with filtering and sorting
   * Supports price range, rating filters, and sorting by date/price/rating
   * Example: { sortBy: 'price', order: 'asc', minPrice: 100, maxPrice: 1000 }
   */
  const getRecentlyViewedProducts = useCallback(async (params?: RecentlyViewedParams) => {
    try {
      return await dispatch(fetchRecentlyViewedProducts(params || {})).unwrap();
    } catch (error) {
      console.error('Failed to fetch recently viewed products:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Remove a product from recently viewed history
   */
  const removeFromHistory = useCallback(async (productId: string) => {
    try {
      await dispatch(removeFromRecentlyViewed(productId)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to remove from recently viewed:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Clear all recently viewed products from state
   */
  const clearHistory = useCallback(() => {
    dispatch(clearRecentlyViewedProducts());
  }, [dispatch]);

  // ====================== VENDOR PRODUCT MANAGEMENT ======================

  /**
   * Create new product with base pricing and attributes
   * Automatically generates variants from attribute combinations
   * Example: { name: 'T-Shirt', basePrice: 29.99, attributes: { size: 'S,M,L', color: 'red,blue' } }
   */
  const createNewProduct = useCallback(async (productData: CreateProductData) => {
    try {
      return await dispatch(createProduct(productData)).unwrap();
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Get product by ID (vendor access)
   * Returns full product details with variants
   */
  const getProduct = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchProduct(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Update product details
   * Price increases on compareAtPrice are subject to 500% threshold rule
   * Status may change to RE_EVALUATION for admin review
   */
  const updateExistingProduct = useCallback(async (id: string, data: UpdateProductData) => {
    try {
      return await dispatch(updateProduct({ id, data })).unwrap();
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Delete a product permanently
   */
  const removeProduct = useCallback(async (id: string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Soft delete a product (status -> deleted)
   */
  const softDelete = useCallback(async (id: string) => {
    try {
      return await dispatch(softDeleteProduct(id)).unwrap();
    } catch (error) {
      console.error('Failed to soft delete product:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Submit product for admin approval
   * Changes status from draft to pending_approval
   */
  const submitProductForReview = useCallback(async (id: string) => {
    try {
      return await dispatch(submitForReview(id)).unwrap();
    } catch (error) {
      console.error('Failed to submit product for review:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Upload product image/media
   * Updates product images array
   */
  const uploadMedia = useCallback(async (id: string, file: File) => {
    try {
      return await dispatch(uploadProductMedia({ id, file })).unwrap();
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  }, [dispatch]);

  // ====================== HELPER FUNCTIONS ======================

  /**
   * Find product by ID in current products list
   */
  const getProductById = useCallback((id: string): Product | undefined => {
    return products.find(product => product.id === id);
  }, [products]);

  /**
   * Filter products by category
   */
  const getProductsByCategory = useCallback((categoryId: string): Product[] => {
    return publicProducts.filter(product => product.categoryId === categoryId);
  }, [publicProducts]);

  /**
   * Filter products by subcategory
   */
  const getProductsBySubcategory = useCallback((subcategoryId: string): Product[] => {
    return publicProducts.filter(product => product.subcategoryId === subcategoryId);
  }, [publicProducts]);

  /**
   * Filter products by seller
   */
  const getProductsBySeller = useCallback((sellerId: string): Product[] => {
    return publicProducts.filter(product => product.sellerId === sellerId);
  }, [publicProducts]);

  /**
   * Get products with minimum rating
   */
  const getProductsByMinRating = useCallback((minRating: number): Product[] => {
    return publicProducts.filter(product => product.averageRating >= minRating);
  }, [publicProducts]);

  /**
   * Get products in price range (uses variant prices)
   */
  const getProductsByPriceRange = useCallback((minPrice: number, maxPrice: number): Product[] => {
    return publicProducts.filter(
      product => product.price >= minPrice && product.price <= maxPrice
    );
  }, [publicProducts]);

  /**
   * Check if product is in recently viewed history
   */
  const isProductInHistory = useCallback((productId: string): boolean => {
    return recentlyViewedProducts.some(product => product.id === productId);
  }, [recentlyViewedProducts]);

  /**
   * Get count of recently viewed products
   */
  const getHistoryCount = useCallback((): number => {
    return recentlyViewedProducts.length;
  }, [recentlyViewedProducts]);

  /**
   * Check if product is in wishlist (from product data)
   */
  const isProductInWishlist = useCallback((productId: string): boolean => {
    const prod = publicProducts.find(p => p.id === productId);
    return prod?.isInWishlist || false;
  }, [publicProducts]);

  /**
   * Get products with active variants only
   */
  const getProductsWithStock = useCallback((): Product[] => {
    return publicProducts.filter(product => 
      product.variants.some(v => v.isActive && v.stockQuantity > 0)
    );
  }, [publicProducts]);

  /**
   * Calculate total products in search results
   */
  const getSearchResultsCount = useCallback((): number => {
    return searchResults.length;
  }, [searchResults]);

  /**
   * Get products by status (for vendor dashboard)
   */
  const getProductsByStatus = useCallback((status: Product['status']): Product[] => {
    return allProducts.filter(product => product.status === status);
  }, [allProducts]);

  /**
   * Get products that need review/approval (for admin)
   */
  const getProductsNeedingReview = useCallback((): Product[] => {
    return allProducts.filter(product => 
      ['pending_approval', 'RE_EVALUATION'].includes(product.status)
    );
  }, [allProducts]);

  /**
   * Get approved products from all products list
   */
  const getApprovedProductsFromAll = useCallback((): Product[] => {
    return allProducts.filter(product => product.status === 'approved');
  }, [allProducts]);

  /**
   * Get draft products for vendor
   */
  const getDraftProducts = useCallback((): Product[] => {
    return allProducts.filter(product => product.status === 'draft');
  }, [allProducts]);

  /**
   * Get deleted products (soft-deleted)
   */
  const getDeletedProducts = useCallback((): Product[] => {
    return allProducts.filter(product => product.status === 'deleted');
  }, [allProducts]);

  // ====================== UTILITY ACTIONS ======================

  /**
   * Set current product in state
   */
  const setCurrentProduct = useCallback((productData: Product) => {
    dispatch(setProduct(productData));
  }, [dispatch]);

  /**
   * Clear current product from state
   */
  const clearCurrentProduct = useCallback(() => {
    dispatch(clearProduct());
  }, [dispatch]);

  /**
   * Clear all error messages
   */
  const clearProductsErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Clear all products from state
   */
  const clearAllProducts = useCallback(() => {
    dispatch(clearProducts());
  }, [dispatch]);

  /**
   * Clear public products list
   */
  const clearPublicProductsList = useCallback(() => {
    dispatch(clearPublicProducts());
  }, [dispatch]);

  /**
   * Clear all products (vendor/admin) list
   */
  const clearAllProductsList = useCallback(() => {
    // Note: You might need to add this action to your slice
    // For now, we'll use clearProducts as it clears everything
    dispatch(clearProducts());
  }, [dispatch]);

  /**
   * Clear search results
   */
  const clearSearchResultsList = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  /**
   * Clear related products list
   */
  const clearRelatedProductsList = useCallback(() => {
    dispatch(clearRelatedProducts());
  }, [dispatch]);

  return {
    // ====================== STATE ======================
    products,
    publicProducts,
    allProducts, // New
    searchResults,
    relatedProducts,
    recentlyViewedProducts,
    product,
    productReviews, // New
    vendorReviews, // New
    searchSuggestions,
    availableFilters,
    loading,
    allProductsLoading, // New
    searchLoading,
    recentlyViewedLoading,
    reviewsLoading, // New
    error,
    createLoading,
    createError,
    pagination,
    
    // ====================== PUBLIC PRODUCTS ======================
    getPublicProducts,
    getAllProducts, // New
    getPublicProduct,
    getRelatedProducts,
    
    // ====================== REVIEWS ======================
    getProductReviews, // New
    getVendorReviews, // New
    
    // ====================== SEARCH & FILTERING ======================
    searchProductsCatalog,
    getSearchFilters,
    getSearchSuggestions,
    
    // ====================== RECENTLY VIEWED ======================
    trackView,
    getRecentlyViewedProducts,
    removeFromHistory,
    clearHistory,
    
    // ====================== VENDOR PRODUCTS ======================
    createNewProduct,
    getProduct,
    updateExistingProduct,
    removeProduct,
    softDelete, // New
    submitProductForReview,
    uploadMedia,
    
    // ====================== HELPER FUNCTIONS ======================
    getProductById,
    getProductsByCategory,
    getProductsBySubcategory,
    getProductsBySeller,
    getProductsByMinRating,
    getProductsByPriceRange,
    isProductInHistory,
    getHistoryCount,
    isProductInWishlist,
    getProductsWithStock,
    getSearchResultsCount,
    getProductsByStatus,
    getProductsNeedingReview, // New
    getApprovedProductsFromAll, // New
    getDraftProducts, // New
    getDeletedProducts, // New
    
    // ====================== UTILITY ACTIONS ======================
    setCurrentProduct,
    clearCurrentProduct,
    clearProductsErrors,
    clearAllProducts,
    clearPublicProductsList,
    clearAllProductsList, // New
    clearSearchResultsList,
    clearRelatedProductsList,
  };
}

// Export types for convenience
export type {
  CreateProductData,
  UpdateProductData,
  ProductSearchParams,
  ProductListParams,
  RecentlyViewedParams,
  Product,
  ProductImage,
  ProductVariant,
  Seller,
  Category,
  SubCategory,
  ProductType,
  PaginatedResponse,
  SearchSuggestion,
  AvailableFilters,
} from '@/redux/slices/productsSlice';