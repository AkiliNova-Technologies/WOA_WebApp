// hooks/useCategories.ts
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchCategories,
  fetchCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchSubcategories,
  fetchSubcategory,
  updateSubcategory,
  deleteSubcategory,
  fetchAttributes,
  fetchCategoryAttributes,
  createAttribute,
  assignAttributesToSubcategory,
  fetchProductTypes,
  fetchSubcategoryProductTypes,
  createProductType,
  selectCategories,
  selectSubcategories,
  selectAttributes,
  selectProductTypes,
  selectSelectedCategory,
  selectSelectedSubcategory,
  selectCategoriesLoading,
  selectCategoriesError,
  selectCreateCategoryLoading,
  selectCreateCategoryError,
  setSelectedCategory,
  setSelectedSubcategory,
  clearSelected,
  clearError as clearCategoriesError,
  type Category,
  type SubCategory,
  type Attribute,
  type ProductType,
} from '@/redux/slices/categoriesSlice';
import api from '@/utils/api';

export function useReduxCategories() {
  const dispatch = useAppDispatch();

  // Selectors
  const categories = useAppSelector(selectCategories);
  const subcategories = useAppSelector(selectSubcategories);
  const attributes = useAppSelector(selectAttributes);
  const productTypes = useAppSelector(selectProductTypes);
  const selectedCategory = useAppSelector(selectSelectedCategory);
  const selectedSubcategory = useAppSelector(selectSelectedSubcategory);
  const loading = useAppSelector(selectCategoriesLoading);
  const error = useAppSelector(selectCategoriesError);
  const createLoading = useAppSelector(selectCreateCategoryLoading);
  const createError = useAppSelector(selectCreateCategoryError);

  // Category actions
  const getCategories = useCallback(async () => {
    try {
      return await dispatch(fetchCategories()).unwrap();
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }, [dispatch]);

  const getCategory = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchCategory(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch category:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'subcategories'>) => {
    try {
      return await dispatch(createCategory(categoryData)).unwrap();
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }, [dispatch]);

  const updateExistingCategory = useCallback(async (id: string, data: Partial<Category>) => {
    try {
      return await dispatch(updateCategory({ id, data })).unwrap();
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }, [dispatch]);

  const removeCategory = useCallback(async (id: string) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }, [dispatch]);

  // Subcategory actions
  const getSubcategories = useCallback(async () => {
    try {
      return await dispatch(fetchSubcategories()).unwrap();
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      throw error;
    }
  }, [dispatch]);

  const getSubcategory = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchSubcategory(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch subcategory:', error);
      throw error;
    }
  }, [dispatch]);

  const updateExistingSubcategory = useCallback(async (id: string, data: Partial<SubCategory>) => {
    try {
      return await dispatch(updateSubcategory({ id, data })).unwrap();
    } catch (error) {
      console.error('Failed to update subcategory:', error);
      throw error;
    }
  }, [dispatch]);

  const removeSubcategory = useCallback(async (id: string) => {
    try {
      await dispatch(deleteSubcategory(id)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to delete subcategory:', error);
      throw error;
    }
  }, [dispatch]);

  // Attribute actions
  const getAttributes = useCallback(async () => {
    try {
      return await dispatch(fetchAttributes()).unwrap();
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
      throw error;
    }
  }, [dispatch]);

  const getCategoryAttributes = useCallback(async (categoryId: string) => {
    try {
      return await dispatch(fetchCategoryAttributes(categoryId)).unwrap();
    } catch (error) {
      console.error('Failed to fetch category attributes:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewAttribute = useCallback(async (categoryId: string, attributeData: Omit<Attribute, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      return await dispatch(createAttribute({ categoryId, data: attributeData })).unwrap();
    } catch (error) {
      console.error('Failed to create attribute:', error);
      throw error;
    }
  }, [dispatch]);

  const assignAttributes = useCallback(async (subcategoryId: string, attributeIds: string[]) => {
    try {
      return await dispatch(assignAttributesToSubcategory({ subcategoryId, attributeIds })).unwrap();
    } catch (error) {
      console.error('Failed to assign attributes:', error);
      throw error;
    }
  }, [dispatch]);

  // Product type actions
  const getProductTypes = useCallback(async () => {
    try {
      return await dispatch(fetchProductTypes()).unwrap();
    } catch (error) {
      console.error('Failed to fetch product types:', error);
      throw error;
    }
  }, [dispatch]);

  const getSubcategoryProductTypes = useCallback(async (subcategoryId: string) => {
    try {
      return await dispatch(fetchSubcategoryProductTypes(subcategoryId)).unwrap();
    } catch (error) {
      console.error('Failed to fetch subcategory product types:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewProductType = useCallback(async (subcategoryId: string, productTypeData: Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      return await dispatch(createProductType({ subcategoryId, data: productTypeData })).unwrap();
    } catch (error) {
      console.error('Failed to create product type:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewSubcategory = useCallback(async (categoryId: string, subcategoryData: Omit<SubCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // You'll need to add this thunk to your categoriesSlice
    const response = await api.post(`/api/v1/categories/${categoryId}/subcategories`, subcategoryData);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create subcategory:', error);
    throw error;
  }
}, [dispatch]);

  // Helper functions
  const getSubcategoriesByCategory = useCallback((categoryId: string): SubCategory[] => {
    return subcategories.filter(subcat => subcat.categoryId === categoryId);
  }, [subcategories]);

  const getCategoryName = useCallback((categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  }, [categories]);

  const getSubcategoryName = useCallback((subcategoryId: string): string => {
    const subcategory = subcategories.find(subcat => subcat.id === subcategoryId);
    return subcategory?.name || 'Unknown Subcategory';
  }, [subcategories]);

  // Utility actions
  const selectCategory = useCallback((category: Category) => {
    dispatch(setSelectedCategory(category));
  }, [dispatch]);

  const selectSubcategory = useCallback((subcategory: SubCategory) => {
    dispatch(setSelectedSubcategory(subcategory));
  }, [dispatch]);

  const clearSelectedItems = useCallback(() => {
    dispatch(clearSelected());
  }, [dispatch]);

  const clearCategoriesErrors = useCallback(() => {
    dispatch(clearCategoriesError());
  }, [dispatch]);

  return {
    // State
    categories,
    subcategories,
    attributes,
    productTypes,
    selectedCategory,
    selectedSubcategory,
    loading,
    error,
    createLoading,
    createError,
    
    // Category actions
    getCategories,
    getCategory,
    createNewCategory,
    updateExistingCategory,
    removeCategory,
    
    // Subcategory actions
    createNewSubcategory,
    getSubcategories,
    getSubcategory,
    updateExistingSubcategory,
    removeSubcategory,
    
    // Attribute actions
    getAttributes,
    getCategoryAttributes,
    createNewAttribute,
    assignAttributes,
    
    // Product type actions
    getProductTypes,
    getSubcategoryProductTypes,
    createNewProductType,
    
    // Helper functions
    getSubcategoriesByCategory,
    getCategoryName,
    getSubcategoryName,
    
    // Utility actions
    selectCategory,
    selectSubcategory,
    clearSelectedItems,
    clearCategoriesErrors,
  };
}