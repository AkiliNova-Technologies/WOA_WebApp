import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  createProduct,
  fetchProduct,
  fetchPublicProduct,
  updateProduct,
  deleteProduct,
  submitForReview,
  uploadProductMedia,
  fetchRelatedProducts,
  fetchPublicProducts,
  fetchAdminProduct,
  fetchAdminProducts,
  updateLowStockThreshold,
  selectProducts,
  selectAdminProducts,
  selectPublicProducts,
  selectRelatedProducts,
  selectProduct,
  selectProductsLoading,
  selectProductsError,
  selectCreateProductLoading,
  selectCreateProductError,
  selectProductsPagination,
  setProduct,
  clearProduct,
  clearError as clearProductsError,
  clearProducts,
  clearPublicProducts,
  clearRelatedProducts,
  clearAdminProducts,
  type CreateProductData,
  type Product,
} from '@/redux/slices/productsSlice';

export function useReduxProducts() {
  const dispatch = useAppDispatch();

  // Selectors
  const products = useAppSelector(selectProducts);
  const adminProducts = useAppSelector(selectAdminProducts);
  const publicProducts = useAppSelector(selectPublicProducts);
  const relatedProducts = useAppSelector(selectRelatedProducts);
  const product = useAppSelector(selectProduct);
  const loading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);
  const createLoading = useAppSelector(selectCreateProductLoading);
  const createError = useAppSelector(selectCreateProductError);
  const pagination = useAppSelector(selectProductsPagination);

  // ====================== PUBLIC PRODUCTS ======================

  const getPublicProducts = useCallback(async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    vendorId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      return await dispatch(fetchPublicProducts(params || {})).unwrap();
    } catch (error) {
      console.error('Failed to fetch public products:', error);
      throw error;
    }
  }, [dispatch]);

  const getPublicProduct = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchPublicProduct(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch public product:', error);
      throw error;
    }
  }, [dispatch]);

  const getRelatedProducts = useCallback(async (productId: string) => {
    try {
      return await dispatch(fetchRelatedProducts(productId)).unwrap();
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      throw error;
    }
  }, [dispatch]);

  // ====================== REGULAR PRODUCTS (VENDOR) ======================

  const createNewProduct = useCallback(async (productData: CreateProductData) => {
    try {
      return await dispatch(createProduct(productData)).unwrap();
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }, [dispatch]);

  const getProduct = useCallback(async (id: string, isPublic: boolean = false) => {
    try {
      if (isPublic) {
        return await dispatch(fetchPublicProduct(id)).unwrap();
      }
      return await dispatch(fetchProduct(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  }, [dispatch]);

  const updateExistingProduct = useCallback(async (id: string, data: Partial<CreateProductData>) => {
    try {
      return await dispatch(updateProduct({ id, data })).unwrap();
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }, [dispatch]);

  const removeProduct = useCallback(async (id: string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  }, [dispatch]);

  const submitProductForReview = useCallback(async (id: string) => {
    try {
      return await dispatch(submitForReview(id)).unwrap();
    } catch (error) {
      console.error('Failed to submit product for review:', error);
      throw error;
    }
  }, [dispatch]);

  const uploadMedia = useCallback(async (id: string, file: File) => {
    try {
      return await dispatch(uploadProductMedia({ id, file })).unwrap();
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  }, [dispatch]);

  // ====================== ADMIN PRODUCTS ======================

  const getAdminProduct = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchAdminProduct(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch admin product:', error);
      throw error;
    }
  }, [dispatch]);

  const getAdminProducts = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    vendorId?: string;
    categoryId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      return await dispatch(fetchAdminProducts(params || {})).unwrap();
    } catch (error) {
      console.error('Failed to fetch admin products:', error);
      throw error;
    }
  }, [dispatch]);

  const updateProductLowStockThreshold = useCallback(async (productId: string, threshold: number) => {
    try {
      return await dispatch(updateLowStockThreshold({ productId, threshold })).unwrap();
    } catch (error) {
      console.error('Failed to update low stock threshold:', error);
      throw error;
    }
  }, [dispatch]);

  // ====================== HELPER FUNCTIONS ======================

  const getProductById = useCallback((id: string): Product | undefined => {
    return products.find(product => product.id === id);
  }, [products]);

  const getProductsByCategory = useCallback((categoryId: string): Product[] => {
    return products.filter(product => product.categoryId === categoryId);
  }, [products]);

  const getProductsByVendor = useCallback((vendorId: string): Product[] => {
    return products.filter(product => product.vendorId === vendorId);
  }, [products]);

  const getPublishedProducts = useCallback((): Product[] => {
    return products.filter(product => product.status === 'published');
  }, [products]);

  const getPendingReviewProducts = useCallback((): Product[] => {
    return products.filter(product => product.status === 'pending_review');
  }, [products]);

  const getPublicProductsByCategory = useCallback((categoryId: string): Product[] => {
    return publicProducts.filter(product => product.categoryId === categoryId);
  }, [publicProducts]);

  const getPublicProductsByVendor = useCallback((vendorId: string): Product[] => {
    return publicProducts.filter(product => product.vendorId === vendorId);
  }, [publicProducts]);

  // ====================== UTILITY ACTIONS ======================

  const setCurrentProduct = useCallback((productData: Product) => {
    dispatch(setProduct(productData));
  }, [dispatch]);

  const clearCurrentProduct = useCallback(() => {
    dispatch(clearProduct());
  }, [dispatch]);

  const clearProductsErrors = useCallback(() => {
    dispatch(clearProductsError());
  }, [dispatch]);

  const clearAllProducts = useCallback(() => {
    dispatch(clearProducts());
  }, [dispatch]);

  const clearPublicProductsList = useCallback(() => {
    dispatch(clearPublicProducts());
  }, [dispatch]);

  const clearRelatedProductsList = useCallback(() => {
    dispatch(clearRelatedProducts());
  }, [dispatch]);

  const clearAdminProductsList = useCallback(() => {
    dispatch(clearAdminProducts());
  }, [dispatch]);

  return {
    // State
    products,
    adminProducts,
    publicProducts,
    relatedProducts,
    product,
    loading,
    error,
    createLoading,
    createError,
    pagination,
    
    // Public product actions
    getPublicProducts,
    getPublicProduct,
    getRelatedProducts,
    
    // Regular product actions
    createNewProduct,
    getProduct,
    updateExistingProduct,
    removeProduct,
    submitProductForReview,
    uploadMedia,
    
    // Admin product actions
    getAdminProduct,
    getAdminProducts,
    updateProductLowStockThreshold,
    
    // Helper functions
    getProductById,
    getProductsByCategory,
    getProductsByVendor,
    getPublishedProducts,
    getPendingReviewProducts,
    getPublicProductsByCategory,
    getPublicProductsByVendor,
    
    // Utility actions
    setCurrentProduct,
    clearCurrentProduct,
    clearProductsErrors,
    clearAllProducts,
    clearPublicProductsList,
    clearRelatedProductsList,
    clearAdminProductsList,
  };
}