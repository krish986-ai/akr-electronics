import Link from 'next/link';
import { StoreShell } from '@/components/layout/store/StoreShell';
import { HeroCarousel } from '@/components/store/HeroCarousel';
import { StoreProductCard } from '@/components/store/StoreProductCard';
import { products, categoryTree, iotKits, FREE_DELIVERY_THRESHOLD } from '@/lib/mock/products';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export const metadata = {
  title: 'A.K.R Electronics - Premium IoT Components & Kits',
  description:
    'Buy Arduino, Raspberry Pi, ESP32, sensors and complete IoT kits online. Genuine components, GST invoices, fast pan-India delivery.',
};

const TRUST_BADGES = [
  { icon: '🛡️', title: '15-Day Warranty', text: 'Against manufacturing defects' },
  { icon: '🚚', title: `Free Delivery ₹${FREE_DELIVERY_THRESHOLD}+`, text: 'Fast pan-India shipping' },
  { icon: '💵', title: 'Cash on Delivery', text: 'Pay when it arrives' },
  { icon: '🧾', title: 'GST Invoices', text: 'On every order' },
];

const SERVICES = [
  { icon: '🎓', title: 'Student Kits', text: 'Curated kits with project guides', href: '/products?category=kits' },
  { icon: '🏢', title: 'Bulk / B2B Orders', text: 'GST-billed quotes for institutions', href: '/bulk-orders' },
  { icon: '⇄', title: 'Compare Products', text: 'Side-by-side spec comparison', href: '/compare' },
  { icon: '📦', title: 'Order Tracking', text: 'Track without logging in', href: '/track-order' },
];

export default function HomePage() {
  const featured = products.filter(p => p.isFeatured).slice(0, 4);
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  return (
    <StoreShell>
      <HeroCarousel />

      <section className="border-b border-neutral-200 bg-white">
        <div className={`${container} grid grid-cols-2 lg:grid-cols-4 gap-4 py-6`}>
          {TRUST_BADGES.map(b => (
            <div key={b.title} className="flex items-center gap-3">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{b.title}</p>
                <p className="text-xs text-neutral-500">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${container} py-12`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Shop by Category</h2>
          <Link href="/products" className="text-sm font-medium text-primary-600 hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categoryTree.map(cat => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group p-4 bg-white border border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all text-center"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="font-medium text-xs text-neutral-900 group-hover:text-primary-600">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <ProductRail title="Featured Products" items={featured} href="/products" />
      <ProductRail title="Bestsellers" items={bestsellers} href="/products" tint="bg-neutral-50" />
      <ProductRail title="New Arrivals" items={newArrivals} href="/new-arrivals" />

      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className={`${container} py-12`}>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">IoT Starter Kits</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {iotKits.map(kit => (
              <div
                key={kit.id}
                className="bg-white rounded-xl border border-neutral-200 p-6 flex gap-5 hover:shadow-lg transition-shadow"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={kit.image}
                  alt={kit.name}
                  loading="lazy"
                  className="w-28 h-28 rounded-lg object-cover shrink-0"
                />
                <div>
                  <h3 className="font-semibold text-neutral-900">{kit.name}</h3>
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{kit.description}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-bold text-lg">₹{kit.price.toLocaleString('en-IN')}</span>
                    {kit.originalPrice && (
                      <span className="text-sm text-neutral-400 line-through">
                        ₹{kit.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {kit.components.length} components · ★ {kit.rating} ({kit.reviews})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
  items: typeof products;
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
