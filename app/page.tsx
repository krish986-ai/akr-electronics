import Link from 'next/link';
import { StoreShell } from '@/components/layout/store/StoreShell';
import { HeroCarousel } from '@/components/store/HeroCarousel';
import { CategoryStrip } from '@/components/store/CategoryStrip';
import { StoreProductCard } from '@/components/store/StoreProductCard';
import { FloatingPartnerWidget } from '@/components/FloatingPartnerWidget';
import { Product } from '@/lib/mock/products';
import { getServerBanners, getServerProducts, getServerCategories } from '@/lib/data/server-catalog';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

// Served statically from the Vercel CDN; admin catalog writes trigger
// revalidatePath('/') so edits still show up right after saving.
export const revalidate = 300;

export const metadata = {
  title: 'A.K.R Electronics - Premium IoT Components & Kits',
  description:
    'Buy Arduino, Raspberry Pi, ESP32, sensors and complete IoT kits online. Genuine components, GST invoices, fast pan-India delivery.',
};

const SERVICES = [
  { icon: '🎓', title: 'Student Kits', text: 'Curated kits with project guides', href: '/products?category=kits' },
  { icon: '🏢', title: 'Bulk / B2B Orders', text: 'GST-billed quotes for institutions', href: '/bulk-orders' },
  { icon: '⇄', title: 'Compare Products', text: 'Side-by-side spec comparison', href: '/compare' },
  { icon: '📦', title: 'Order Tracking', text: 'Track without logging in', href: '/track-order' },
];

export default async function HomePage() {
  const [products, categoryTree, banners] = await Promise.all([
    getServerProducts(),
    getServerCategories(),
    getServerBanners(),
  ]);
  const featured = products.filter(p => p.isFeatured).slice(0, 4);
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);
  const starterKits = products.filter(p => p.isKit).slice(0, 4);

  return (
    <StoreShell>
      <FloatingPartnerWidget />

      <HeroCarousel banners={banners.filter(b => b.active !== false)} />

      <section className={`${container} py-12`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Shop by Category</h2>
          <Link href="/products" className="text-sm font-medium text-primary-600 hover:underline">
            View All →
          </Link>
        </div>
        <CategoryStrip categories={categoryTree} />
      </section>

      <ProductRail title="Featured Products" items={featured} href="/products" />
      <ProductRail title="Bestsellers" items={bestsellers} href="/products" tint="bg-neutral-50" />
      <ProductRail title="New Arrivals" items={newArrivals} href="/new-arrivals" />

      <ProductRail title="IoT Starter Kits" items={starterKits} href="/products?category=iot-starter-kits" tint="bg-neutral-50" />

      <section className={`${container} py-12`}>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Why Makers Choose AKR</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map(s => (
            <Link
              key={s.title}
              href={s.href}
              className="p-5 bg-white border border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="font-semibold text-sm text-neutral-900">{s.title}</p>
              <p className="text-xs text-neutral-500 mt-1">{s.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </StoreShell>
  );
}

function ProductRail({
  title,
  items,
  href,
  tint,
}: {
  title: string;
  items: Product[];
  href: string;
  tint?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className={tint ? `${tint} border-y border-neutral-200` : ''}>
      <div className={`${container} py-12`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
          <Link href={href} className="text-sm font-medium text-primary-600 hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(p => (
            <StoreProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
