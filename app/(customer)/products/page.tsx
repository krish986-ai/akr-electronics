'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { SearchInput } from '@/components/ui/Input';
import { products, categories } from '@/lib/mock/products';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
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
      default:
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return result;
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={cn(container, 'py-8')}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm text-neutral-600">
        <a href="/" className="hover:text-neutral-900">Home</a>
        <span>/</span>
        <span>Products</span>
      </div>

      <h1 className="text-4xl font-bold text-neutral-900 mb-8">IoT Components & Kits</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Search</h3>
            <SearchInput
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Category</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}
                className={cn(
                  'block w-full text-left px-3 py-2 rounded transition-colors',
                  !selectedCategory
                    ? 'bg-primary-100 text-primary-700'
                    : 'hover:bg-neutral-100'
                )}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    'block w-full text-left px-3 py-2 rounded text-sm transition-colors',
                    selectedCategory === cat.name
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-neutral-100'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Price Range</h3>
            <div className="space-y-3">
              <Input
                type="number"
                min="0"
                max="5000"
                value={priceRange[0]}
                onChange={(e) => {
                  setPriceRange([Number(e.target.value), priceRange[1]]);
                  setCurrentPage(1);
                }}
                placeholder="Min"
              />
              <Input
                type="number"
                min="0"
                max="5000"
                value={priceRange[1]}
                onChange={(e) => {
                  setPriceRange([priceRange[0], Number(e.target.value)]);
                  setCurrentPage(1);
                }}
                placeholder="Max"
              />
              <p className="text-sm text-neutral-600">
                ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <Button fullWidth variant="outline">Reset Filters</Button>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Sort & Results */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-neutral-600">
              Showing {paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} products
            </p>
            <Select
              options={[
                { label: 'Most Popular', value: 'popular' },
                { label: 'Newest', value: 'newest' },
                { label: 'Price: Low to High', value: 'price-low' },
                { label: 'Price: High to Low', value: 'price-high' },
                { label: 'Highest Rated', value: 'rating' }
              ]}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Products */}
          {paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedProducts.map(product => (
                  <Card key={product.id} variant="default" className="group overflow-hidden hover:shadow-lg transition-shadow">
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
                    <CardContent className="p-4">
                      <p className="text-xs text-neutral-500 mb-1">{product.category}</p>
                      <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">{product.name}</h3>
                      <div className="mb-3">
                        <Price amount={product.price} original={product.originalPrice} size="sm" />
                      </div>
                      <div className="mb-3">
                        <Rating value={product.rating} readonly showCount count={product.reviews} />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" fullWidth>View</Button>
                        <Button size="sm" variant="ghost">♡</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-600 mb-4">No products found matching your criteria.</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setPriceRange([0, 5000]);
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
