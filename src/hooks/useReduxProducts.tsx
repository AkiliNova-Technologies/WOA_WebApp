import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  // Product Creation
  createProduct,

  // Public Products
  fetchPublicProducts,
  fetchVendorPublicProducts,
  fetchAllProducts,

  // Recently Viewed
  trackProductView,
  removeFromRecentlyViewed,
  fetchRecentlyViewedProducts,

  // Single Product
  fetchProduct,
  fetchPublicProduct,
  updateProduct,
  submitForReview,
  fetchRelatedProducts,

  // Reviews
  fetchProductReviews,
  fetchVendorReviews,

  // Delete
  softDeleteProduct,
  deleteProduct,

  // Admin
  fetchAdminProductDetail,
  reviewProduct,

  // Search & Filtering
  searchProducts,
  fetchSearchFilters,
  fetchSearchSuggestions,

  // Our Picks
  fetchOurPicks,

  // Media
  uploadProductMedia,

  // Selectors
  selectProducts,
  selectPublicProducts,
  selectVendorProducts,
  selectAllProducts,
  selectOurPicksProducts,
  selectSearchResults,
  selectRelatedProducts,
  selectRecentlyViewedProducts,
  selectProduct,
  selectAdminProductDetail,
  selectProductReviews,
  selectVendorReviews,
  selectSearchSuggestions,
  selectAvailableFilters,
  selectProductsLoading,
  selectSearchLoading,
  selectRecentlyViewedLoading,
  selectAllProductsLoading,
  selectReviewsLoading,
  selectAdminLoading,
  selectOurPicksLoading,
  selectVendorProductsLoading,
  selectCreateProductLoading,
  selectProductsError,
  selectCreateProductError,
  selectAdminError,
  selectProductsPagination,

  // Actions
  setProduct,
  clearProduct,
  clearAdminProductDetail,
  clearError,
  clearProducts,
  clearAllProducts,
  clearPublicProducts,
  clearVendorProducts,
  clearSearchResults,
  clearRelatedProducts,
  clearRecentlyViewedProducts,
  clearOurPicks,

  // Types
  type CreateProductData,
  type UpdateProductData,
  type ProductSearchParams,
  type ProductListParams,
  type RecentlyViewedParams,
  type AdminReviewData,
  type Product,
} from "@/redux/slices/productsSlice";

