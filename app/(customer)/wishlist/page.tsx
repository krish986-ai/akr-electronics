'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { products } from '@/lib/mock/products';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export default function WishlistPage() {
  const wishlistItems = products.slice(0, 3);

  return (
    <div className={cn(container, 'py-8')}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-900">My Wishlist</h1>
        <p className="text-neutral-600 mt-2">Save your favorite products for later</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-neutral-600 mb-4">Your wishlist is empty</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {wishlistItems.map((product) => (
              <Card key={product.id} variant="default" className="group overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="aspect-square overflow-hidden bg-neutral-200 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 hover:text-primary-600">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mb-3">
                    <Price amount={product.price} original={product.originalPrice} size="sm" />
                  </div>
                  <div className="mb-3">
                    <Rating value={product.rating} readonly showCount count={product.reviews} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" fullWidth>
                      Add to Cart
                    </Button>
                    <Button size="sm" variant="ghost">
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-neutral-600 mb-4">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
            </p>
            <Link href="/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
