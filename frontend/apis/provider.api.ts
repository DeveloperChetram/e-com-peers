import { apiClient } from './apiClient';
import { ShipmentStatus, OrderResponse } from './orders.api';

// ─── Staff Types ─────────────────────────────────────────────────────────────

export interface ProviderStaffMember {
  id: number;
  userId: number;
  providerId: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF' | 'MEMBER';
  joinedAt?: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt?: string;
  };
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface UpdateStaffPayload {
  name?: string;
  isActive?: boolean;
  role?: string;
}

// ─── Shipment Types ──────────────────────────────────────────────────────────

export interface ShipmentLogItem {
  id: string;
  shipmentId: string;
  staffId?: number | null;
  status: ShipmentStatus;
  location?: string | null;
  note?: string | null;
  createdAt: string;
  staff?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface ShipmentItem {
  id: string;
  orderId: string;
  providerId: string;
  trackingNumber: string;
  carrier?: string | null;
  assignedStaffId?: number | null;
  assignedStaff?: {
    id: number;
    name: string;
    email: string;
  } | null;
  status: ShipmentStatus;
  currentLocation?: string | null;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: OrderResponse;
  logs: ShipmentLogItem[];
}

export interface MoveToShipmentPayload {
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  assignedStaffId?: number;
  note?: string;
  currentLocation?: string;
}

export interface AddShipmentLogPayload {
  status: ShipmentStatus;
  location?: string;
  note?: string;
}

// ─── Staff API Functions ─────────────────────────────────────────────────────

export const getProviderStaff = async (): Promise<ProviderStaffMember[]> =>
  apiClient('/provider/staff');

export const createProviderStaff = async (
  data: CreateStaffPayload
): Promise<ProviderStaffMember> =>
  apiClient('/provider/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProviderStaff = async (
  id: number,
  data: UpdateStaffPayload
): Promise<ProviderStaffMember> =>
  apiClient(`/provider/staff/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteProviderStaff = async (
  id: number
): Promise<{ message: string }> =>
  apiClient(`/provider/staff/${id}`, {
    method: 'DELETE',
  });

// ─── Shipment API Functions ──────────────────────────────────────────────────

export const moveToShipment = async (
  data: MoveToShipmentPayload
): Promise<ShipmentItem> =>
  apiClient('/provider/shipments/move', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getProviderShipments = async (params: {
  status?: string;
  search?: string;
} = {}): Promise<ShipmentItem[]> => {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  const qs = query.toString();
  return apiClient(`/provider/shipments${qs ? `?${qs}` : ''}`);
};

export const getProviderShipment = async (id: string): Promise<ShipmentItem> =>
  apiClient(`/provider/shipments/${id}`);

export interface AddShipmentLogResponse {
  message: string;
  log: ShipmentLogItem;
  shipment: ShipmentItem;
}

export const addShipmentLog = async (
  shipmentId: string,
  data: AddShipmentLogPayload
): Promise<AddShipmentLogResponse> =>
  apiClient(`/provider/shipments/${shipmentId}/logs`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ─── Return & Cancellation Approval Functions ─────────────────────────────────

export const approveReturnOrCancel = async (
  orderId: string,
  data: { approved: boolean; note?: string }
): Promise<{ message: string; order: OrderResponse }> =>
  apiClient(`/provider/orders/${orderId}/approve-return`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const processReturnReceipt = async (
  orderId: string,
  data: { action: 'RETURNED' | 'REFUNDED'; note?: string }
): Promise<{ message: string; order: OrderResponse }> =>
  apiClient(`/provider/orders/${orderId}/process-return`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
