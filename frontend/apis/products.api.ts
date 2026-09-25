import { apiClient } from "./apiClient";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  slug?: string | null;
  isPublished: boolean;
  isApproved: boolean;
  categoryId: string;
  providerId?: string;
  category?: CategoryItem;
  provider?: {
    id: string;
    businessName: string;
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  image: FileList | null;
  categoryId: string;
  providerId?: string;
  isPublished?: boolean;
}

export const getAllProducts = async () => {
  try {
    const response = await apiClient('/products');
    return response;
  } catch (error) {
    console.error('Failed to get products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<ProductItem> => {
  const response = await apiClient(`/products/${id}`);
  return response;
};

export const getMyProducts = async (params?: {
  search?: string;
  categoryId?: string;
  status?: string;
}): Promise<ProductItem[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.status && params.status !== 'all') query.append('status', params.status);

    const qs = query.toString();
    const endpoint = `/products/my${qs ? `?${qs}` : ''}`;
    const response = await apiClient(endpoint);
    return response;
  } catch (error) {
    console.error('Failed to get my products:', error);
    throw error;
  }
};

export const getMyProduct = async (id: string): Promise<ProductItem> => {
  const response = await apiClient(`/products/my/${id}`);
  return response;
};

export const createProduct = async (productData: FormData) => {
  const response = await apiClient('/products', {
    method: 'POST',
    body: productData,
  });
  return response;
};

export const updateProduct = async (id: string, productData: FormData) => {
  const response = await apiClient(`/products/${id}`, {
    method: 'PATCH',
    body: productData,
  });
  return response;
};

export const togglePublishProduct = async (id: string, isPublished?: boolean) => {
  const response = await apiClient(`/products/${id}/publish`, {
    method: 'PATCH',
    body: JSON.stringify(isPublished !== undefined ? { isPublished } : {}),
  });
  return response;
};

export const deleteProduct = async (id: string) => {
  const response = await apiClient(`/products/${id}`, {
    method: 'DELETE',
  });
  return response;
};

export const getCategories = async (): Promise<CategoryItem[]> => {
  try {
    const response = await apiClient('/categories');
    return response;
  } catch (error) {
    console.error('Failed to get categories:', error);
    return [];
  }
};