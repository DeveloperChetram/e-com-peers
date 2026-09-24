import { apiClient } from "./apiClient";

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: {
    id: number | string;
    name: string;
    email: string;
    role?: string;
  };
}

export interface RegisterProviderData{
  email: string;
  password: string;
  name: string;
  businessName: string;
  description?: string;
}

export const registerProvider = async (providerData: RegisterProviderData): Promise<AuthResponse> => {
  const response = await apiClient("/user/register/provider", {
    method: "POST",
    body: JSON.stringify(providerData),
  });
  return response;
}

export const registerUser = async (userData: RegisterUserData): Promise<AuthResponse> => {
  const response = await apiClient("/user/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  return response;
};

export const loginUser = async (userData: LoginUserData): Promise<AuthResponse> => {
  const response = await apiClient("/user/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  return response;
};