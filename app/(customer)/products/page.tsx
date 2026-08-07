'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { safeImageSrc } from '@/lib/utils/image';
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
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(0);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(MAX_PRICE);
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

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
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, minPrice, maxPrice]);

  useEffect(() => {
    let cancelled = false;
    getCatalogPage({
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
      brand: selectedBrand || undefined,
      minPrice: debouncedMinPrice > 0 ? debouncedMinPrice : undefined,
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
  }, [debouncedSearch, selectedCategory, selectedBrand, debouncedMinPrice, debouncedMaxPrice, sortBy, currentPage]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const activeFilterCount = [
    selectedCategory,
    selectedBrand,
    searchQuery,
    minPrice > 0 || maxPrice < MAX_PRICE,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice(0);
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

      <div className="lg:hidden sticky top-28 sm:top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 mb-4 bg-white/95 backdrop-blur border-b border-neutral-200 flex items-center gap-2">
        <button
          onClick={() => setFiltersOpen(true)}
          className="relative flex-1 h-10 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 flex items-center justify-center gap-2 active:bg-neutral-50"
        >
          <span aria-hidden="true">☰</span> Filters
          {activeFilterCount > 0 && (
            <span className="grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <select
          value={sortBy}
          onChange={e => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Sort by"
          className="flex-1 h-10 rounded-lg border border-neutral-300 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <FiltersPanel
            searchQuery={searchQuery}
            onSearchChange={v => { setSearchQuery(v); setCurrentPage(1); }}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={v => { setSelectedCategory(v); setCurrentPage(1); }}
            resolveCategorySlug={resolveCategorySlug}
            brandsList={brandsList}
            selectedBrand={selectedBrand}
            onSelectBrand={v => { setSelectedBrand(v); setCurrentPage(1); }}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(lo, hi) => { setMinPrice(lo); setMaxPrice(hi); setCurrentPage(1); }}
            onReset={resetFilters}
          />
        </aside>

        <div className="lg:col-span-3">
          <div className="hidden lg:flex flex-wrap items-center justify-between gap-3 mb-6">
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
          <p className="lg:hidden text-sm text-neutral-500 mb-4">
            {total} product{total === 1 ? '' : 's'}
            {searchQuery && searchMode === 'exact' && (
              <> found for “<span className="font-medium text-neutral-900">{searchQuery}</span>”</>
            )}
            {searchQuery && searchMode && searchMode !== 'exact' && <> shown</>}
            {!searchQuery && <> found</>}
          </p>

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

      <div
        className={cn(
          'lg:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-300',
          filtersOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setFiltersOpen(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          'lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[85vh] flex flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out',
          filtersOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-neutral-200 shrink-0">
          <h2 className="font-bold text-neutral-900">Filters</h2>
          <button
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
            className="w-9 h-9 grid place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 text-lg"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <FiltersPanel
            searchQuery={searchQuery}
            onSearchChange={v => { setSearchQuery(v); setCurrentPage(1); }}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={v => { setSelectedCategory(v); setCurrentPage(1); }}
            resolveCategorySlug={resolveCategorySlug}
            brandsList={brandsList}
            selectedBrand={selectedBrand}
            onSelectBrand={v => { setSelectedBrand(v); setCurrentPage(1); }}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(lo, hi) => { setMinPrice(lo); setMaxPrice(hi); setCurrentPage(1); }}
            onReset={resetFilters}
          />
        </div>
        <div className="shrink-0 flex gap-3 px-4 py-3 border-t border-neutral-200 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={resetFilters}
            className="h-11 px-4 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Reset
          </button>
          <button
            onClick={() => setFiltersOpen(false)}
            className="flex-1 h-11 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
          >
            Show {total} Result{total === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FiltersPanel({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  resolveCategorySlug,
  brandsList,
  selectedBrand,
  onSelectBrand,
  minPrice,
  maxPrice,
  onPriceChange,
  onReset,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  categories: CategoryNode[];
  selectedCategory: string;
  onSelectCategory: (v: string) => void;
  resolveCategorySlug: (slug: string, categories: CategoryNode[]) => string;
  brandsList: { id: string; name: string; slug: string }[];
  selectedBrand: string;
  onSelectBrand: (v: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-neutral-900 text-sm mb-3">Search</h3>
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search products..."
          className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 text-sm mb-3">Category</h3>
        <div className="space-y-1">
          <FilterButton active={!selectedCategory} onClick={() => onSelectCategory('')}>
            All Categories
          </FilterButton>
          {categories.map(cat => (
            <FilterButton
              key={cat.id}
              active={resolveCategorySlug(selectedCategory, categories) === cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
            >
              {cat.image ? (
                <Image
                  src={safeImageSrc(cat.image)}
                  alt=""
                  width={16}
                  height={16}
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
          <FilterButton active={!selectedBrand} onClick={() => onSelectBrand('')}>
            All Brands
          </FilterButton>
          {brandsList.map(b => (
            <FilterButton key={b.id} active={selectedBrand === b.slug} onClick={() => onSelectBrand(b.slug)}>
              {b.name}
            </FilterButton>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 text-sm mb-3">Price Range</h3>
        <PriceRangeSlider min={0} max={MAX_PRICE} valueMin={minPrice} valueMax={maxPrice} onChange={onPriceChange} />
        <p className="text-xs text-neutral-500 mt-1">
          ₹{minPrice.toLocaleString('en-IN')} – ₹{maxPrice.toLocaleString('en-IN')}
          {maxPrice >= MAX_PRICE && '+'}
        </p>
      </div>

      <button
        onClick={onReset}
        className="w-full h-10 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
      >
        Reset Filters
      </button>
    </div>
  );
}

// Two overlapping native range inputs sharing one track — plain HTML/CSS,
// no slider library. A gap is enforced between the handles (STEP) so
// they can never cross and invert min/max. Whichever handle sits past the
// midpoint gets the higher z-index, so a handle dragged to the far side
// of its sibling stays grabbable instead of getting stuck underneath it.
const PRICE_STEP = 100;
const THUMB_CLASSES =
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none ' +
  '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full ' +
  '[&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white ' +
  '[&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer ' +
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 ' +
  '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:border-2 ' +
  '[&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer';

function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const pctMin = ((valueMin - min) / (max - min)) * 100;
  const pctMax = ((valueMax - min) / (max - min)) * 100;
  const minOnTop = pctMin > 50;

  return (
    <div className="relative h-4 flex items-center">
      <div className="absolute w-full h-1.5 rounded-full bg-neutral-200" />
      <div
        className="absolute h-1.5 rounded-full bg-primary-600"
        style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={PRICE_STEP}
        value={valueMin}
        onChange={e => onChange(Math.min(Number(e.target.value), valueMax - PRICE_STEP), valueMax)}
        aria-label="Minimum price"
        style={{ zIndex: minOnTop ? 4 : 3 }}
        className={cn(
          'absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none',
          THUMB_CLASSES
        )}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={PRICE_STEP}
        value={valueMax}
        onChange={e => onChange(valueMin, Math.max(Number(e.target.value), valueMin + PRICE_STEP))}
        aria-label="Maximum price"
        style={{ zIndex: minOnTop ? 3 : 4 }}
        className={cn(
          'absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none',
          THUMB_CLASSES
        )}
      />
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
