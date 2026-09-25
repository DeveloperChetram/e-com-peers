export class SyncCartItemDto {
  productId: string;
  quantity: number;
}

export class SyncCartDto {
  items: SyncCartItemDto[];
}
