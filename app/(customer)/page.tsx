import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { products, categories, iotKits } from '@/lib/mock/products';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export const metadata = {
  title: 'A.K.R Electronics - Premium IoT Components & Kits',
  description: 'Buy Arduino, Raspberry Pi, sensors, and complete IoT kits online. Premium quality IoT components for makers and professionals.',
};

export default function HomePage() {
  const featuredProducts = products.filter(p => p.isBestseller).slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-400 text-white py-20 md:py-32">
        <div className={container}>
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              IoT Components for Every Project
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-50">
              Premium Arduino boards, Raspberry Pi, sensors, and complete IoT kits. Everything you need to bring your ideas to life.
            </p>
            <div className="flex gap-4">
              <Button size="lg" variant="secondary">
                Shop Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:bg-opacity-10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className={cn(container, 'py-16')}>
        <h2 className="text-3xl font-bold text-neutral-900 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <a
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group p-4 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors text-center"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="font-medium text-sm text-neutral-900 group-hover:text-primary-600">{cat.name}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className={cn(container, 'py-16')}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-neutral-900">Bestsellers</h2>
          <a href="/products" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className={cn(container, 'py-16')}>
        <h2 className="text-3xl font-bold text-neutral-900 mb-8">New Arrivals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* IoT Kits Section */}
      <section className={cn(container, 'py-16')}>
        <h2 className="text-3xl font-bold text-neutral-900 mb-8">IoT Starter Kits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {iotKits.map(kit => (
            <Card key={kit.id} variant="elevated">
              <div className="aspect-video overflow-hidden rounded-t-lg bg-neutral-200">
                <img src={kit.image} alt={kit.name} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{kit.name}</h3>
                <p className="text-neutral-600 text-sm mb-4">{kit.description}</p>

                <div className="mb-4">
                  <p className="text-sm font-medium text-neutral-900 mb-2">Includes:</p>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    {kit.components.slice(0, 4).map((comp, i) => (
                      <li key={i}>• {comp}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <Price amount={kit.price} original={kit.originalPrice} highlight />
                    <Rating value={kit.rating} readonly showCount count={kit.reviews} />
                  </div>
                  <Button size="sm">Add to Cart</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={cn(container, 'py-16')}>
        <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">Why Choose A.K.R Electronics?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '✓', title: 'Genuine Products', desc: 'Authentic components from trusted manufacturers' },
            { icon: '🚚', title: 'Fast Delivery', desc: 'Quick shipping across India' },
            { icon: '💰', title: 'Best Prices', desc: 'Competitive pricing with regular discounts' },
            { icon: '🛡️', title: 'Warranty & Support', desc: '1-year warranty on most products' }
          ].map((item, i) => (
            <div key={i} className="text-center p-6 bg-neutral-50 rounded-lg">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-neutral-900 mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className={cn(container, 'py-16')}>
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">Get Exclusive Offers</h2>
          <p className="text-neutral-600 mb-6">Subscribe to our newsletter for latest products and special discounts.</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={cn(container, 'py-16')}>
        <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            { q: 'What is your delivery time?', a: 'We deliver within 3-5 business days across India.' },
            { q: 'Do you provide warranty?', a: 'Yes, most products come with 1-year manufacturer warranty.' },
            { q: 'Can I return a product?', a: 'Yes, we offer 30-day easy returns for unopened products.' },
            { q: 'Do you ship internationally?', a: 'Currently, we ship only within India. International shipping coming soon.' }
          ].map((item, i) => (
            <div key={i} className="border border-neutral-200 rounded-lg p-4">
              <h3 className="font-semibold text-neutral-900 mb-2">{item.q}</h3>
              <p className="text-neutral-600 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: typeof products[0] }) {
  return (
    <Card variant="default" className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden bg-neutral-200 relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {product.isNew && <Badge variant="primary" size="sm">New</Badge>}
          {product.isBestseller && <Badge variant="secondary" size="sm">Bestseller</Badge>}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">{product.name}</h3>
        <div className="mb-3">
          <Price amount={product.price} original={product.originalPrice} size="sm" />
        </div>
        <div className="mb-3">
          <Rating value={product.rating} readonly showCount count={product.reviews} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" fullWidth>Add to Cart</Button>
          <Button size="sm" variant="ghost">♡</Button>
        </div>
      </div>
    </Card>
  );
}
