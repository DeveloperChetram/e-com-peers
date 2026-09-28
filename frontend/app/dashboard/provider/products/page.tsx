import { Metadata } from 'next';
import ManageInventory from '../modules/products/ManageInventory';

export const metadata: Metadata = {
  title: 'Manage Inventory | Provider Portal | SHOP.CO',
  description: 'Manage your active product inventory, publish statuses, pricing, and listings.',
};

export default function ProviderProductsPage() {
  return <ManageInventory />;
}
