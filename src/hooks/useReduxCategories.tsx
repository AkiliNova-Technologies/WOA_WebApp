// hooks/useReduxCategories.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  // Category endpoints
  fetchCategories,
  fetchPublicCategories,
  fetchCategoryFeed,
  fetchPopularCategories,
  fetchCategory,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,

  // Subcategory endpoints
  fetchSubcategoriesByCategory,
  fetchPublicSubcategoriesByCategory,
  createSubcategory,
  updateSubcategory,
  updateSubcategoryStatus,
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
  fetchProductTypesBySubcategory,
  fetchPublicProductTypesBySubcategory,
  fetchProductType,
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

  // Get all categories (Admin)
  const getCategories = useCallback(async () => {
    try {
      return await dispatch(fetchCategories()).unwrap();
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  }, [dispatch]);

  // Get all categories (Public) - for vendors and public access
  const getPublicCategories = useCallback(async () => {
    try {
      return await dispatch(fetchPublicCategories()).unwrap();
    } catch (error) {
      console.error("Failed to fetch public categories:", error);
      throw error;
    }
  }, [dispatch]);

  // Get category feed for home screen
  const getCategoryFeed = useCallback(async () => {
    try {
      return await dispatch(fetchCategoryFeed()).unwrap();
    } catch (error) {
      console.error("Failed to fetch category feed:", error);
      throw error;
    }
  }, [dispatch]);

  // Get popular categories
  const getPopularCategories = useCallback(async () => {
    try {
      return await dispatch(fetchPopularCategories()).unwrap();
    } catch (error) {
      console.error("Failed to fetch popular categories:", error);
      throw error;
    }
  }, [dispatch]);

  // Get a category by ID (Admin)
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

  // Create a new category (Admin)
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

  // Update a category (Admin)
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

  // Update category status (Admin)
  const updateCategoryActiveStatus = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        return await dispatch(updateCategoryStatus({ id, isActive })).unwrap();
      } catch (error) {
        console.error("Failed to update category status:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Delete a category (Admin)
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

  // Get all subcategories for a category (Admin)
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

  // Get all subcategories for a category (Public) - for vendors and public access
  const getPublicSubcategoriesByCategory = useCallback(
    async (categoryId: string) => {
      try {
        return await dispatch(fetchPublicSubcategoriesByCategory(categoryId)).unwrap();
      } catch (error) {
        console.error("Failed to fetch public subcategories:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Create a new subcategory (Admin)
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

  // Update a subcategory (Admin)
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

  // Update subcategory status (Admin)
  const updateSubcategoryActiveStatus = useCallback(
    async (categoryId: string, id: string, isActive: boolean) => {
      try {
        return await dispatch(
          updateSubcategoryStatus({ categoryId, id, isActive })
        ).unwrap();
      } catch (error) {
        console.error("Failed to update subcategory status:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Delete a subcategory (Admin)
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

  // Get all attributes (Admin)
  const getAttributes = useCallback(async () => {
    try {
      return await dispatch(fetchAttributes()).unwrap();
    } catch (error) {
      console.error("Failed to fetch attributes:", error);
      throw error;
    }
  }, [dispatch]);

  // Get attributes by category (Admin)
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

  // Get an attribute by ID (Admin)
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

  // Create a new attribute for a category (Admin)
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

  // Update an attribute (Admin)
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

  // Delete an attribute (Admin)
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

  // Assign attributes to subcategory (Admin)
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

  // Get all product types (Admin)
  const getProductTypes = useCallback(async () => {
    try {
      return await dispatch(fetchProductTypes()).unwrap();
    } catch (error) {
      console.error("Failed to fetch product types:", error);
      throw error;
    }
  }, [dispatch]);

  // Get product types by subcategory (Admin)
  const getProductTypesBySubcategory = useCallback(
    async (subcategoryId: string) => {
      try {
        return await dispatch(fetchProductTypesBySubcategory(subcategoryId)).unwrap();
      } catch (error) {
        console.error("Failed to fetch product types by subcategory:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Get product types by subcategory (Public) - for vendors and public access
  const getPublicProductTypesBySubcategory = useCallback(
    async (subcategoryId: string) => {
      try {
        return await dispatch(fetchPublicProductTypesBySubcategory(subcategoryId)).unwrap();
      } catch (error) {
        console.error("Failed to fetch public product types by subcategory:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Get a product type by ID (Admin)
  const getProductType = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchProductType(id)).unwrap();
      } catch (error) {
        console.error("Failed to fetch product type:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Create a new product type (Admin)
  const createNewProductType = useCallback(
    async (
      subcategoryId: string,
      productTypeData: {
        name: string;
        description?: string;
        code: string;
        coverImageUrl?: string;
      }
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

  // Update a product type (Admin)
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

  // Delete a product type (Admin)
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

  // Get product types for a subcategory from local state
  const getProductTypesForSubcategory = useCallback(
    (subcategoryId: string): ProductType[] => {
      return productTypes.filter((pt) => pt.subcategoryId === subcategoryId);
    },
    [productTypes]
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
    getPublicCategories,
    getCategoryFeed,
    getPopularCategories,
    getCategory,
    createNewCategory,
    updateExistingCategory,
    updateCategoryActiveStatus,
    removeCategory,

    // ==================== SUBCATEGORY ACTIONS ====================
    getSubcategoriesByCategory,
    getPublicSubcategoriesByCategory,
    createNewSubcategory,
    updateExistingSubcategory,
    updateSubcategoryActiveStatus,
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
    getProductTypesBySubcategory,
    getPublicProductTypesBySubcategory,
    getProductType,
    createNewProductType,
    updateExistingProductType,
    removeProductType,

    // ==================== HELPER FUNCTIONS ====================
    getSubcategoriesForCategory,
    getCategoryName,
    getSubcategoryName,
    getAttributesForCategory,
    getAttributesForSubcategory,
    getProductTypesForSubcategory,

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