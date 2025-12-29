// hooks/useReduxAdmin.tsx
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  // Permission actions
  fetchPermissions,
  createPermission,
  fetchPermission,
  updatePermission,
  
  // Role actions
  fetchRoles,
  createRole,
  fetchRole,
  updateRole,
  deleteRole,
  
  // Admin user actions
  fetchAdmins,
  createAdmin,
  fetchAdmin,
  updateAdmin,
  deleteAdmin,
  suspendAdmin,
  activateAdmin,
  
  // Category actions
  fetchCategories,
  createCategory,
  fetchCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryCoverImage,
  
  // Attribute actions
  fetchAttributes,
  fetchAttributesByCategory,
  createAttribute,
  fetchAttribute,
  updateAttribute,
  deleteAttribute,
  assignAttributesToSubcategory,
  
  // Product type actions
  fetchProductTypes,
  fetchProductTypesBySubcategory,
  createProductType,
  fetchProductType,
  updateProductType,
  deleteProductType,
  uploadProductTypeCoverImage,
  
  // Product actions
  fetchProduct,
  reviewProduct,
  
  // Super admin actions
  resetUserPassword,
  disableAdminAccount,
  
  // Selectors
  selectPermissions,
  selectRoles,
  selectSelectedRole,
  selectAdmins,
  selectSelectedAdmin,
  selectCategories,
  selectSelectedCategory,
  selectSubcategories,
  selectAttributes,
  selectProductTypes,
  selectSelectedProductType,
  selectProducts,
  selectSelectedProduct,
  selectAdminLoading,
  selectCreateLoading,
  selectUpdateLoading,
  selectDeleteLoading,
  selectAdminError,
  selectCreateError,
  selectUpdateError,
  selectDeleteError,
  
  // Action creators
  setSelectedAdmin,
  clearSelectedAdmin,
  setSelectedRole,
  clearSelectedRole,
  setSelectedCategory,
  clearSelectedCategory,
  setSelectedProductType,
  clearSelectedProductType,
  setSelectedProduct,
  clearSelectedProduct,
  clearError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  
  // Types
  type Role,
  type AdminUser,
  type Category,
  
  type ProductType,
  type Product,
} from '@/redux/slices/adminSlice';

