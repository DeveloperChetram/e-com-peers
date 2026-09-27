import { Metadata } from 'next';
import { getProductById, getAllProducts, ProductItem } from '@/apis/products.api';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProductById(id);
    if (!product) {
      return { title: 'Product Details | SHOP.CO' };
    }
    return {
      title: `${product.name} | SHOP.CO`,
      description: product.description || `Buy ${product.name} at SHOP.CO`,
      openGraph: {
        title: product.name,
        description: product.description || `Buy ${product.name} at SHOP.CO`,
        images: product.imageUrl ? [product.imageUrl] : [],
      },
    };
  } catch {
    return {
      title: 'Product Details | SHOP.CO',
    };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  let product: ProductItem | null = null;
  let relatedProducts: ProductItem[] = [];

  try {
    const [productData, allProducts] = await Promise.all([
      getProductById(id).catch(() => null),
      getAllProducts().catch(() => []),
    ]);

    product = productData;
    if (Array.isArray(allProducts)) {
      relatedProducts = allProducts.filter((p: ProductItem) => p.id !== id).slice(0, 4);
    }
  } catch (error) {
    console.error('SSR Product Fetch Error:', error);
  }

  return (
    <ProductDetailClient
      id={id}
      initialProduct={product}
      initialRelatedProducts={relatedProducts}
    />
  );
}
