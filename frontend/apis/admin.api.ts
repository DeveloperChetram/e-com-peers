import { apiClient } from './apiClient';

export interface AdminStats {
  users: number;
  providers: number;
  products: number;
  orders: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'PROVIDER' | 'PROVIDER_STAFF';
  isActive: boolean;
  createdAt: string;
  provider?: {
    id: string;
    businessName: string;
    status: string;
  } | null;
}

export interface AdminProvider {
  id: string;
  userId: number;
  businessName: string;
  description?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isPublished: boolean;
  isApproved: boolean;
  categoryId: string;
  providerId?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  provider?: {
    id: string;
    businessName: string;
  } | null;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
}

// =========================
// STATS
// =========================

export const getAdminStats = async (): Promise<AdminStats> => {
  return apiClient('/admin/stats');
};

// =========================
// USERS
// =========================

export const getAdminUsers = async (params?: {
  search?: string;
  role?: string;
  isActive?: boolean | string;
  page?: number;
  limit?: number;
}): Promise<{ data: AdminUser[]; total: number; page: number; limit: number; totalPages: number }> => {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.role && params.role !== 'ALL') query.append('role', params.role);
  if (params?.isActive !== undefined && params.isActive !== 'ALL') {
    query.append('isActive', String(params.isActive));
  }
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));

  const qs = query.toString();
  return apiClient(`/admin/users${qs ? `?${qs}` : ''}`);
};

export const getAdminUser = async (id: number): Promise<AdminUser> => {
  return apiClient(`/admin/users/${id}`);
};

export const updateAdminUserStatus = async (id: number, isActive: boolean) => {
  return apiClient(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
};

export const updateAdminUserRole = async (id: number, role: string) => {
  return apiClient(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
};

export const deleteAdminUser = async (id: number) => {
  return apiClient(`/admin/users/${id}`, {
    method: 'DELETE',
  });
};

// =========================
// PROVIDERS
// =========================

export const getAdminProviders = async (params?: {
  search?: string;
  status?: string;
  isActive?: boolean | string;
  page?: number;
  limit?: number;
}): Promise<{ data: AdminProvider[]; total: number; page: number; limit: number; totalPages: number }> => {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  if (params?.isActive !== undefined && params.isActive !== 'ALL') {
    query.append('isActive', String(params.isActive));
  }
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));

  const qs = query.toString();
  return apiClient(`/admin/providers${qs ? `?${qs}` : ''}`);
};

export const getAdminProvider = async (id: string | number): Promise<AdminProvider> => {
  return apiClient(`/admin/providers/${id}`);
};

export const updateAdminProviderStatus = async (
  id: string | number,
  data: { isActive?: boolean; status?: string },
) => {
  return apiClient(`/admin/providers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const approveAdminProvider = async (id: string | number) => {
  return apiClient(`/admin/providers/${id}/approve`, {
    method: 'PATCH',
  });
};

export const rejectAdminProvider = async (id: string | number) => {
  return apiClient(`/admin/providers/${id}/reject`, {
    method: 'PATCH',
  });
};

export const deleteAdminProvider = async (id: string | number) => {
  return apiClient(`/admin/providers/${id}`, {
    method: 'DELETE',
  });
};

// =========================
// PRODUCTS & APPROVALS
// =========================

export const getAdminProducts = async (params?: {
  search?: string;
  isApproved?: boolean | string;
  isPublished?: boolean | string;
  categoryId?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: AdminProduct[]; total: number; page: number; limit: number; totalPages: number }> => {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.isApproved !== undefined && params.isApproved !== 'ALL') {
    query.append('isApproved', String(params.isApproved));
  }
  if (params?.isPublished !== undefined && params.isPublished !== 'ALL') {
    query.append('isPublished', String(params.isPublished));
  }
  if (params?.categoryId && params.categoryId !== 'ALL') {
    query.append('categoryId', params.categoryId);
  }
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));

  const qs = query.toString();
  return apiClient(`/admin/products${qs ? `?${qs}` : ''}`);
};

export const getAdminProduct = async (id: string): Promise<AdminProduct> => {
  return apiClient(`/admin/products/${id}`);
};

export const approveAdminProduct = async (id: string) => {
  return apiClient(`/admin/products/${id}/approve`, {
    method: 'PATCH',
  });
};

export const rejectAdminProduct = async (id: string) => {
  return apiClient(`/admin/products/${id}/reject`, {
    method: 'PATCH',
  });
};

export const deleteAdminProduct = async (id: string) => {
  return apiClient(`/admin/products/${id}`, {
    method: 'DELETE',
  });
};

// =========================
// CATEGORIES
// =========================

export const getAdminCategories = async (): Promise<AdminCategory[]> => {
  return apiClient('/admin/categories');
};

export const getAdminCategory = async (id: string): Promise<AdminCategory> => {
  return apiClient(`/admin/categories/${id}`);
};

export const getAdminCategoryProducts = async (
  id: string,
  params?: {
    search?: string;
    isApproved?: boolean | string;
    isPublished?: boolean | string;
  },
): Promise<{ category: AdminCategory; products: AdminProduct[]; total: number }> => {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.isApproved !== undefined && params.isApproved !== 'ALL') {
    query.append('isApproved', String(params.isApproved));
  }
  if (params?.isPublished !== undefined && params.isPublished !== 'ALL') {
    query.append('isPublished', String(params.isPublished));
  }

  const qs = query.toString();
  return apiClient(`/admin/categories/${id}/products${qs ? `?${qs}` : ''}`);
};

export const createAdminCategory = async (data: {
  name: string;
  slug?: string;
}): Promise<AdminCategory> => {
  return apiClient('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateAdminCategory = async (
  id: string,
  data: {
    name?: string;
    slug?: string;
  },
): Promise<AdminCategory> => {
  return apiClient(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteAdminCategory = async (
  id: string,
): Promise<{ message: string }> => {
  return apiClient(`/admin/categories/${id}`, {
    method: 'DELETE',
  });
};

