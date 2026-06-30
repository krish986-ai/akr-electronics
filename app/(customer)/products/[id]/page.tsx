'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Rating } from '@/components/ui/Rating';
import { Price } from '@/components/ui/Price';
import { Badge } from '@/components/ui/Badge';
import { products } from '@/lib/mock/products';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className={cn(container, 'py-12 text-center')}>
        <h1 className="text-2xl font-bold text-neutral-900">Product not found</h1>
        <p className="text-neutral-600 mt-2">The product you're looking for doesn't exist.</p>
        <Link href="/products">
          <Button className="mt-6">Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(container, 'py-12')}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm text-neutral-600">
        <Link href="/" className="hover:text-neutral-900">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-neutral-900">Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="bg-neutral-200 rounded-lg overflow-hidden mb-4 aspect-square flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[product.image, product.image, product.image, product.image].map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  'bg-neutral-200 rounded-lg aspect-square flex items-center justify-center cursor-pointer border-2 transition-colors',
                  selectedImage === idx ? 'border-primary-600' : 'border-transparent'
                )}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-500 mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">{product.name}</h1>
            </div>
            <div>
              {product.isNew && <Badge variant="primary" className="mb-2">New</Badge>}
              {product.isBestseller && <Badge variant="secondary">Bestseller</Badge>}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6 pb-6 border-b border-neutral-200">
            <Rating value={product.rating} readonly showCount count={product.reviews} />
          </div>

          {/* Price */}
          <div className="mb-6">
            <Price amount={product.price} original={product.originalPrice} highlight size="lg" />
            <p className="text-sm text-neutral-600 mt-2">
              Free shipping on orders over ₹500
            </p>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-medium text-neutral-900 mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center border border-neutral-300 rounded-lg py-2"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  +
                </button>
              </div>
            </div>

            <Button size="lg" fullWidth>
              Add to Cart
            </Button>
            <Button variant="outline" size="lg" fullWidth>
              ♡ Add to Wishlist
            </Button>
          </div>

          {/* Key Features */}
          <Card className="bg-neutral-50">
            <CardHeader>
              <CardTitle className="text-lg">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="text-sm text-neutral-700">✓ Genuine product from authorized distributor</li>
                <li className="text-sm text-neutral-700">✓ 1-year manufacturer warranty</li>
                <li className="text-sm text-neutral-700">✓ 30-day easy return policy</li>
                <li className="text-sm text-neutral-700">✓ Secure checkout with SSL encryption</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Premium quality IoT component perfect for beginners and professionals. This product offers excellent reliability and long-term durability.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Whether you're building a hobby project or a professional solution, this component provides the quality and performance you need. Compatible with most popular platforms and frameworks.
              </p>
            </CardContent>
          </Card>

          {/* Related Products */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.slice(0, 2).map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="aspect-square bg-neutral-200 overflow-hidden rounded-t-lg">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">{relatedProduct.name}</h3>
                      <Price amount={relatedProduct.price} size="sm" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Stock Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Stock Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-neutral-900">In Stock</span>
              </div>
              <p className="text-sm text-neutral-600 mt-2">Only 5 items left!</p>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-neutral-900">Estimated Delivery</p>
                  <p className="text-neutral-600">3-5 business days</p>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <p className="font-medium text-neutral-900">Shipping Cost</p>
                  <p className="text-neutral-600">Free on orders over ₹500</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-neutral-900">A.K.R Electronics</p>
                  <p className="text-neutral-600">Authorized Seller</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="text-neutral-600">(2,345 reviews)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Customer Reviews</h2>
        <div className="space-y-4">
          {[
            { name: 'John Doe', rating: 5, text: 'Excellent product! Works perfectly.' },
            { name: 'Jane Smith', rating: 4, text: 'Great quality, fast delivery.' },
            { name: 'Mike Johnson', rating: 5, text: 'Highly recommended!' },
          ].map((review, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-neutral-900">{review.name}</p>
                    <Rating value={review.rating} readonly size="sm" />
                  </div>
                </div>
                <p className="text-neutral-700 text-sm">{review.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
