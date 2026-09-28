import { apiClient } from './apiClient';

export interface FavoriteResponseItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    slug?: string | null;
    isPublished?: boolean;
    isApproved?: boolean;
    categoryId?: string;
    category?: { id: string; name: string };
    provider?: { id: string; businessName: string };
  };
}

export const getFavorites = async (): Promise<FavoriteResponseItem[]> =>
  apiClient('/user/favorites');

export const toggleFavoriteApi = async (
  productId: string
): Promise<{ isFavorite: boolean; productId: string; message: string }> =>
  apiClient(`/user/favorites/${productId}`, {
    method: 'POST',
  });
