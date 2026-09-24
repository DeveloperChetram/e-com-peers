export class UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  slug?: string;
  isPublished?: boolean | string;
}
