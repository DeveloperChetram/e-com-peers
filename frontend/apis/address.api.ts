import { apiClient } from './apiClient';

export interface AddressItem {
  id: string;
  userId: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CreateAddressPayload {
  street: string;
  city: string;
  state?: string;
  zip: string;
  country?: string;
}

export interface UpdateAddressPayload {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export const getUserAddresses = async (): Promise<AddressItem[]> => {
  return apiClient('/user/addresses');
};

export const createUserAddress = async (
  data: CreateAddressPayload
): Promise<AddressItem> => {
  return apiClient('/user/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateUserAddress = async (
  id: string,
  data: UpdateAddressPayload
): Promise<AddressItem> => {
  return apiClient(`/user/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteUserAddress = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  return apiClient(`/user/addresses/${id}`, {
    method: 'DELETE',
  });
};
