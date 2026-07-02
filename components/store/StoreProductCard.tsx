import Link from 'next/link';
import { Product } from '@/lib/mock/products';

export function StoreProductCard({ product }: { product: Product }) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all flex flex-col"
    >
      <div className="relative aspect-square bg-neutral-50 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">NEW</span>
          )}
          {product.isBestseller && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              BESTSELLER
            </span>
          )}
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-wide text-neutral-400 mb-1">{product.brand}</p>
        <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors flex-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-2 text-xs text-neutral-500">
          <span className="text-amber-500">★</span>
          {product.rating}
          <span>({product.reviews})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-neutral-900">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className="text-xs text-neutral-400 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <p className="text-[10px] text-neutral-400">Incl. GST</p>
        <p className={`text-[11px] font-medium mt-1 ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </p>
      </div>
    </Link>
  );
}
