import { Metadata } from 'next';
import AddProductForm from '../../modules/products/AddProductForm';

export const metadata: Metadata = {
  title: 'Add New Product | Provider Portal | SHOP.CO',
  description: 'Add and list a new product to your SHOP.CO merchant store.',
};

export default function NewProductPage() {
  return <AddProductForm />;
}
