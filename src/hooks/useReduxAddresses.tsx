import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';
import { type RootState } from '@/redux/store';
import {
  fetchAddresses,
  fetchAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  setAddresses,
  setCurrentAddress,
  setSelectedAddress,
  clearAddresses,
  clearError,
  clearSelectedAddress,
  type Address,
  type CreateAddressDTO,
  type UpdateAddressDTO,
} from '@/redux/slices/addressesSlice';

// Define the dispatch type that can handle thunks
export type AppThunkDispatch = ThunkDispatch<RootState, any, AnyAction>;

export const useReduxAddresses = () => {
  const dispatch = useDispatch<AppThunkDispatch>();
  const {
    addresses,
    loading,
    error,
    currentAddress,
    loadingCurrent,
    selectedAddress,
    loadingSelected,
  } = useSelector((state: RootState) => state.addresses);

  return {
    // State
    addresses,
    loading,
    error,
    currentAddress,
    loadingCurrent,
    selectedAddress,
    loadingSelected,

    // Actions - Fetch
    getAddresses: () => dispatch(fetchAddresses()),
    getAddressById: (addressId: string) => dispatch(fetchAddressById(addressId)),
    
    // Actions - CRUD
    addAddress: (addressData: CreateAddressDTO) => dispatch(createAddress(addressData)),
    editAddress: (updateData: UpdateAddressDTO) => dispatch(updateAddress(updateData)),
    removeAddress: (addressId: string) => dispatch(deleteAddress(addressId)),
    
    // Actions - Default
    setAddressAsDefault: (addressId: string) => dispatch(setDefaultAddress(addressId)),
    
    // Manual state setters
    setAddresses: (addresses: Address[]) => dispatch(setAddresses(addresses)),
    setCurrentAddress: (address: Address | null) => dispatch(setCurrentAddress(address)),
    setSelectedAddress: (address: Address | null) => dispatch(setSelectedAddress(address)),
    clearAddresses: () => dispatch(clearAddresses()),
    clearError: () => dispatch(clearError()),
    clearSelectedAddress: () => dispatch(clearSelectedAddress()),

    // Helper methods
    getDefaultAddress: () => addresses.find(addr => addr.isDefault),
    getAddressFromList: (id: string) => addresses.find(addr => addr.id === id),
    getNonDefaultAddresses: () => addresses.filter(addr => !addr.isDefault),
    
    // Check if user has addresses
    hasAddresses: addresses.length > 0,
    hasDefaultAddress: addresses.some(addr => addr.isDefault),
    hasSelectedAddress: selectedAddress !== null,
    
    // Check if an address exists in the list
    addressExists: (id: string) => addresses.some(addr => addr.id === id),
    
    // Get address count
    addressCount: addresses.length,
  };
};