export function useReduxProducts() {
  const dispatch = useAppDispatch();

  // ====================== SELECTORS ======================
  const products = useAppSelector(selectProducts);
  const publicProducts = useAppSelector(selectPublicProducts);
  const vendorProducts = useAppSelector(selectVendorProducts);
  const allProducts = useAppSelector(selectAllProducts);
  const ourPicksProducts = useAppSelector(selectOurPicksProducts);
  const searchResults = useAppSelector(selectSearchResults);
  const relatedProducts = useAppSelector(selectRelatedProducts);
  const recentlyViewedProducts = useAppSelector(selectRecentlyViewedProducts);
  const product = useAppSelector(selectProduct);
  const adminProductDetail = useAppSelector(selectAdminProductDetail);
  const productReviews = useAppSelector(selectProductReviews);
  const vendorReviews = useAppSelector(selectVendorReviews);
  const searchSuggestions = useAppSelector(selectSearchSuggestions);
  const availableFilters = useAppSelector(selectAvailableFilters);

  // Loading states
  const loading = useAppSelector(selectProductsLoading);
  const searchLoading = useAppSelector(selectSearchLoading);
  const recentlyViewedLoading = useAppSelector(selectRecentlyViewedLoading);
  const allProductsLoading = useAppSelector(selectAllProductsLoading);
  const reviewsLoading = useAppSelector(selectReviewsLoading);
  const adminLoading = useAppSelector(selectAdminLoading);
  const ourPicksLoading = useAppSelector(selectOurPicksLoading);
  const vendorProductsLoading = useAppSelector(selectVendorProductsLoading);
  const createLoading = useAppSelector(selectCreateProductLoading);

  // Error states
  const error = useAppSelector(selectProductsError);
  const createError = useAppSelector(selectCreateProductError);
  const adminError = useAppSelector(selectAdminError);

  // Pagination
  const pagination = useAppSelector(selectProductsPagination);

  // ====================== PRODUCT CREATION ======================

  /**
   * POST /api/v1/products/create
   * Create new product with base pricing and attributes
   */
  const createNewProduct = useCallback(
    async (productData: CreateProductData) => {
      try {
        return await dispatch(createProduct(productData)).unwrap();
      } catch (error) {
        console.error("Failed to create product:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // ====================== PUBLIC PRODUCT LISTING ======================

  /**
   * GET /api/v1/products/approved
   * List approved products with pagination
   */
  const getPublicProducts = useCallback(
    async (params?: ProductListParams) => {
      try {
        return await dispatch(fetchPublicProducts(params || {})).unwrap();
      } catch (error) {
        console.error("Failed to fetch public products:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * GET /api/v1/products/vendor/{vendorId}
   * List approved products for a vendor (public)
   */
  const getVendorPublicProducts = useCallback(
    async (vendorId: string, params?: ProductListParams) => {
      try {
        return await dispatch(fetchVendorPublicProducts({ vendorId, params })).unwrap();
      } catch (error) {
        console.error("Failed to fetch vendor products:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * GET /api/v1/products/all
   * List all products (any status) with optional filtering and pagination
   * For vendor/admin use only - requires authentication
   */
  const getAllProducts = useCallback(
    async (
      params?: ProductListParams & {
        productTypeId?: string;
        sellerId?: string;
        status?: string;
      }
    ) => {
      try {
        return await dispatch(fetchAllProducts(params || {})).unwrap();
      } catch (error) {
        console.error("Failed to fetch all products:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // ====================== RECENTLY VIEWED PRODUCTS ======================

  /**
   * POST /api/v1/products/recently-viewed/{productId}
   * Track that a user viewed a product
   */
  const trackView = useCallback(
    async (productId: string) => {
      try {
        return await dispatch(trackProductView(productId)).unwrap();
      } catch (error) {
        // Silently fail - tracking shouldn't block user experience
        console.error("Failed to track product view:", error);
      }
    },
    [dispatch]
  );

  /**
   * DELETE /api/v1/products/recently-viewed/{productId}
   * Remove a product from recently viewed history
   */
  const removeFromHistory = useCallback(
    async (productId: string) => {
      try {
        await dispatch(removeFromRecentlyViewed(productId)).unwrap();
        return true;
      } catch (error) {
        console.error("Failed to remove from recently viewed:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * GET /api/v1/products/recently-viewed
   * Get recently viewed products with filtering and sorting
   */
  const getRecentlyViewedProducts = useCallback(
    async (params?: RecentlyViewedParams) => {
      try {
        return await dispatch(fetchRecentlyViewedProducts(params || {})).unwrap();
      } catch (error) {
        console.error("Failed to fetch recently viewed products:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // ====================== SINGLE PRODUCT ======================

  /**
   * GET /api/v1/products/{id}
   * Get public product details by ID
   */
  const getProduct = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchProduct(id)).unwrap();
      } catch (error) {
        console.error("Failed to fetch product:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * GET /api/v1/products/{id}
   * Alias for getProduct - Get single public product
   */
  const getPublicProduct = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchPublicProduct(id)).unwrap();
      } catch (error) {
        console.error("Failed to fetch public product:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * PATCH /api/v1/products/{id}
   * Update product details
   */
  const updateExistingProduct = useCallback(
    async (id: string, data: UpdateProductData) => {
      try {
        return await dispatch(updateProduct({ id, data })).unwrap();
      } catch (error) {
        console.error("Failed to update product:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * POST /api/v1/products/{id}/submit-for-review
   * Submit product for admin approval
   */
  const submitProductForReview = useCallback(
    async (id: string) => {
      try {
        return await dispatch(submitForReview(id)).unwrap();
      } catch (error) {
        console.error("Failed to submit product for review:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * GET /api/v1/products/{productId}/related
   * Get related products for a given product
   */
  const getRelatedProducts = useCallback(
    async (productId: string) => {
      try {
        return await dispatch(fetchRelatedProducts(productId)).unwrap();
      } catch (error) {
        console.error("Failed to fetch related products:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // ====================== REVIEWS ======================

  /**
   * GET /api/v1/products/{productId}/reviews
   * Get reviews for a specific product
   */
  const getProductReviews = useCallback(
    async (productId: string) => {
      try {
        return await dispatch(fetchProductReviews(productId)).unwrap();
      } catch (error) {
        console.error("Failed to fetch product reviews:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * GET /api/v1/products/vendor/{vendorId}/reviews
   * Get all reviews for a vendor's products
   */
  const getVendorReviews = useCallback(
    async (vendorId: string) => {
      try {
        return await dispatch(fetchVendorReviews(vendorId)).unwrap();
      } catch (error) {
        console.error("Failed to fetch vendor reviews:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // ====================== DELETE ======================

  /**
   * PATCH /api/v1/product/status/delete/{id}
   * Soft delete a product (status -> deleted)
   */
  const softDelete = useCallback(
    async (id: string) => {
      try {
        return await dispatch(softDeleteProduct(id)).unwrap();
      } catch (error) {
        console.error("Failed to soft delete product:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * DELETE /api/v1/products/{id}
   * Hard delete a product permanently
   */
  const removeProduct = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        return true;
      } catch (error) {
        console.error("Failed to delete product:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // ====================== ADMIN PRODUCT MANAGEMENT ======================

  /**
   * GET /api/v1/admin/products/{id}
   * Get detailed product info for admin review
   */
  const getAdminProductDetail = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchAdminProductDetail(id)).unwrap();
      } catch (error) {
        console.error("Failed to fetch admin product detail:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * POST /api/v1/admin/products/{id}/review
   * Review and update product status (approve/reject/re-evaluate)
   */
  const adminReviewProduct = useCallback(
    async (id: string, data: AdminReviewData) => {
      try {
        return await dispatch(reviewProduct({ id, data })).unwrap();
      } catch (error) {
        console.error("Failed to review product:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // ====================== SEARCH & FILTERING ======================

  /**
   * GET /api/v1/public/products/search
   * Search public products with keyword, filters, and sorting
   */
  const searchProductsCatalog = useCallback(
    async (params: ProductSearchParams) => {
      try {
        return await dispatch(searchProducts(params)).unwrap();
      } catch (error) {
        console.error("Failed to search products:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * GET /api/v1/public/search/filters
   * Get available filter options for products
   */
  const getSearchFilters = useCallback(
    async (params?: { q?: string; categoryId?: string }) => {
      try {
        return await dispatch(fetchSearchFilters(params || {})).unwrap();
      } catch (error) {
        console.error("Failed to fetch search filters:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * GET /api/v1/public/search/suggestions
   * Get search suggestions for products and product types
   */
  const getSearchSuggestions = useCallback(
    async (q: string, limit?: number) => {
      try {
        return await dispatch(fetchSearchSuggestions({ q, limit })).unwrap();
      } catch (error) {
        console.error("Failed to fetch search suggestions:", error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * GET /api/v1/public/products/our-picks
   * Get personalized product recommendations ("Our Picks")
   */
  const getOurPicks = useCallback(
    async (params?: { page?: number; limit?: number }) => {
      try {
        return await dispatch(fetchOurPicks(params || {})).unwrap();
      } catch (error) {
        console.error("Failed to fetch our picks:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // ====================== MEDIA ======================

  /**
   * Upload product image/media
   */
  const uploadMedia = useCallback(
    async (id: string, file: File) => {
      try {
        return await dispatch(uploadProductMedia({ id, file })).unwrap();
      } catch (error) {
        console.error("Failed to upload media:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // ====================== HELPER FUNCTIONS ======================

  /**
   * Find product by ID in current products list
   */
  const getProductById = useCallback(
    (id: string): Product | undefined => {
      return products.find((product) => product.id === id);
    },
    [products]
  );

  /**
   * Filter products by category
   */
  const getProductsByCategory = useCallback(
    (categoryId: string): Product[] => {
      return publicProducts.filter((product) => product.categoryId === categoryId);
    },
    [publicProducts]
  );

  /**
   * Filter products by subcategory
   */
  const getProductsBySubcategory = useCallback(
    (subcategoryId: string): Product[] => {
      return publicProducts.filter((product) => product.subcategoryId === subcategoryId);
    },
    [publicProducts]
  );

  /**
   * Filter products by seller
   */
  const getProductsBySeller = useCallback(
    (sellerId: string): Product[] => {
      return publicProducts.filter((product) => product.sellerId === sellerId);
    },
    [publicProducts]
  );

  /**
   * Get products with minimum rating
   */
  const getProductsByMinRating = useCallback(
    (minRating: number): Product[] => {
      return publicProducts.filter((product) => (product.averageRating ?? 0) >= minRating);
    },
    [publicProducts]
  );

  /**
   * Get products in price range
   */
  const getProductsByPriceRange = useCallback(
    (minPrice: number, maxPrice: number): Product[] => {
      return publicProducts.filter(
        (product) => product.price >= minPrice && product.price <= maxPrice
      );
    },
    [publicProducts]
  );

  /**
   * Check if product is in recently viewed history
   */
  const isProductInHistory = useCallback(
    (productId: string): boolean => {
      return recentlyViewedProducts.some((product) => product.id === productId);
    },
    [recentlyViewedProducts]
  );

  /**
   * Get count of recently viewed products
   */
  const getHistoryCount = useCallback((): number => {
    return recentlyViewedProducts.length;
  }, [recentlyViewedProducts]);

  /**
   * Check if product is in wishlist
   */
  const isProductInWishlist = useCallback(
    (productId: string): boolean => {
      const prod = publicProducts.find((p) => p.id === productId);
      return prod?.isInWishlist || false;
    },
    [publicProducts]
  );

  /**
   * Get products with stock available
   */
  const getProductsWithStock = useCallback((): Product[] => {
    return publicProducts.filter((product) =>
      product.variants.some((v) => v.isActive && v.stockQuantity > 0)
    );
  }, [publicProducts]);

  /**
   * Get search results count
   */
  const getSearchResultsCount = useCallback((): number => {
    return searchResults.length;
  }, [searchResults]);

  /**
   * Get products by status
   */
  const getProductsByStatus = useCallback(
    (status: Product["status"]): Product[] => {
      return allProducts.filter((product) => product.status === status);
    },
    [allProducts]
  );

  /**
   * Get products needing review (for admin)
   */
  const getProductsNeedingReview = useCallback((): Product[] => {
    return allProducts.filter((product) =>
      ["pending_approval", "RE_EVALUATION"].includes(product.status)
    );
  }, [allProducts]);

  /**
   * Get approved products from all products list
   */
  const getApprovedProductsFromAll = useCallback((): Product[] => {
    return allProducts.filter((product) => product.status === "approved");
  }, [allProducts]);

  /**
   * Get draft products
   */
  const getDraftProducts = useCallback((): Product[] => {
    return allProducts.filter((product) => product.status === "draft");
  }, [allProducts]);

  /**
   * Get soft-deleted products
   */
  const getDeletedProducts = useCallback((): Product[] => {
    return allProducts.filter((product) => product.status === "deleted");
  }, [allProducts]);

  // ====================== UTILITY ACTIONS ======================

  /**
   * Set current product in state
   */
  const setCurrentProduct = useCallback(
    (productData: Product) => {
      dispatch(setProduct(productData));
    },
    [dispatch]
  );

  /**
   * Clear current product from state
   */
  const clearCurrentProduct = useCallback(() => {
    dispatch(clearProduct());
  }, [dispatch]);

  /**
   * Clear admin product detail from state
   */
  const clearAdminProduct = useCallback(() => {
    dispatch(clearAdminProductDetail());
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
  const clearAllProductsData = useCallback(() => {
    dispatch(clearProducts());
  }, [dispatch]);

  /**
   * Clear all products list
   */
  const clearAllProductsList = useCallback(() => {
    dispatch(clearAllProducts());
  }, [dispatch]);

  /**
   * Clear public products list
   */
  const clearPublicProductsList = useCallback(() => {
    dispatch(clearPublicProducts());
  }, [dispatch]);

  /**
   * Clear vendor products list
   */
  const clearVendorProductsList = useCallback(() => {
    dispatch(clearVendorProducts());
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

  /**
   * Clear recently viewed products
   */
  const clearHistory = useCallback(() => {
    dispatch(clearRecentlyViewedProducts());
  }, [dispatch]);

  /**
   * Clear our picks products
   */
  const clearOurPicksList = useCallback(() => {
    dispatch(clearOurPicks());
  }, [dispatch]);

  return {
    // ====================== STATE ======================
    products,
    publicProducts,
    vendorProducts,
    allProducts,
    ourPicksProducts,
    searchResults,
    relatedProducts,
    recentlyViewedProducts,
    product,
    adminProductDetail,
    productReviews,
    vendorReviews,
    searchSuggestions,
    availableFilters,

    // Loading states
    loading,
    searchLoading,
    recentlyViewedLoading,
    allProductsLoading,
    reviewsLoading,
    adminLoading,
    ourPicksLoading,
    vendorProductsLoading,
    createLoading,

    // Error states
    error,
    createError,
    adminError,

    // Pagination
    pagination,

    // ====================== PRODUCT CREATION ======================
    createNewProduct,

    // ====================== PUBLIC PRODUCTS ======================
    getPublicProducts,
    getVendorPublicProducts,
    getAllProducts,

    // ====================== RECENTLY VIEWED ======================
    trackView,
    removeFromHistory,
    getRecentlyViewedProducts,

    // ====================== SINGLE PRODUCT ======================
    getProduct,
    getPublicProduct,
    updateExistingProduct,
    submitProductForReview,
    getRelatedProducts,

    // ====================== REVIEWS ======================
    getProductReviews,
    getVendorReviews,

    // ====================== DELETE ======================
    softDelete,
    removeProduct,

    // ====================== ADMIN ======================
    getAdminProductDetail,
    adminReviewProduct,

    // ====================== SEARCH & FILTERING ======================
    searchProductsCatalog,
    getSearchFilters,
    getSearchSuggestions,
    getOurPicks,

    // ====================== MEDIA ======================
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
    getProductsNeedingReview,
    getApprovedProductsFromAll,
    getDraftProducts,
    getDeletedProducts,

    // ====================== UTILITY ACTIONS ======================
    setCurrentProduct,
    clearCurrentProduct,
    clearAdminProduct,
    clearProductsErrors,
    clearAllProductsData,
    clearAllProductsList,
    clearPublicProductsList,
    clearVendorProductsList,
    clearSearchResultsList,
    clearRelatedProductsList,
    clearHistory,
    clearOurPicksList,
  };
}

// Export types for convenience
export type {
  CreateProductData,
  UpdateProductData,
  ProductSearchParams,
  ProductListParams,
  RecentlyViewedParams,
  AdminReviewData,
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
} from "@/redux/slices/productsSlice";