import { Metadata } from 'next';
import Overview from './modules/overview/Overview';

export const metadata: Metadata = {
  title: 'Provider Dashboard | SHOP.CO',
  description: 'Manage products, view orders, and track store performance on SHOP.CO.',
};

export default function ProviderPage() {
  return <Overview />;
}
