import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/shop/${product.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
        {product.image && (
          <div className="relative w-full h-48 bg-gray-200">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-blue-600">
              ₹{product.price.toFixed(2)}
            </span>

            <span className={`text-sm font-medium ${
              product.stock > 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t">
            <span className="text-xs text-gray-500">
              {product.category.name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