export function useReduxAdmin() {
  const dispatch = useAppDispatch();

  // ============================================================================
  // STATE SELECTORS
  // ============================================================================
  
  const permissions = useAppSelector(selectPermissions);
  const roles = useAppSelector(selectRoles);
  const selectedRole = useAppSelector(selectSelectedRole);
  const admins = useAppSelector(selectAdmins);
  const selectedAdmin = useAppSelector(selectSelectedAdmin);
  const categories = useAppSelector(selectCategories);
  const selectedCategory = useAppSelector(selectSelectedCategory);
  const subcategories = useAppSelector(selectSubcategories);
  const attributes = useAppSelector(selectAttributes);
  const productTypes = useAppSelector(selectProductTypes);
  const selectedProductType = useAppSelector(selectSelectedProductType);
  const products = useAppSelector(selectProducts);
  const selectedProduct = useAppSelector(selectSelectedProduct);
  
  const loading = useAppSelector(selectAdminLoading);
  const createLoading = useAppSelector(selectCreateLoading);
  const updateLoading = useAppSelector(selectUpdateLoading);
  const deleteLoading = useAppSelector(selectDeleteLoading);
  
  const error = useAppSelector(selectAdminError);
  const createError = useAppSelector(selectCreateError);
  const updateError = useAppSelector(selectUpdateError);
  const deleteError = useAppSelector(selectDeleteError);

  // ============================================================================
  // PERMISSION ACTIONS
  // ============================================================================

  const getPermissions = useCallback(async () => {
    try {
      const result = await dispatch(fetchPermissions()).unwrap();
      return result.data || result;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewPermission = useCallback(async (permissionData: {
    key: string;
    name: string;
    description?: string;
    module: string;
  }) => {
    try {
      return await dispatch(createPermission(permissionData)).unwrap();
    } catch (error) {
      console.error('Failed to create permission:', error);
      throw error;
    }
  }, [dispatch]);

  const getPermission = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchPermission(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch permission:', error);
      throw error;
    }
  }, [dispatch]);

  const updateExistingPermission = useCallback(async (
    id: string,
    data: { name?: string; description?: string }
  ) => {
    try {
      return await dispatch(updatePermission({ id, data })).unwrap();
    } catch (error) {
      console.error('Failed to update permission:', error);
      throw error;
    }
  }, [dispatch]);

  // ============================================================================
  // ROLE ACTIONS
  // ============================================================================

  const getRoles = useCallback(async () => {
    try {
      const result = await dispatch(fetchRoles()).unwrap();
      return result.data || result;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewRole = useCallback(async (
    name: string,
    description: string = '',
    permissionIds: string[] = []
  ) => {
    try {
      return await dispatch(createRole({ name, description, permissionIds })).unwrap();
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }, [dispatch]);

  const getRole = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchRole(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch role:', error);
      throw error;
    }
  }, [dispatch]);

  const updateExistingRole = useCallback(async (
    id: string,
    data: { name?: string; description?: string; permissionIds?: string[] }
  ) => {
    try {
      return await dispatch(updateRole({ id, data })).unwrap();
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  }, [dispatch]);

  const removeRole = useCallback(async (id: string) => {
    try {
      await dispatch(deleteRole(id)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to delete role:', error);
      throw error;
    }
  }, [dispatch]);

  // ============================================================================
  // ADMIN USER ACTIONS
  // ============================================================================

  const getAdmins = useCallback(async () => {
    try {
      return await dispatch(fetchAdmins()).unwrap();
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewAdmin = useCallback(async (adminData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    department?: string;
    role: string;
    appRoleIds?: string[];
    permissionIds?: string[];
  }) => {
    try {
      return await dispatch(createAdmin(adminData)).unwrap();
    } catch (error) {
      console.error('Failed to create admin:', error);
      throw error;
    }
  }, [dispatch]);

  const getAdmin = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchAdmin(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch admin:', error);
      throw error;
    }
  }, [dispatch]);

  const updateExistingAdmin = useCallback(async (
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      department?: string;
    }
  ) => {
    try {
      return await dispatch(updateAdmin({ id, data })).unwrap();
    } catch (error) {
      console.error('Failed to update admin:', error);
      throw error;
    }
  }, [dispatch]);

  const removeAdmin = useCallback(async (id: string) => {
    try {
      await dispatch(deleteAdmin(id)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to delete admin:', error);
      throw error;
    }
  }, [dispatch]);

  const suspendAdminAccount = useCallback(async (id: string) => {
    try {
      return await dispatch(suspendAdmin(id)).unwrap();
    } catch (error) {
      console.error('Failed to suspend admin:', error);
      throw error;
    }
  }, [dispatch]);

  const activateAdminAccount = useCallback(async (id: string) => {
    try {
      return await dispatch(activateAdmin(id)).unwrap();
    } catch (error) {
      console.error('Failed to activate admin:', error);
      throw error;
    }
  }, [dispatch]);

  // ============================================================================
  // CATEGORY ACTIONS
  // ============================================================================

  const getCategories = useCallback(async () => {
    try {
      const result = await dispatch(fetchCategories()).unwrap();
      return result.data || result;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewCategory = useCallback(async (categoryData: {
    name: string;
    description?: string;
  }) => {
    try {
      return await dispatch(createCategory(categoryData)).unwrap();
    } catch (error) {
      console.error('Failed to create category:', error);
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

  const updateExistingCategory = useCallback(async (
    id: string,
    data: { name?: string; description?: string }
  ) => {
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

  const uploadCategoryImage = useCallback(async (id: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      return await dispatch(uploadCategoryCoverImage({ id, formData })).unwrap();
    } catch (error) {
      console.error('Failed to upload category cover image:', error);
      throw error;
    }
  }, [dispatch]);

  // ============================================================================
  // ATTRIBUTE ACTIONS
  // ============================================================================

  const getAllAttributes = useCallback(async () => {
    try {
      const result = await dispatch(fetchAttributes()).unwrap();
      return result.data || result;
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
      throw error;
    }
  }, [dispatch]);

  const getAttributesByCategory = useCallback(async (categoryId: string) => {
    try {
      const result = await dispatch(fetchAttributesByCategory(categoryId)).unwrap();
      return result.data || result;
    } catch (error) {
      console.error('Failed to fetch attributes by category:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewAttribute = useCallback(async (
    categoryId: string,
    data: {
      name: string;
      type: string;
      options?: string[];
      required: boolean;
    }
  ) => {
    try {
      return await dispatch(createAttribute({ categoryId, data })).unwrap();
    } catch (error) {
      console.error('Failed to create attribute:', error);
      throw error;
    }
  }, [dispatch]);

  const getAttribute = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchAttribute(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch attribute:', error);
      throw error;
    }
  }, [dispatch]);

  const updateExistingAttribute = useCallback(async (
    id: string,
    data: {
      name?: string;
      type?: string;
      options?: string[];
      required?: boolean;
    }
  ) => {
    try {
      return await dispatch(updateAttribute({ id, data })).unwrap();
    } catch (error) {
      console.error('Failed to update attribute:', error);
      throw error;
    }
  }, [dispatch]);

  const removeAttribute = useCallback(async (id: string) => {
    try {
      await dispatch(deleteAttribute(id)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to delete attribute:', error);
      throw error;
    }
  }, [dispatch]);

  const assignAttributes = useCallback(async (
    subcategoryId: string,
    attributeIds: string[]
  ) => {
    try {
      return await dispatch(
        assignAttributesToSubcategory({ subcategoryId, attributeIds })
      ).unwrap();
    } catch (error) {
      console.error('Failed to assign attributes:', error);
      throw error;
    }
  }, [dispatch]);

  // ============================================================================
  // PRODUCT TYPE ACTIONS
  // ============================================================================

  const getAllProductTypes = useCallback(async () => {
    try {
      const result = await dispatch(fetchProductTypes()).unwrap();
      return result.data || result;
    } catch (error) {
      console.error('Failed to fetch product types:', error);
      throw error;
    }
  }, [dispatch]);

  const getProductTypesBySubcategory = useCallback(async (subcategoryId: string) => {
    try {
      const result = await dispatch(fetchProductTypesBySubcategory(subcategoryId)).unwrap();
      return result.data || result;
    } catch (error) {
      console.error('Failed to fetch product types by subcategory:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewProductType = useCallback(async (
    subcategoryId: string,
    data: { name: string; description?: string }
  ) => {
    try {
      return await dispatch(createProductType({ subcategoryId, data })).unwrap();
    } catch (error) {
      console.error('Failed to create product type:', error);
      throw error;
    }
  }, [dispatch]);

  const getProductType = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchProductType(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch product type:', error);
      throw error;
    }
  }, [dispatch]);

  const updateExistingProductType = useCallback(async (
    id: string,
    data: { name?: string; description?: string }
  ) => {
    try {
      return await dispatch(updateProductType({ id, data })).unwrap();
    } catch (error) {
      console.error('Failed to update product type:', error);
      throw error;
    }
  }, [dispatch]);

  const removeProductType = useCallback(async (id: string) => {
    try {
      await dispatch(deleteProductType(id)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to delete product type:', error);
      throw error;
    }
  }, [dispatch]);

  const uploadProductTypeImage = useCallback(async (id: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      return await dispatch(uploadProductTypeCoverImage({ id, formData })).unwrap();
    } catch (error) {
      console.error('Failed to upload product type cover image:', error);
      throw error;
    }
  }, [dispatch]);

  // ============================================================================
  // PRODUCT ACTIONS
  // ============================================================================

  const getProduct = useCallback(async (id: string) => {
    try {
      return await dispatch(fetchProduct(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  }, [dispatch]);

  const reviewProductStatus = useCallback(async (
    id: string,
    data: {
      status: 'approved' | 'rejected' | 'suspended';
      reviewNotes?: string;
    }
  ) => {
    try {
      return await dispatch(reviewProduct({ id, data })).unwrap();
    } catch (error) {
      console.error('Failed to review product:', error);
      throw error;
    }
  }, [dispatch]);

  // ============================================================================
  // SUPER ADMIN ACTIONS
  // ============================================================================

  const triggerPasswordReset = useCallback(async (userId: string) => {
    try {
      return await dispatch(resetUserPassword(userId)).unwrap();
    } catch (error) {
      console.error('Failed to reset user password:', error);
      throw error;
    }
  }, [dispatch]);

  const disableAdmin = useCallback(async (adminId: string) => {
    try {
      return await dispatch(disableAdminAccount(adminId)).unwrap();
    } catch (error) {
      console.error('Failed to disable admin account:', error);
      throw error;
    }
  }, [dispatch]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const hasPermission = useCallback((
    permissionKey: string,
    userPermissions?: string[]
  ): boolean => {
    if (userPermissions) {
      return userPermissions.includes(permissionKey);
    }
    // Check from selected admin if available
    if (selectedAdmin?.roles) {
      return selectedAdmin.roles.some(role =>
        role.permissions.some(p => p.key === permissionKey)
      );
    }
    return false;
  }, [selectedAdmin]);

  const hasRole = useCallback((
    roleName: string,
    userRoles?: string[]
  ): boolean => {
    if (userRoles) {
      return userRoles.includes(roleName);
    }
    // Check from selected admin if available
    if (selectedAdmin?.roles) {
      return selectedAdmin.roles.some(role => role.name === roleName);
    }
    return false;
  }, [selectedAdmin]);

  const getAdminFullName = useCallback((admin: AdminUser): string => {
    return `${admin.firstName} ${admin.lastName}`.trim();
  }, []);

  const isAdminActive = useCallback((admin: AdminUser): boolean => {
    return admin.accountStatus === 'active';
  }, []);

  const isAdminSuspended = useCallback((admin: AdminUser): boolean => {
    return admin.accountStatus === 'suspended';
  }, []);

  const isAdminPendingDeletion = useCallback((admin: AdminUser): boolean => {
    return admin.accountStatus === 'pending_deletion';
  }, []);

  const getAdminStatusColor = useCallback((status: AdminUser['accountStatus']): string => {
    switch (status) {
      case 'active':
        return 'green';
      case 'suspended':
        return 'orange';
      case 'pending_deletion':
        return 'red';
      default:
        return 'gray';
    }
  }, []);

  const getAdminStatusLabel = useCallback((status: AdminUser['accountStatus']): string => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'suspended':
        return 'Suspended';
      case 'pending_deletion':
        return 'Pending Deletion';
      default:
        return 'Unknown';
    }
  }, []);

  // ============================================================================
  // SELECTION UTILITIES
  // ============================================================================

  const selectAdmin = useCallback((admin: AdminUser) => {
    dispatch(setSelectedAdmin(admin));
  }, [dispatch]);

  const clearSelectedAdminUser = useCallback(() => {
    dispatch(clearSelectedAdmin());
  }, [dispatch]);

  const selectRole = useCallback((role: Role) => {
    dispatch(setSelectedRole(role));
  }, [dispatch]);

  const clearSelectedRoleData = useCallback(() => {
    dispatch(clearSelectedRole());
  }, [dispatch]);

  const selectCategory = useCallback((category: Category) => {
    dispatch(setSelectedCategory(category));
  }, [dispatch]);

  const clearSelectedCategoryData = useCallback(() => {
    dispatch(clearSelectedCategory());
  }, [dispatch]);

  const selectProductType = useCallback((productType: ProductType) => {
    dispatch(setSelectedProductType(productType));
  }, [dispatch]);

  const clearSelectedProductTypeData = useCallback(() => {
    dispatch(clearSelectedProductType());
  }, [dispatch]);

  const selectProductData = useCallback((product: Product) => {
    dispatch(setSelectedProduct(product));
  }, [dispatch]);

  const clearSelectedProductData = useCallback(() => {
    dispatch(clearSelectedProduct());
  }, [dispatch]);

  // ============================================================================
  // ERROR CLEARING
  // ============================================================================

  const clearAllErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCreationError = useCallback(() => {
    dispatch(clearCreateError());
  }, [dispatch]);

  const clearUpdatingError = useCallback(() => {
    dispatch(clearUpdateError());
  }, [dispatch]);

  const clearDeletionError = useCallback(() => {
    dispatch(clearDeleteError());
  }, [dispatch]);

  // ============================================================================
  // RETURN OBJECT
  // ============================================================================

  return {
    // ========== STATE ==========
    permissions,
    roles,
    selectedRole,
    admins,
    selectedAdmin,
    categories,
    selectedCategory,
    subcategories,
    attributes,
    productTypes,
    selectedProductType,
    products,
    selectedProduct,
    
    // Loading states
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // Error states
    error,
    createError,
    updateError,
    deleteError,
    
    // ========== PERMISSION ACTIONS ==========
    getPermissions,
    createNewPermission,
    getPermission,
    updateExistingPermission,
    
    // ========== ROLE ACTIONS ==========
    getRoles,
    createNewRole,
    getRole,
    updateExistingRole,
    removeRole,
    
    // ========== ADMIN USER ACTIONS ==========
    getAdmins,
    createNewAdmin,
    getAdmin,
    updateExistingAdmin,
    removeAdmin,
    suspendAdminAccount,
    activateAdminAccount,
    
    // ========== CATEGORY ACTIONS ==========
    getCategories,
    createNewCategory,
    getCategory,
    updateExistingCategory,
    removeCategory,
    uploadCategoryImage,
    
    // ========== ATTRIBUTE ACTIONS ==========
    getAllAttributes,
    getAttributesByCategory,
    createNewAttribute,
    getAttribute,
    updateExistingAttribute,
    removeAttribute,
    assignAttributes,
    
    // ========== PRODUCT TYPE ACTIONS ==========
    getAllProductTypes,
    getProductTypesBySubcategory,
    createNewProductType,
    getProductType,
    updateExistingProductType,
    removeProductType,
    uploadProductTypeImage,
    
    // ========== PRODUCT ACTIONS ==========
    getProduct,
    reviewProductStatus,
    
    // ========== SUPER ADMIN ACTIONS ==========
    triggerPasswordReset,
    disableAdmin,
    
    // ========== HELPER FUNCTIONS ==========
    hasPermission,
    hasRole,
    getAdminFullName,
    isAdminActive,
    isAdminSuspended,
    isAdminPendingDeletion,
    getAdminStatusColor,
    getAdminStatusLabel,
    
    // ========== SELECTION UTILITIES ==========
    selectAdmin,
    clearSelectedAdminUser,
    selectRole,
    clearSelectedRoleData,
    selectCategory,
    clearSelectedCategoryData,
    selectProductType,
    clearSelectedProductTypeData,
    selectProductData,
    clearSelectedProductData,
    
    // ========== ERROR CLEARING ==========
    clearAllErrors,
    clearCreationError,
    clearUpdatingError,
    clearDeletionError,
  };
}