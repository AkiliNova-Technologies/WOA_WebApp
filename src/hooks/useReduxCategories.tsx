// hooks/useCategories.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  // Public endpoints
  fetchCategories,
  fetchCategory,
  fetchSubcategories,
  fetchSubcategory,

  // Admin endpoints
  createCategory,
  updateCategory,
  deleteCategory,
  fetchAdminCategories,
  // fetchAdminCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  fetchAdminSubcategories,
  // fetchAdminSubcategory,

  // Other endpoints
  fetchAttributes,
  createAttribute,
  assignAttributesToSubcategory,
  fetchProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,

  // Selectors
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

  // Actions
  setSelectedCategory,
  setSelectedSubcategory,
  clearSelected,
  clearError as clearCategoriesError,

  // Types
  type Category,
  type SubCategory,
  type Attribute,
  type ProductType,
} from "@/redux/slices/categoriesSlice";

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

  // Public category actions
  const getCategories = useCallback(
    async (params?: { skip?: number; take?: number; search?: string }) => {
      try {
        // Pass empty object if params is undefined
        return await dispatch(fetchCategories(params || {})).unwrap();
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const getCategory = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchCategory(id)).unwrap();
      } catch (error) {
        console.error("Failed to fetch category:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Admin category actions
  const getAdminCategories = useCallback(async () => {
    try {
      return await dispatch(fetchAdminCategories()).unwrap();
    } catch (error) {
      console.error("Failed to fetch admin categories:", error);
      throw error;
    }
  }, [dispatch]);

  const createNewCategory = useCallback(
    async (categoryData: {
      name: string;
      description?: string;
      icon?: string;
    }) => {
      try {
        return await dispatch(createCategory(categoryData)).unwrap();
      } catch (error) {
        console.error("Failed to create category:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateExistingCategory = useCallback(
    async (id: string, data: Partial<Category>) => {
      try {
        return await dispatch(updateCategory({ id, data })).unwrap();
      } catch (error) {
        console.error("Failed to update category:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const removeCategory = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteCategory(id)).unwrap();
        return true;
      } catch (error) {
        console.error("Failed to delete category:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Public subcategory actions
  const getSubcategories = useCallback(
    async (params?: {
      categoryId?: string;
      skip?: number;
      take?: number;
      search?: string;
    }) => {
      try {
        // Pass empty object if params is undefined
        return await dispatch(fetchSubcategories(params || {})).unwrap();
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const getSubcategory = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchSubcategory(id)).unwrap();
      } catch (error) {
        console.error("Failed to fetch subcategory:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Admin subcategory actions
  const getAdminSubcategories = useCallback(
    async (params?: { categoryId?: string; skip?: number; take?: number }) => {
      try {
        // Pass empty object if params is undefined
        return await dispatch(fetchAdminSubcategories(params || {})).unwrap();
      } catch (error) {
        console.error("Failed to fetch admin subcategories:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const createNewSubcategory = useCallback(
    async (
      categoryId: string,
      data: {
        name: string;
        description?: string;
        icon?: string;
      }
    ) => {
      try {
        const subcategoryData = {
          ...data,
          categoryId: categoryId,
        };
        return await dispatch(createSubcategory(subcategoryData)).unwrap();
      } catch (error) {
        console.error("Failed to create subcategory:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateExistingSubcategory = useCallback(
    async (id: string, data: Partial<SubCategory>) => {
      try {
        return await dispatch(updateSubcategory({ id, data })).unwrap();
      } catch (error) {
        console.error("Failed to update subcategory:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const removeSubcategory = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteSubcategory(id)).unwrap();
        return true;
      } catch (error) {
        console.error("Failed to delete subcategory:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Attribute actions
  const getAttributes = useCallback(async () => {
    try {
      return await dispatch(fetchAttributes()).unwrap();
    } catch (error) {
      console.error("Failed to fetch attributes:", error);
      throw error;
    }
  }, [dispatch]);

  const createNewAttribute = useCallback(
    async (
      categoryId: string,
      data: Omit<Attribute, "id" | "createdAt" | "updatedAt">
    ) => {
      try {
        const attributeData = {
          ...data,
          categoryId: categoryId,
        };
        return await dispatch(createAttribute(attributeData)).unwrap();
      } catch (error) {
        console.error("Failed to create attribute:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const assignAttributes = useCallback(
    async (subcategoryId: string, attributeIds: string[]) => {
      try {
        return await dispatch(
          assignAttributesToSubcategory({ subcategoryId, attributeIds })
        ).unwrap();
      } catch (error) {
        console.error("Failed to assign attributes:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Product type actions
  const getProductTypes = useCallback(async () => {
    try {
      return await dispatch(fetchProductTypes()).unwrap();
    } catch (error) {
      console.error("Failed to fetch product types:", error);
      throw error;
    }
  }, [dispatch]);

  const createNewProductType = useCallback(
    async (
      subcategoryId: string,
      productTypeData: Omit<ProductType, "id" | "createdAt" | "updatedAt">
    ) => {
      try {
        return await dispatch(
          createProductType({ subcategoryId, data: productTypeData })
        ).unwrap();
      } catch (error) {
        console.error("Failed to create product type:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateExistingProductType = useCallback(
    async (id: string, data: Partial<ProductType>) => {
      try {
        return await dispatch(updateProductType({ id, data })).unwrap();
      } catch (error) {
        console.error("Failed to update product type:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const removeProductType = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteProductType(id)).unwrap();
        return true;
      } catch (error) {
        console.error("Failed to delete product type:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Helper functions
  const getSubcategoriesByCategory = useCallback(
    (categoryId: string): SubCategory[] => {
      return subcategories.filter((subcat) => subcat.categoryId === categoryId);
    },
    [subcategories]
  );

  const getCategoryName = useCallback(
    (categoryId: string): string => {
      const category = categories.find((cat) => cat.id === categoryId);
      return category?.name || "Unknown Category";
    },
    [categories]
  );

  const getSubcategoryName = useCallback(
    (subcategoryId: string): string => {
      const subcategory = subcategories.find(
        (subcat) => subcat.id === subcategoryId
      );
      return subcategory?.name || "Unknown Subcategory";
    },
    [subcategories]
  );

  // Utility actions
  const selectCategory = useCallback(
    (category: Category) => {
      dispatch(setSelectedCategory(category));
    },
    [dispatch]
  );

  const selectSubcategory = useCallback(
    (subcategory: SubCategory) => {
      dispatch(setSelectedSubcategory(subcategory));
    },
    [dispatch]
  );

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

    // Public category actions
    getCategories,
    getCategory,

    // Admin category actions
    getAdminCategories,
    createNewCategory,
    updateExistingCategory,
    removeCategory,

    // Public subcategory actions
    getSubcategories,
    getSubcategory,

    // Admin subcategory actions
    getAdminSubcategories,
    createNewSubcategory,
    updateExistingSubcategory,
    removeSubcategory,

    // Attribute actions
    getAttributes,
    createNewAttribute,
    assignAttributes,

    // Product type actions
    getProductTypes,
    createNewProductType,
    updateExistingProductType,
    removeProductType,

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
