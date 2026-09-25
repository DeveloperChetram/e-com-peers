import { apiClient } from './apiClient';

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
  isProvider?: boolean;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  redirectTo?: string;
  user: {
    id: number | string;
    name: string;
    email: string;
    role?: string;
  };
}

export interface RegisterProviderData {
  email: string;
  password: string;
  name: string;
  businessName: string;
  description?: string;
}

export const registerProvider = async (
  providerData: RegisterProviderData
): Promise<AuthResponse> =>
  apiClient('/user/register/provider', {
    method: 'POST',
    body: JSON.stringify(providerData),
  });

export const registerUser = async (
  userData: RegisterUserData
): Promise<AuthResponse> =>
  apiClient('/user/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const loginUser = async (
  userData: LoginUserData
): Promise<AuthResponse> =>
  apiClient('/user/login', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const loginAdmin = async (
  adminData: LoginUserData
): Promise<AuthResponse> =>
  apiClient('/admin/login', {
    method: 'POST',
    body: JSON.stringify(adminData),
  });

export const getUserProfile = async (): Promise<any> =>
  apiClient('/user/profile');