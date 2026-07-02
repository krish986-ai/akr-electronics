'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { products, brands, categoryTree } from '@/lib/mock/products';
import { StoreProductCard } from '@/components/store/StoreProductCard';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';
const ITEMS_PER_PAGE = 12;
const MAX_PRICE = 50000;

// Mega-menu links use subcategory slugs; products carry top-level slugs.
// Resolve any slug to the top-level category it belongs to.
function resolveCategorySlug(slug: string): string {
  for (const cat of categoryTree) {
    if (cat.slug === slug) return cat.slug;
    if (cat.children?.some(sub => sub.slug === slug)) return cat.slug;
  }
  return slug;
}

function ProductsPageInner() {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') ?? '');
    setSelectedCategory(resolveCategorySlug(searchParams.get('category') ?? ''));
    setSelectedBrand(searchParams.get('brand') ?? '');
    setCurrentPage(1);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = products.filter(p => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      const matchesCategory = !selectedCategory || p.categorySlug === selectedCategory;
      const matchesBrand = !selectedBrand || p.brandSlug === selectedBrand;
      const matchesPrice = p.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        result.sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedBrand, maxPrice, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMaxPrice(MAX_PRICE);
    setSortBy('popular');
    setCurrentPage(1);
  };

  const activeCategoryName = categoryTree.find(c => c.slug === selectedCategory)?.name;

  return (
    <div className={cn(container, 'py-8')}>
      <nav className="flex items-center gap-2 mb-6 text-xs text-neutral-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <span className="text-neutral-900 font-medium">
          {activeCategoryName ?? 'All Products'}
        </span>
      </nav>

      <h1 className="text-3xl font-bold text-neutral-900 mb-8">
        {activeCategoryName ?? 'IoT Components & Kits'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm mb-3">Search</h3>
            <input
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products..."
              className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 text-sm mb-3">Category</h3>
            <div className="space-y-1">
              <FilterButton active={!selectedCategory} onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}>
                All Categories
              </FilterButton>
              {categoryTree.map(cat => (
                <FilterButton
                  key={cat.id}
                  active={selectedCategory === cat.slug}
                  onClick={() => { setSelectedCategory(cat.slug); setCurrentPage(1); }}
                >
                  {cat.icon} {cat.name}
                </FilterButton>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 text-sm mb-3">Brand</h3>
            <div className="space-y-1">
              <FilterButton active={!selectedBrand} onClick={() => { setSelectedBrand(''); setCurrentPage(1); }}>
                All Brands
              </FilterButton>
              {brands.map(b => (
                <FilterButton
                  key={b.id}
                  active={selectedBrand === b.slug}
                  onClick={() => { setSelectedBrand(b.slug); setCurrentPage(1); }}
                >
                  {b.name}
                </FilterButton>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 text-sm mb-3">Max Price</h3>
            <input
              type="range"
              min={100}
              max={MAX_PRICE}
              step={100}
              value={maxPrice}
              onChange={e => {
                setMaxPrice(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full accent-primary-600"
            />
            <p className="text-xs text-neutral-500 mt-1">Up to ₹{maxPrice.toLocaleString('en-IN')}</p>
          </div>

          <button
            onClick={resetFilters}
            className="w-full h-10 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Reset Filters
          </button>
        </aside>

        <div className="lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <p className="text-sm text-neutral-500">
              {filtered.length} product{filtered.length === 1 ? '' : 's'} found
              {searchQuery && <> for “<span className="font-medium text-neutral-900">{searchQuery}</span>”</>}
            </p>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-neutral-300 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {paginated.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {paginated.map(product => (
                  <StoreProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'w-9 h-9 rounded-lg text-sm font-medium',
                        page === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
              <p className="text-neutral-600 mb-4">No products found matching your filters.</p>
              <button
                onClick={resetFilters}
                className="h-10 px-5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
        active ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-700 hover:bg-neutral-100'
      )}
    >
      {children}
    </button>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  );
}
