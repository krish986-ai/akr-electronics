'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CategoryNode } from '@/lib/mock/products';

const SCROLL_STEP = 320;

export function CategoryStrip({ categories }: { categories: CategoryNode[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    const resizeObserver = new ResizeObserver(updateArrows);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      resizeObserver.disconnect();
    };
  }, [updateArrows]);

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' });
  };

  return (
    <div className="relative bg-white border border-neutral-200 rounded-2xl p-3">
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll categories left"
          onClick={() => scrollBy(-1)}
          className="hidden sm:grid absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 place-items-center rounded-full bg-white border border-neutral-200 shadow-md text-neutral-600 hover:text-primary-600 hover:border-primary-300"
        >
          ‹
        </button>
      )}

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group snap-start shrink-0 w-24 p-3 bg-white border border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all text-center"
          >
            <div className="text-2xl mb-1.5">{cat.icon}</div>
            <p className="font-medium text-[11px] text-neutral-900 group-hover:text-primary-600 line-clamp-2">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>

      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll categories right"
          onClick={() => scrollBy(1)}
          className="hidden sm:grid absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 place-items-center rounded-full bg-white border border-neutral-200 shadow-md text-neutral-600 hover:text-primary-600 hover:border-primary-300"
        >
          ›
        </button>
      )}
    </div>
  );
}
