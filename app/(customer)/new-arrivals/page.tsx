import { products } from '@/lib/mock/products';
import { StoreProductCard } from '@/components/store/StoreProductCard';

export const metadata = {
  title: 'New Arrivals - A.K.R Electronics',
  description: 'The latest IoT components, boards and kits added to the AKR Electronics store.',
};

export default function NewArrivalsPage() {
  const newProducts = products.filter(p => p.isNew);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-neutral-900">✨ New Arrivals</h1>
      <p className="text-sm text-neutral-500 mt-2 mb-8">Fresh stock, just added to the catalog.</p>
      {newProducts.length === 0 ? (
        <p className="text-neutral-500">No new products right now — check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newProducts.map(p => (
            <StoreProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
