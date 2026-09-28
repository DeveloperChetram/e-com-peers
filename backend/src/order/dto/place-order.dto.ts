export class OrderItemDto {
  productId: string;
  quantity: number;
}

export class OrderAddressDto {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export class PlaceOrderDto {
  addressId?: string;
  addressDetail?: string;
  address?: OrderAddressDto;
  providerId?: string;
  items: OrderItemDto[];
  clearCart?: boolean;
}
