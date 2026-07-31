'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { brands, categoryTree, CategoryNode, Product } from '@/lib/mock/products';
import { getCatalogPage, getCategories, getBrands } from '@/lib/data/catalog';
import { StoreProductCard } from '@/components/store/StoreProductCard';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';
const ITEMS_PER_PAGE = 12;
const MAX_PRICE = 50000;

// Mega-menu links use subcategory slugs; products carry top-level slugs.
// A subcategory can share its slug with an unrelated top-level category
// (e.g. a "Resistor" subcategory under "Basic Electronic Components" next
// to a standalone top-level "Resistor" category), so an exact top-level
// match must always win before falling back to a subcategory lookup.
function resolveCategorySlug(slug: string, categories: CategoryNode[]): string {
  if (categories.some(cat => cat.slug === slug)) return slug;
  for (const cat of categories) {
    if (cat.children?.some(sub => sub.slug === slug)) return cat.slug;
  }
  return slug;
}

// Windowed page list so huge catalogs don't render hundreds of buttons.
function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = [1, current - 1, current, current + 1, total]
    .filter(p => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const pages: (number | '…')[] = [];
  let prev = 0;
  for (const p of wanted) {
    if (p === prev) continue;
    if (p - prev > 1) pages.push('…');
    pages.push(p);
    prev = p;
  }
  return pages;
}

function ProductsPageInner() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [searchMode, setSearchMode] = useState<'exact' | 'fuzzy' | 'related' | 'popular' | undefined>(undefined);
  const [categories, setCategories] = useState(categoryTree);
  const [brandsList, setBrandsList] = useState(brands);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(MAX_PRICE);
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    Promise.all([getCategories(), getBrands()]).then(([cats, brs]) => {
      if (cats.length) setCategories(cats);
      if (brs.length) setBrandsList(brs);
    });
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') ?? '');
    setSelectedCategory(searchParams.get('category') ?? '');
    setSelectedBrand(searchParams.get('brand') ?? '');
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setDebouncedMaxPrice(maxPrice);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, maxPrice]);

  useEffect(() => {
    let cancelled = false;
    getCatalogPage({
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
      brand: selectedBrand || undefined,
      maxPrice: debouncedMaxPrice < MAX_PRICE ? debouncedMaxPrice : undefined,
      sort: sortBy,
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
    })
      .then(result => {
        if (cancelled) return;
        setProducts(result.items);
        setTotal(result.total);
        setSearchMode(result.searchMode);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, selectedCategory, selectedBrand, debouncedMaxPrice, sortBy, currentPage]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMaxPrice(MAX_PRICE);
    setSortBy('popular');
    setCurrentPage(1);
  };

  const activeCategoryName = categories.find(
    c => c.slug === resolveCategorySlug(selectedCategory, categories)
  )?.name;

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
              {categories.map(cat => (
                <FilterButton
                  key={cat.id}
                  active={resolveCategorySlug(selectedCategory, categories) === cat.slug}
                  onClick={() => { setSelectedCategory(cat.slug); setCurrentPage(1); }}
                >
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt=""
                      className="inline-block w-4 h-4 rounded object-cover mr-1 align-text-bottom"
                    />
                  ) : (
                    <>{cat.icon} </>
                  )}
                  {cat.name}
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
              {brandsList.map(b => (
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
              {total} product{total === 1 ? '' : 's'}
              {searchQuery && searchMode === 'exact' && (
                <> found for “<span className="font-medium text-neutral-900">{searchQuery}</span>”</>
              )}
              {searchQuery && searchMode && searchMode !== 'exact' && <> shown</>}
              {!searchQuery && <> found</>}
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

          {searchQuery && searchMode && searchMode !== 'exact' && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              {searchMode === 'fuzzy' && (
                <>No exact matches for “{searchQuery}” — showing close matches instead.</>
              )}
              {searchMode === 'related' && (
                <>No exact matches for “{searchQuery}” — here are related products you might like.</>
              )}
              {searchMode === 'popular' && (
                <>Couldn't find anything for “{searchQuery}” — here are some popular picks instead.</>
              )}
            </div>
          )}

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {products.map(product => (
                  <StoreProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {pageNumbers(currentPage, totalPages).map((page, i) =>
                    page === '…' ? (
                      <span key={`gap-${i}`} className="w-9 h-9 grid place-items-center text-sm text-neutral-400">
                        …
                      </span>
                    ) : (
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
                    )
                  )}
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
