// hooks/useReduxAdmin.tsx
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchPermissions,
  createPermission,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchAdmins,
  createAdmin,
  fetchAdmin,
  updateAdmin,
  deleteAdmin,
  suspendAdmin,
  activateAdmin,
  selectPermissions,
  selectRoles,
  selectAdmins,
  selectSelectedAdmin,
  selectAdminLoading,
  selectAdminError,
  selectCreateAdminLoading,
  selectCreateAdminError,
  setSelectedAdmin,
  clearSelectedAdmin,
  clearError as clearAdminError,
  type Permission,
  type AdminUser,
} from '@/redux/slices/adminSlice';

export function useReduxAdmin() {
  const dispatch = useAppDispatch();

  // Selectors
  const permissions = useAppSelector(selectPermissions);
  const roles = useAppSelector(selectRoles);
  const admins = useAppSelector(selectAdmins);
  const selectedAdmin = useAppSelector(selectSelectedAdmin);
  const loading = useAppSelector(selectAdminLoading);
  const error = useAppSelector(selectAdminError);
  const createLoading = useAppSelector(selectCreateAdminLoading);
  const createError = useAppSelector(selectCreateAdminError);

  // Permission actions
  const getPermissions = useCallback(async () => {
    try {
      return await dispatch(fetchPermissions()).unwrap();
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewPermission = useCallback(async (permissionData: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      return await dispatch(createPermission(permissionData)).unwrap();
    } catch (error) {
      console.error('Failed to create permission:', error);
      throw error;
    }
  }, [dispatch]);

  // Role actions
  const getRoles = useCallback(async () => {
  try {
    const response = await dispatch(fetchRoles()).unwrap();
    // Extract the data array from the response
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    throw error;
  }
}, [dispatch]);

  const createNewRole = useCallback(async (name: string, description: string = '', permissionIds: string[] = []) => {
    try {
      return await dispatch(createRole({ name, description, permissionIds })).unwrap();
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }, [dispatch]);

  const updateExistingRole = useCallback(async (id: string, data: { name?: string; description?: string; permissionIds?: string[] }) => {
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

  // Admin user actions
  const getAdmins = useCallback(async () => {
    try {
      return await dispatch(fetchAdmins()).unwrap();
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      throw error;
    }
  }, [dispatch]);

  const createNewAdmin = useCallback(async (adminData: { email: string; firstName: string; lastName: string; roleIds: string[] }) => {
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

  const updateExistingAdmin = useCallback(async (id: string, data: { firstName?: string; lastName?: string }) => {
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

  // Helper functions
  const hasPermission = useCallback((permissionKey: string, userPermissions?: string[]): boolean => {
    // Check if user has the specified permission
    if (userPermissions) {
      return userPermissions.includes(permissionKey);
    }
    // You might want to get permissions from auth context or pass them as parameter
    return false;
  }, []);

  const hasRole = useCallback((roleName: string, userRoles?: string[]): boolean => {
    // Check if user has the specified role
    if (userRoles) {
      return userRoles.includes(roleName);
    }
    // You might want to get roles from auth context or pass them as parameter
    return false;
  }, []);

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

  // Utility actions
  const selectAdmin = useCallback((admin: AdminUser) => {
    dispatch(setSelectedAdmin(admin));
  }, [dispatch]);

  const clearSelectedAdminUser = useCallback(() => {
    dispatch(clearSelectedAdmin());
  }, [dispatch]);

  const clearAdminErrors = useCallback(() => {
    dispatch(clearAdminError());
  }, [dispatch]);

  return {
    // State
    permissions,
    roles,
    admins,
    selectedAdmin,
    loading,
    error,
    createLoading,
    createError,
    
    // Permission actions
    getPermissions,
    createNewPermission,
    
    // Role actions
    getRoles,
    createNewRole,
    updateExistingRole,
    removeRole,
    
    // Admin user actions
    getAdmins,
    createNewAdmin,
    getAdmin,
    updateExistingAdmin,
    removeAdmin,
    suspendAdminAccount,
    activateAdminAccount,
    
    // Helper functions
    hasPermission,
    hasRole,
    getAdminFullName,
    isAdminActive,
    isAdminSuspended,
    isAdminPendingDeletion,
    
    // Utility actions
    selectAdmin,
    clearSelectedAdminUser,
    clearAdminErrors,
  };
}