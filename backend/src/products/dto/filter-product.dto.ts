export class FilterProductDto {
  name?: string;          // search by name (partial match)
  categoryId?: string;    // filter by category
  providerId?: string;    // filter by provider
  minPrice?: number;      // minimum price
  maxPrice?: number;      // maximum price
  page?: number;          // page number (default: 1)
  limit?: number;         // items per page (default: 10)
}
