import { apiClient } from './apiClient';

// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface PlaceOrder {
  addressId?: string;
  addressDetail?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  providerId?: string;
  items: OrderItem[];
  clearCart?: boolean;
}

export interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  productDetail: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    slug?: string | null;
  };
}

export interface OrderResponse {
  id: string;
  userId: number;
  providerId: string;
  addressId: string;
  addressDetail: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
  provider?: {
    id: string;
    businessName: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  address?: {
    id: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface OrdersListResponse {
  data: OrderResponse[];
  total: number;
  page: number;
  limit: number;
}

// ─── API Functions ───────────────────────────────────────────────────────────

export const placeOrder = async (data: PlaceOrder): Promise<OrderResponse> =>
  apiClient('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getMyOrders = async (
  page = 1,
  limit = 10,
  status?: OrderStatus
): Promise<OrdersListResponse> =>
  apiClient(`/orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`);

export const getOrder = async (id: string): Promise<OrderResponse> =>
  apiClient(`/orders/${id}`);

export const cancelOrder = async (
  id: string
): Promise<{ message: string; order: OrderResponse }> =>
  apiClient(`/orders/${id}/cancel`, {
    method: 'PATCH',
  });

// ─── Provider Order APIs ──────────────────────────────────────────────────────

export const getProviderOrders = async (
  page = 1,
  limit = 10,
  status?: OrderStatus
): Promise<OrdersListResponse & { totalPages: number }> =>
  apiClient(`/orders/provider/all?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`);

export const getProviderOrder = async (id: string): Promise<OrderResponse> =>
  apiClient(`/orders/provider/${id}`);

export const updateProviderOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<{ message: string; order: OrderResponse }> =>
  apiClient(`/orders/provider/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// ─── Admin Order APIs ─────────────────────────────────────────────────────────

export const getAdminOrders = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  providerId?: string;
  userId?: number;
  search?: string;
} = {}): Promise<OrdersListResponse & { totalPages: number }> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.status) query.append('status', params.status);
  if (params.providerId) query.append('providerId', params.providerId);
  if (params.userId) query.append('userId', String(params.userId));
  if (params.search) query.append('search', params.search);

  const qs = query.toString();
  return apiClient(`/orders/admin/all${qs ? `?${qs}` : ''}`);
};

export const getAdminOrder = async (id: string): Promise<OrderResponse> =>
  apiClient(`/orders/admin/${id}`);

export const updateAdminOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<{ message: string; order: OrderResponse }> =>
  apiClient(`/orders/admin/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const deleteAdminOrder = async (
  id: string
): Promise<{ message: string }> =>
  apiClient(`/orders/admin/${id}`, {
    method: 'DELETE',
  });
