// hooks/useReduxCategories.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  // Category endpoints
  fetchCategories,
  fetchCategoryFeed,
  fetchPopularCategories,
  fetchCategory,
  createCategory,
  updateCategory,
  deleteCategory,

  // Subcategory endpoints
  fetchSubcategoriesByCategory,
  fetchSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,

  // Attribute endpoints
  fetchAttributes,
  fetchAttributesByCategory,
  fetchAttribute,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  assignAttributesToSubcategory,

  // Product type endpoints
  fetchProductTypes,
  createProductType,

  // Selectors
  selectCategories,
  selectSubcategories,
  selectAttributes,
  selectProductTypes,
  selectSelectedCategory,
  selectSelectedSubcategory,
  selectCategoryFeed,
  selectPopularCategories,
  selectCategoriesLoading,
  selectCategoriesError,
  selectCreateCategoryLoading,
  selectCreateCategoryError,

  // Actions
  setSelectedCategory,
  setSelectedSubcategory,
  clearSelected,
  clearError as clearCategoriesError,
  clearCategoryFeed,
  clearPopularCategories,

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
  const categoryFeed = useAppSelector(selectCategoryFeed);
  const popularCategories = useAppSelector(selectPopularCategories);
  const loading = useAppSelector(selectCategoriesLoading);
  const error = useAppSelector(selectCategoriesError);
  const createLoading = useAppSelector(selectCreateCategoryLoading);
  const createError = useAppSelector(selectCreateCategoryError);

  // ==================== CATEGORY ACTIONS ====================

  // Get all categories
  const getCategories = useCallback(
    async () => {
      try {
        return await dispatch(fetchCategories()).unwrap();
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Get category feed for home screen
  const getCategoryFeed = useCallback(
    async () => {
      try {
        return await dispatch(fetchCategoryFeed()).unwrap();
      } catch (error) {
        console.error("Failed to fetch category feed:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Get popular categories
  const getPopularCategories = useCallback(
    async () => {
      try {
        return await dispatch(fetchPopularCategories()).unwrap();
      } catch (error) {
        console.error("Failed to fetch popular categories:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Get a category by ID
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

  // Create a new category
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

  // Update a category
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

  // Delete a category
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

  // ==================== SUBCATEGORY ACTIONS ====================

  // Get all subcategories for a category
  const getSubcategoriesByCategory = useCallback(
    async (categoryId: string) => {
      try {
        return await dispatch(fetchSubcategoriesByCategory(categoryId)).unwrap();
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Get a subcategory by ID under a specific category
  const getSubcategory = useCallback(
    async (categoryId: string, id: string) => {
      try {
        return await dispatch(fetchSubcategory({ categoryId, id })).unwrap();
      } catch (error) {
        console.error("Failed to fetch subcategory:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Create a new subcategory
  const createNewSubcategory = useCallback(
    async (
      categoryId: string,
      data: {
        name: string;
        description?: string;
        coverImageUrl: string;
        isActive?: boolean;
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

  // Update a subcategory
  const updateExistingSubcategory = useCallback(
    async (categoryId: string, id: string, data: Partial<SubCategory>) => {
      try {
        return await dispatch(updateSubcategory({ categoryId, id, data })).unwrap();
      } catch (error) {
        console.error("Failed to update subcategory:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Delete a subcategory
  const removeSubcategory = useCallback(
    async (categoryId: string, id: string) => {
      try {
        await dispatch(deleteSubcategory({ categoryId, id })).unwrap();
        return true;
      } catch (error) {
        console.error("Failed to delete subcategory:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // ==================== ATTRIBUTE ACTIONS ====================

  // Get all attributes
  const getAttributes = useCallback(async () => {
    try {
      return await dispatch(fetchAttributes()).unwrap();
    } catch (error) {
      console.error("Failed to fetch attributes:", error);
      throw error;
    }
  }, [dispatch]);

  // Get attributes by category
  const getAttributesByCategory = useCallback(
    async (categoryId: string) => {
      try {
        return await dispatch(fetchAttributesByCategory(categoryId)).unwrap();
      } catch (error) {
        console.error("Failed to fetch category attributes:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Get an attribute by ID
  const getAttribute = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchAttribute(id)).unwrap();
      } catch (error) {
        console.error("Failed to fetch attribute:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Create a new attribute for a category
  const createNewAttribute = useCallback(
    async (
      categoryId: string,
      data: Omit<Attribute, "id" | "createdAt" | "updatedAt">
    ) => {
      try {
        return await dispatch(createAttribute({ categoryId, data })).unwrap();
      } catch (error) {
        console.error("Failed to create attribute:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Update an attribute
  const updateExistingAttribute = useCallback(
    async (id: string, data: Partial<Attribute>) => {
      try {
        return await dispatch(updateAttribute({ id, data })).unwrap();
      } catch (error) {
        console.error("Failed to update attribute:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Delete an attribute
  const removeAttribute = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteAttribute(id)).unwrap();
        return true;
      } catch (error) {
        console.error("Failed to delete attribute:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Assign attributes to subcategory
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

  // ==================== PRODUCT TYPE ACTIONS ====================

  // Get all product types
  const getProductTypes = useCallback(async () => {
    try {
      return await dispatch(fetchProductTypes()).unwrap();
    } catch (error) {
      console.error("Failed to fetch product types:", error);
      throw error;
    }
  }, [dispatch]);

  // Create a new product type
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

  // Note: updateProductType and deleteProductType were not in Swagger
  // They have been removed from the slice

  // ==================== HELPER FUNCTIONS ====================

  // Get subcategories for a category from local state
  const getSubcategoriesForCategory = useCallback(
    (categoryId: string): SubCategory[] => {
      return subcategories.filter((subcat) => subcat.categoryId === categoryId);
    },
    [subcategories]
  );

  // Get category name by ID
  const getCategoryName = useCallback(
    (categoryId: string): string => {
      const category = categories.find((cat) => cat.id === categoryId);
      return category?.name || "Unknown Category";
    },
    [categories]
  );

  // Get subcategory name by ID
  const getSubcategoryName = useCallback(
    (subcategoryId: string): string => {
      const subcategory = subcategories.find(
        (subcat) => subcat.id === subcategoryId
      );
      return subcategory?.name || "Unknown Subcategory";
    },
    [subcategories]
  );

  // Get attributes for a category from local state
  const getAttributesForCategory = useCallback(
    (categoryId: string): Attribute[] => {
      return attributes.filter((attr) => attr.categoryId === categoryId);
    },
    [attributes]
  );

  // Get attributes for a subcategory from local state
  const getAttributesForSubcategory = useCallback(
    (subcategoryId: string): Attribute[] => {
      return attributes.filter((attr) => attr.subcategoryId === subcategoryId);
    },
    [attributes]
  );

  // ==================== UTILITY ACTIONS ====================

  // Set selected category
  const selectCategory = useCallback(
    (category: Category) => {
      dispatch(setSelectedCategory(category));
    },
    [dispatch]
  );

  // Set selected subcategory
  const selectSubcategory = useCallback(
    (subcategory: SubCategory) => {
      dispatch(setSelectedSubcategory(subcategory));
    },
    [dispatch]
  );

  // Clear selected items
  const clearSelectedItems = useCallback(() => {
    dispatch(clearSelected());
  }, [dispatch]);

  // Clear category errors
  const clearCategoriesErrors = useCallback(() => {
    dispatch(clearCategoriesError());
  }, [dispatch]);

  // Clear category feed
  const clearCategoryFeedData = useCallback(() => {
    dispatch(clearCategoryFeed());
  }, [dispatch]);

  // Clear popular categories
  const clearPopularCategoriesData = useCallback(() => {
    dispatch(clearPopularCategories());
  }, [dispatch]);

  return {
    // ==================== STATE ====================
    categories,
    subcategories,
    attributes,
    productTypes,
    selectedCategory,
    selectedSubcategory,
    categoryFeed,
    popularCategories,
    loading,
    error,
    createLoading,
    createError,

    // ==================== CATEGORY ACTIONS ====================
    getCategories,
    getCategoryFeed,
    getPopularCategories,
    getCategory,
    createNewCategory,
    updateExistingCategory,
    removeCategory,

    // ==================== SUBCATEGORY ACTIONS ====================
    getSubcategoriesByCategory,
    getSubcategory,
    createNewSubcategory,
    updateExistingSubcategory,
    removeSubcategory,

    // ==================== ATTRIBUTE ACTIONS ====================
    getAttributes,
    getAttributesByCategory,
    getAttribute,
    createNewAttribute,
    updateExistingAttribute,
    removeAttribute,
    assignAttributes,

    // ==================== PRODUCT TYPE ACTIONS ====================
    getProductTypes,
    createNewProductType,

    // ==================== HELPER FUNCTIONS ====================
    getSubcategoriesForCategory,
    getCategoryName,
    getSubcategoryName,
    getAttributesForCategory,
    getAttributesForSubcategory,

    // ==================== UTILITY ACTIONS ====================
    selectCategory,
    selectSubcategory,
    clearSelectedItems,
    clearCategoriesErrors,
    clearCategoryFeedData,
    clearPopularCategoriesData,
  };
}

// Export types for convenience
export type {
  Category,
  SubCategory,
  Attribute,
  ProductType,
} from "@/redux/slices/categoriesSlice";