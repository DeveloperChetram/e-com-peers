'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setAddresses,
  addAddressState,
  updateAddressState,
  removeAddressState,
  setSelectedAddressId,
  selectAddresses,
  selectSelectedAddress,
  selectSelectedAddressId,
  AddressItem,
} from '@/redux/slices/user.slice';
import {
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  CreateAddressPayload,
  UpdateAddressPayload,
} from '@/apis/address.api';

export function useAddresses() {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(selectAddresses);
  const selectedAddress = useAppSelector(selectSelectedAddress);
  const selectedAddressId = useAppSelector(selectSelectedAddressId);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch addresses from backend
  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getUserAddresses();
      dispatch(setAddresses(data));
    } catch (err: any) {
      console.error('Failed to load addresses:', err);
      setError(err?.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && addresses.length === 0) {
      fetchAddresses();
    }
  }, [isAuthenticated, fetchAddresses, addresses.length]);

  // Create address
  const addAddress = async (payload: CreateAddressPayload): Promise<AddressItem> => {
    const created = await createUserAddress(payload);
    dispatch(addAddressState(created));
    return created;
  };

  // Update address
  const updateAddress = async (
    id: string,
    payload: UpdateAddressPayload
  ): Promise<AddressItem> => {
    const updated = await updateUserAddress(id, payload);
    dispatch(updateAddressState(updated));
    return updated;
  };

  // Delete address
  const deleteAddress = async (id: string): Promise<void> => {
    await deleteUserAddress(id);
    dispatch(removeAddressState(id));
  };

  // Select address
  const selectAddress = (id: string) => {
    dispatch(setSelectedAddressId(id));
  };

  return {
    addresses,
    selectedAddress,
    selectedAddressId,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    selectAddress,
  };
}
