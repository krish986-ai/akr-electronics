'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { products } from '@/lib/mock/products';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export default function ShopPage() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [page]);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className={cn(container, 'py-8')}>
      <h1 className="text-4xl font-bold text-neutral-900 mb-8">Shop IoT Components</h1>

      {products.length === 0 ? (
        <div className="text-center py-12 text-neutral-600">
          No products found
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedProducts.map((product) => (
              <Card key={product.id} variant="default" className="group overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="aspect-square overflow-hidden bg-neutral-200 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {product.isNew && <Badge variant="primary" size="sm">New</Badge>}
                      {product.isBestseller && <Badge variant="secondary" size="sm">Sale</Badge>}
                    </div>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <p className="text-xs text-neutral-500 mb-1">{product.category}</p>
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
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button size="sm" fullWidth>View</Button>
                    </Link>
                    <Button size="sm" variant="ghost">♡</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    variant={page === pageNum ? 'primary' : 'outline'}
                  >
                    {pageNum}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
